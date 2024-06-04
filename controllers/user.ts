import { PrismaClient } from '@prisma/client'
import express, { Request, Response,  RequestHandler } from "express";
const prisma = new PrismaClient()

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;

        // Check if the user already exists
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });

        if (!user) {
            // Create a new user
            const newUser = await prisma.user.create({
                data: {
                    username: username,
                },
            });
            console.log(newUser);
            return res.status(201).json({ msg: "User created", user: newUser });
        } else {
            return res.status(409).json({ msg: "Username taken" });
        }
        
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: 'Could not create user' });
    }
};