import type { RedisClientType } from "redis";
import { createClient } from "redis";

export class Redis {
    private client: RedisClientType;
    private static instance: Redis

    constructor() {
        this.client = createClient({
            url: "redis://localhost:6378"
        });
        this.client.connect();
    }

    public static getInstance(): Redis {
        if (!this.instance) {
          this.instance = new Redis();
        }
        return this.instance;
      }
}

