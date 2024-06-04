"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redis = void 0;
const redis_1 = require("redis");
class Redis {
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: "redis://localhost:6378"
        });
        this.client.connect();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Redis();
        }
        return this.instance;
    }
}
exports.Redis = Redis;
