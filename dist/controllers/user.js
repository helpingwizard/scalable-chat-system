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
exports.createUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        // Check if the user already exists
        const user = yield prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!user) {
            // Create a new user
            const newUser = yield prisma.user.create({
                data: {
                    username: username,
                },
            });
            console.log(newUser);
            return res.status(201).json({ msg: "User created", user: newUser });
        }
        else {
            return res.status(409).json({ msg: "Username taken" });
        }
    }
    catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: 'Could not create user' });
    }
});
exports.createUser = createUser;
