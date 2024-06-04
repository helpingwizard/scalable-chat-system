import express from 'express';
import { getAllMessagesInRoom } from '../controllers/chat';
const chatsRouter = express.Router();

chatsRouter.get("/getchats/:roomId", getAllMessagesInRoom );
export default chatsRouter;