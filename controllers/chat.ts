import { PrismaClient } from '@prisma/client'
import express, { Request, Response } from "express";
const prisma = new PrismaClient()

export const getAllMessagesInRoom = async(req: Request, res: Response) => {
    const roomId: number = parseInt(req.params.roomId);

    try {
        // Find the room
        const room = await prisma.room.findUnique({
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
    } catch (error) {
        // Handle any errors
        console.error('Error retrieving messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
