"use server";
import { prisma } from "../lib/prisma";
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

export const startGame = async (body: { room_id: string }) => {
  const users = await prisma.matchUser.findMany({
    where: {
      match: {
        room_id: body.room_id,
      },
    },
    select: {
      userId: true,
    },
  });

  await pusher.trigger(`match-${body.room_id}`, "start-game", {
    room_id: body.room_id,
    users: users.map((item) => item.userId),
  });

  await prisma.match.update({
    where: {
      room_id: body.room_id,
    },
    data: {
      status: "playing",
    },
  });
};
