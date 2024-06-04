"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const RedisSubscriptionManager_1 = require("./subscriptions/RedisSubscriptionManager");
const client_1 = require("@prisma/client");
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const roomRouter_1 = __importDefault(require("./routes/roomRouter"));
const chatRouter_1 = __importDefault(require("./routes/chatRouter"));
const app = (0, express_1.default)();
const port = 3001;
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
app.use('/user', userRouter_1.default);
app.use('/room', roomRouter_1.default);
app.use('/chats', chatRouter_1.default);
wss.on("connection", (ws) => __awaiter(void 0, void 0, void 0, function* () {
    let userId = 0;
    let roomId = 0;
    let username = "";
    ws.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        const data = JSON.parse(message);
        if (data.type === "join") {
            username = data.payload.username;
            roomId = data.payload.roomId;
            userId = (yield getUserId(username));
            if (userId !== null) {
                const existingUserRoom = yield prisma.userRooms.findUnique({
                    where: {
                        userId_roomId: {
                            userId: userId,
                            roomId: roomId,
                        },
                    },
                });
                if (!existingUserRoom) {
                    yield prisma.userRooms.create({
                        data: {
                            userId: userId,
                            roomId: roomId,
                        },
                    });
                    console.log(`User ${userId} joined room ${roomId}`);
                }
                else {
                    console.log(`User ${userId} is already part of room ${roomId}`);
                }
                RedisSubscriptionManager_1.RedisSubscriptionManager.getInstance().subscribe(userId.toString(), roomId.toString(), ws);
            }
            else {
                console.log(`User ${username} not found.`);
            }
        }
        if (data.type === "message") {
            roomId = data.payload.roomId;
            const content = data.payload.content;
            const username = data.payload.username;
            const userId = (yield getUserId(username));
            console.log(`Attempting to create message for userId: ${userId}, roomId: ${roomId}`);
            // Check if roomId exists in the Room table
            const roomExists = yield prisma.room.findUnique({
                where: { id: roomId },
            });
            if (roomExists) {
                const newMessage = yield prisma.message.create({
                    data: {
                        userId: userId,
                        roomId: roomId,
                        content: data.payload.content,
                        createdAt: new Date(),
                    },
                });
                RedisSubscriptionManager_1.RedisSubscriptionManager.getInstance().addChatMessage(roomId.toString(), JSON.stringify({
                    type: "message",
                    payload: {
                        userId: userId,
                        content: newMessage.content,
                        createdAt: newMessage.createdAt,
                    },
                }));
            }
            else {
                console.log(`Room ${roomId} does not exist.`);
            }
        }
    }));
}));
function getUserId(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { username },
            select: {
                id: true
            }
        });
        return user ? user.id : null;
    });
}
app.listen(3000, () => {
    console.log(`Express server is listening on port ${port}`);
});
server.listen(3001, () => {
    console.log(`Server is listening on port ${port}`);
});
