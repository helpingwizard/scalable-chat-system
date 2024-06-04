import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import { RedisSubscriptionManager } from "./subscriptions/RedisSubscriptionManager";
import { PrismaClient } from "@prisma/client";
import userRouter from "./routes/userRouter";
import roomRouter from "./routes/roomRouter";
import chatsRouter from "./routes/chatRouter";

const app = express();
const port = 3001;
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

app.use('/user',userRouter);
app.use('/room',roomRouter);
app.use('/chats', chatsRouter);


interface MessagePayload {
  username: string;
  roomId: number;
  content: string;
}

interface MessageData {
  type: 'join' | 'message';
  payload: MessagePayload;
}

wss.on("connection", async (ws) => {
  let userId: number = 0;
  let roomId: number = 0;
  let username: string = "";

  ws.on("message", async (message: string) => {
    const data: MessageData = JSON.parse(message);

    if (data.type === "join") {
      username = data.payload.username;
      roomId = data.payload.roomId;
      userId = (await getUserId(username)) as number;

      if (userId !== null) {
        const existingUserRoom = await prisma.userRooms.findUnique({
          where: {
            userId_roomId: {
              userId: userId,
              roomId: roomId,
            },
          },
        });

        if (!existingUserRoom) {
          await prisma.userRooms.create({
            data: {
              userId: userId,
              roomId: roomId,
            },
          });
          console.log(`User ${userId} joined room ${roomId}`);
        } else {
          console.log(`User ${userId} is already part of room ${roomId}`);
        }

        RedisSubscriptionManager.getInstance().subscribe(
          userId.toString(),
          roomId.toString(),
          ws
        );
      } else {
        console.log(`User ${username} not found.`);
      }
    }

    if (data.type === "message") {
      roomId = data.payload.roomId;
      const content = data.payload.content;
      const username = data.payload.username;
      const userId = (await getUserId(username)) as number;
      console.log(`Attempting to create message for userId: ${userId}, roomId: ${roomId}`);

      // Check if roomId exists in the Room table
      const roomExists = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (roomExists) {
        const newMessage = await prisma.message.create({
          data: {
            userId: userId,
            roomId: roomId,
            content: data.payload.content,
            createdAt: new Date(),
          },
        });

        RedisSubscriptionManager.getInstance().addChatMessage(
          roomId.toString(),
          JSON.stringify({
            type: "message",
            payload: {
              userId: userId,
              content: newMessage.content,
              createdAt: newMessage.createdAt,
            },
          })
        );
      } else {
        console.log(`Room ${roomId} does not exist.`);
      }
    }
  });
});

async function getUserId(username: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true
    }
  });
  return user ? user.id : null;
}

app.listen(3000, () => {
  console.log(`Express server is listening on port ${port}`);
});
server.listen(3001, () => {
  console.log(`Server is listening on port ${port}`);
});
