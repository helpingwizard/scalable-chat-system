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
exports.createRoom = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const newRoom = yield prisma.room.create({
            data: {
                name: name
            }
        });
        res.status(201).json(newRoom);
    }
    catch (error) {
        res.status(500).json({ error: 'Could not create room' });
    }
});
exports.createRoom = createRoom;
// export const joinRoom = async (req: Request, res: Response) => {
//     const roomId: number = parseInt(req.params.roomId);
//     const { username } = req.body;
//     try {
//         // Find the user and room
//         const user = await prisma.user.findUnique({
//             where: {
//                 username: username
//             }
//         });
//         const room = await prisma.room.findUnique({
//             where: {
//                 id: roomId
//             }
//         });
//         // If user or room doesn't exist, return error
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         if (!room) {
//             return res.status(404).json({ error: 'Room not found' });
//         }
//         await prisma.user.update({
//             where: { id: user.id },
//             data: { rooms: { connect: { id: roomId } } }
//         }),
//         await prisma.room.update({
//             where: { id: roomId },
//             data: { users: { connect: { id: user.id } } }
//         })
//         // Return the updated user
//         res.status(200).json(user);
//     } catch (error) {
//         console.error('Error joining room:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };
