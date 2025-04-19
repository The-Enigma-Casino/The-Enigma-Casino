import { createEvent } from "effector";
import type { ChatMessage } from "../interfaces/chatMessage";

export const messageReceived = createEvent<ChatMessage>();
export const messageSent = createEvent<{ tableId: number; text: string }>();
