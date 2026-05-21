"use server";
import { pusher } from "../lib/pusher/pusher";

export const sendMessage = async (body: {
  sender: string;
  text: string;
  isSystem: boolean;
  room_id: string;
}) => {
  await pusher.trigger(`match-${body.room_id}`, "message-room", {
    sender: body.sender,
    text: body.text,
    isSystem: body.isSystem,
  });
};
