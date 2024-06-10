# Scalable Chat Application

This repository outlines the architecture for a scalable chat application using multiple WebSocket servers with a Publish-Subscribe (Pub-Sub) model. This design allows multiple users to connect to different WebSocket servers and subscribe to the same room, ensuring seamless message delivery across the network.

## Technology Stack

- **Node.js**: JavaScript runtime environment.
- **TypeScript**: Superset of JavaScript with static typing.
- **Redis**: In-memory data structure store, used here for Pub-Sub messaging.

## Architecture Overview

### Key Components

1. **WebSocket Servers**: 
   - Handle client connections.
   - Manage subscriptions to rooms.
   - Publish messages to subscribed clients.

2. **Pub-Sub System**: 
   - Manages message distribution.
   - Propagates messages to all WebSocket servers with clients subscribed to the room.

3. **Rooms**: 
   - Virtual channels for group communication.
   - Broadcast messages to all subscribers.


