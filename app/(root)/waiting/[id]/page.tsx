import MainComponentWaiting from "@/src/components/layouts/waiting-page/main-component";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { status_player } from "@/src/store/chat.store";
import { match_user_select } from "@/src/types/select";
import { headers } from "next/headers";

export default async function WaitingRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const roomId = (await params).id;
  const { result } = await auth.api.getSession({
    headers: await headers(),
  });

  const match = await prisma.match.findFirst({
    where: {
      room_id: roomId,
    },
    select: {
      id: true,
      user_id: true,
      matchUsers: {
        select: match_user_select,
      },
    },
  });

  const players =
    match?.matchUsers.map((item) => {
      let status = "waiting" as status_player;

      if (item.userId === match.user_id) {
        status = "host";
      } else if (item.ready) {
        status = "ready";
      }

      return {
        ...item,
        isYou: item.userId === result?.user.id,
        status,
      };
    }) ?? [];

  return (
    <MainComponentWaiting
      players={players}
      roomId={roomId}
      match_id={match?.id ?? ""}
    />
  );
}
