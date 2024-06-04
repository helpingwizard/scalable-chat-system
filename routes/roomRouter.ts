import express from 'express';
import { createRoom } from '../controllers/room';


const roomRouter = express.Router();

roomRouter.post("/createroom", createRoom);
export default roomRouter;