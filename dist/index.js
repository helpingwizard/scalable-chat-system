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
const RedisSubscriptionManager_1 = require("./subscriptions/RedisSubscriptionManager");
const app = (0, express_1.default)();
const port = 3000;
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const users = {};
/*
users = {
    [user1, user2, user3] : {
        room : 2,
        ws
    },
    [user4, user1, user7] : {
        room : 1,
        ws
    }
}
*/
let counter = 0;
wss.on("connection", (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    const wsId = counter++;
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        if (data.type === "join") {
            users[wsId] = {
                room: data.payload.roomId,
                ws
            };
            RedisSubscriptionManager_1.RedisSubscriptionManager.getInstance().subscribe(wsId.toString(), data.payload.roomId, ws);
        }
        if (data.type === "message") {
            const roomId = users[wsId].room;
            const message = data.payload.message;
            RedisSubscriptionManager_1.RedisSubscriptionManager.getInstance().addChatMessage(roomId, message);
        }
    });
    ws.on("disconnect", () => {
        RedisSubscriptionManager_1.RedisSubscriptionManager.getInstance().unsubscribe(wsId.toString(), users[wsId].room);
    });
}));
server.listen(port);
