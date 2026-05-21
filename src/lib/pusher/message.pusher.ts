import { ChatStoreType, useChatStore } from "@/src/store/chat.store";

export const handleNewChat = (
  data: { sender: string; text: string; isSystem: boolean },
  setValue: ChatStoreType["setValue"],
) => {
  // Ambil state TERBARU langsung dari store (bukan dari closure)
  const currentMessages = useChatStore.getState().messages;

  setValue("messages", [...currentMessages, data]);
};
