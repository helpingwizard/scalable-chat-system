import  express  from "express";
import http from "http"
import { WebSocketServer } from "ws";
import cors from "cors"
import { RedisSubscriptionManager } from "./subscriptions/RedisSubscriptionManager";

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const wss = new WebSocketServer({server});

const users : {[key : string] : {
    room: string,
    ws : any
}} = {};

/*
users = {
    [user1, user2, user3] : {
        room : 2,
        ws
    },
    [user4, user1, user7] : {
        room : 1,
        ws
    }
}
*/



let counter = 0;
wss.on("connection", async (ws, req) => {
    const wsId = counter++;
    ws.on("message", (message: string) => {

        const data = JSON.parse(message.toString());
        if (data.type === "join") {
            users[wsId] = {
                room: data.payload.roomId,
                ws
            };
            RedisSubscriptionManager.getInstance().subscribe(wsId.toString(), data.payload.roomId, ws);
        }

        if (data.type === "message") {

            const roomId = users[wsId].room;
            const message = data.payload.message;
            RedisSubscriptionManager.getInstance().addChatMessage(roomId, message);
            
        }
    });
    ws.on("disconnect", () => {
        RedisSubscriptionManager.getInstance().unsubscribe(wsId.toString(), users[wsId].room);
    })
});

server.listen(port);