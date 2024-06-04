export const JOIN = "JOIN";
export const CHAT = "CHAT";
export const WS_READY = "WS_READY";

export interface Message {
    id: number;
    content: string;
    created_at: string;
    updated_at: string
    roomId : number;
    userId: number  
  }