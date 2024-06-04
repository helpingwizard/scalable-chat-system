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

export const joinRoom = async(req: Request, res: Response) => {
    const roomId: number = parseInt(req.params.roomId);
    const { username } = req.body;

    // Find the user
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });

    // If user doesn't exist, return error
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Find the room
    const room = await prisma.room.findUnique({
        where: {
            id: roomId
        }
    });

    // If room doesn't exist, return error
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    try {
        // Update the user to connect to the room
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                rooms: {
                    connect: {
                        id: roomId
                    }
                }
            }
        });

        // Update the room to connect to the user
        await prisma.room.update({
            where: {
                id: roomId
            },
            data: {
                users: {
                    connect: {
                        id: user.id
                    }
                }
            }
        });

        // Return the updated user
        res.status(200).json(user);
    } catch (error) {
        // Handle any errors
        console.error('Error joining room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
