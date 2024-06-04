import { createClient, RedisClientType } from 'redis';

export class RedisSubscriptionManager {
  private static instance: RedisSubscriptionManager;
  private subscriber: RedisClientType;
  public publisher: RedisClientType;
  private subscriptions: Map<string, string[]>;
  private reverseSubscriptions: Map<string, { [userId: string]: { userId: string; ws: any; } }>;

  private constructor() {
    this.subscriber = createClient();
    this.publisher = createClient();
    this.subscriptions = new Map<string, string[]>();
    this.reverseSubscriptions = new Map<string, { [userId: string]: { userId: string; ws: any; } }>();

    this.initialize();
  }

  private async initialize() {
    try {
      await this.subscriber.connect();
      await this.publisher.connect();
    } catch (err) {
      console.error('Redis connection error:', err);
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new RedisSubscriptionManager();
    }
    return this.instance;
  }

  async subscribe(userId: string, room: string, ws: any) {
    this.subscriptions.set(userId, [
      ...(this.subscriptions.get(userId) || []),
      room,
    ]);

    this.reverseSubscriptions.set(room, {
      ...(this.reverseSubscriptions.get(room) || {}),
      [userId]: { userId, ws },
    });

    if (Object.keys(this.reverseSubscriptions.get(room) || {}).length === 1) {
      console.log(`Subscribing to room: ${room}`);
      try {
        await this.subscriber.subscribe(room, (message) => {
          try {
            const subscribers = this.reverseSubscriptions.get(room) || {};
            Object.values(subscribers).forEach(({ ws }) => ws.send(message));
          } catch (e) {
            console.error('Error processing message:', e);
          }
        });
      } catch (err) {
        console.error('Redis subscribe error:', err);
      }
    }
  }

  async unsubscribe(userId: string, room: string) {
    const userSubscriptions = this.subscriptions.get(userId) || [];
    this.subscriptions.set(userId, userSubscriptions.filter((x) => x !== room));

    if (this.subscriptions.get(userId)?.length === 0) {
      this.subscriptions.delete(userId);
    }

    const roomSubscriptions = this.reverseSubscriptions.get(room) || {};
    delete roomSubscriptions[userId];

    if (Object.keys(roomSubscriptions).length === 0) {
      console.log(`Unsubscribing from room: ${room}`);
      try {
        await this.subscriber.unsubscribe(room);
      } catch (err) {
        console.error('Redis unsubscribe error:', err);
      }
      this.reverseSubscriptions.delete(room);
    }
  }

  async publish(room: string, message: any) {
    console.log(`Publishing message to room: ${room}`);
    try {
      await this.publisher.publish(room, JSON.stringify(message));
    } catch (err) {
      console.error('Redis publish error:', err);
    }
  }

  async addChatMessage(room: string, message: string) {
    this.publish(room, {
      type: 'message',
      payload: {
        message,
      },
    });
  }
}
