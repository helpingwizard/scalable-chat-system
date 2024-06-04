"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_1 = require("../controllers/chat");
const chatsRouter = express_1.default.Router();
chatsRouter.get("/getchats/:roomId", chat_1.getAllMessagesInRoom);
exports.default = chatsRouter;
