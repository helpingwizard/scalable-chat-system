import express from 'express';
import { createRoom, getRooms } from '../controllers/room';


const roomRouter = express.Router();

roomRouter.post("/createroom", createRoom);
roomRouter.get("/getrooms", getRooms);
export default roomRouter;