import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from "express";
const prisma = new PrismaClient()

export const createRoom = async (req: Request, res: Response) => {
    try {
        const { name } = req.body; 
        const newRoom = await prisma.room.create({
            data: {
                name: name
            }
        });
        res.status(201).json(newRoom); 
    } catch (error) {
        res.status(500).json({ error: 'Could not create room' });
    }
};

export const getRooms = async(req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany();
        res.json(rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}

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
