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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMessagesInRoom = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllMessagesInRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = parseInt(req.params.roomId);
    try {
        // Find the room
        const room = yield prisma.room.findUnique({
            where: {
                id: roomId
            },
            include: {
                messages: true
            }
        });
        // If room doesn't exist, return error
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        // Return all messages in the room
        res.status(200).json(room.messages);
    }
    catch (error) {
        // Handle any errors
        console.error('Error retrieving messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAllMessagesInRoom = getAllMessagesInRoom;
