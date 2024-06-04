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
exports.RedisSubscriptionManager = void 0;
const redis_1 = require("redis");
class RedisSubscriptionManager {
    constructor() {
        this.subscriber = (0, redis_1.createClient)();
        this.publisher = (0, redis_1.createClient)();
        this.subscriptions = new Map();
        this.reverseSubscriptions = new Map();
        this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.subscriber.connect();
                yield this.publisher.connect();
            }
            catch (err) {
                console.error('Redis connection error:', err);
            }
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisSubscriptionManager();
        }
        return this.instance;
    }
    subscribe(userId, room, ws) {
        return __awaiter(this, void 0, void 0, function* () {
            this.subscriptions.set(userId, [
                ...(this.subscriptions.get(userId) || []),
                room,
            ]);
            this.reverseSubscriptions.set(room, Object.assign(Object.assign({}, (this.reverseSubscriptions.get(room) || {})), { [userId]: { userId, ws } }));
            if (Object.keys(this.reverseSubscriptions.get(room) || {}).length === 1) {
                console.log(`Subscribing to room: ${room}`);
                try {
                    yield this.subscriber.subscribe(room, (message) => {
                        try {
                            const subscribers = this.reverseSubscriptions.get(room) || {};
                            Object.values(subscribers).forEach(({ ws }) => ws.send(message));
                        }
                        catch (e) {
                            console.error('Error processing message:', e);
                        }
                    });
                }
                catch (err) {
                    console.error('Redis subscribe error:', err);
                }
            }
        });
    }
    unsubscribe(userId, room) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userSubscriptions = this.subscriptions.get(userId) || [];
            this.subscriptions.set(userId, userSubscriptions.filter((x) => x !== room));
            if (((_a = this.subscriptions.get(userId)) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                this.subscriptions.delete(userId);
            }
            const roomSubscriptions = this.reverseSubscriptions.get(room) || {};
            delete roomSubscriptions[userId];
            if (Object.keys(roomSubscriptions).length === 0) {
                console.log(`Unsubscribing from room: ${room}`);
                try {
                    yield this.subscriber.unsubscribe(room);
                }
                catch (err) {
                    console.error('Redis unsubscribe error:', err);
                }
                this.reverseSubscriptions.delete(room);
            }
        });
    }
    publish(room, message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Publishing message to room: ${room}`);
            try {
                yield this.publisher.publish(room, JSON.stringify(message));
            }
            catch (err) {
                console.error('Redis publish error:', err);
            }
        });
    }
    addChatMessage(room, message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.publish(room, {
                type: 'message',
                payload: {
                    message,
                },
            });
        });
    }
}
exports.RedisSubscriptionManager = RedisSubscriptionManager;
