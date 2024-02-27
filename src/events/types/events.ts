export class Message {
  id: string;
  message: string;
  userId: number;
  roomId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServerToClientEvents {
  newMessage: (payload: Message) => void;
}
