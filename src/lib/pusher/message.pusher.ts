import { ChatStoreType, useChatStore } from "@/src/store/chat.store";
import { SessionType } from "../auth/types";

export const handleNewChat = (
  data: { sender: string; text: string; isSystem: boolean },
  setValue: ChatStoreType["setValue"],
) => {
  // Ambil state TERBARU langsung dari store (bukan dari closure)
  const currentMessages = useChatStore.getState().messages;

  setValue("messages", [...currentMessages, data]);
};

export const handleStartGame = ({
  data,
  room_id,
  session,
}: {
  data: { room_id: string; users: string[] };
  room_id: string;
  session: SessionType | null;
}) => {
  const isYou = data.users.includes(String(session?.user.id));

  return data.room_id === room_id && isYou;
};
