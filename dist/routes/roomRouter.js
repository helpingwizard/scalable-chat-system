"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const room_1 = require("../controllers/room");
const roomRouter = express_1.default.Router();
roomRouter.post("/createroom", room_1.createRoom);
exports.default = roomRouter;
