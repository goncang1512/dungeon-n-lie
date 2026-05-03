import React, { useCallback, useRef, useEffect, useMemo } from "react";
import { Corners } from "./player-card";
import { useChatStore } from "@/src/store/chat.store";
import { useShallow } from "zustand/shallow";

interface ChatMessage {
  sender: string;
  text: string;
  isSystem: boolean;
}

const COLORS = {
  background: "rgba(10,7,3,0.88)",
  borderOuter: "#3a2810",
  borderInner: "#2a1c08",
  borderFocus: "#5a3810",
  textHeader: "rgba(90,60,20,0.55)",
  textSystem: "rgba(90,60,20,0.5)",
  textMessage: "rgba(130,80,25,0.85)",
  senderYou: "#c8882a",
  senderOther: "#7a5828",
  inputBg: "#060402",
  inputText: "#d4a04a",
  caret: "#e0a83a",
} as const;

const MAX_MESSAGE_LENGTH = 120;
const CURRENT_USER = "You";

export default function ChatSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { message, messages, setValue } = useChatStore(
    useShallow((state) => ({
      message: state.message,
      setValue: state.setValue,
      messages: state.messages,
    })),
  );

  // Auto scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Validasi: cek apakah pesan kosong atau hanya whitespace
  const isMessageValid = useMemo(() => message.trim().length > 0, [message]);

  const sendMessage = useCallback(() => {
    const text = message.trim();
    if (!text) return;

    const newMessage: ChatMessage = {
      sender: CURRENT_USER,
      text,
      isSystem: false,
    };

    setValue("messages", [...messages, newMessage]);
    setValue("message", "");
  }, [message, messages, setValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("message", e.target.value);
    },
    [setValue],
  );

  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = COLORS.borderFocus;
      e.currentTarget.style.boxShadow = "0 0 0 1px rgba(90,56,16,0.2)";
    },
    [],
  );

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = COLORS.borderInner;
      e.currentTarget.style.boxShadow = "none";
    },
    [],
  );

  return (
    <div
      className="relative flex flex-col rounded-sm overflow-hidden"
      style={{
        background: COLORS.background,
        border: `1px solid ${COLORS.borderOuter}`,
        flex: 1,
        minHeight: 200,
      }}
    >
      <Corners color={COLORS.borderOuter} size="w-2 h-2" />

      <ChatHeader />

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#3a2810_#0a0703]"
        style={{ maxHeight: "63vh" }}
      >
        <div className="min-h-full flex flex-col justify-end px-3 py-2 space-y-1.5">
          {messages.map((msg, index) => (
            <MessageItem key={`${msg.sender}-${index}`} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onSend={sendMessage}
        isValid={isMessageValid}
      />
    </div>
  );
}

// ===== Sub Components =====

function ChatHeader() {
  return (
    <div
      className="px-3 pt-3 pb-2 border-b shrink-0"
      style={{ borderColor: COLORS.borderInner }}
    >
      <p
        className="font-cinzel text-[8px] tracking-[3px]"
        style={{ color: COLORS.textHeader }}
      >
        DUNGEON WHISPERS
      </p>
    </div>
  );
}

interface MessageItemProps {
  message: ChatMessage;
}

function MessageItem({ message }: MessageItemProps) {
  if (message.isSystem) {
    return (
      <p
        className="font-cinzel text-[8px] tracking-[1px] text-center"
        style={{ color: COLORS.textSystem }}
      >
        — {message.text} —
      </p>
    );
  }

  const isCurrentUser = message.sender === CURRENT_USER;

  return (
    <div>
      <span
        className="font-cinzel text-[10px] tracking-[1px] mr-1.5"
        style={{
          color: isCurrentUser ? COLORS.senderYou : COLORS.senderOther,
        }}
      >
        {message.sender}:
      </span>
      <span
        className="font-crimson text-[16px]"
        style={{ color: COLORS.textMessage }}
      >
        {message.text}
      </span>
    </div>
  );
}

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSend: () => void;
  isValid: boolean;
}

function ChatInput({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onSend,
  isValid,
}: ChatInputProps) {
  return (
    <div
      className="px-3 pb-3 pt-2 border-t shrink-0"
      style={{ borderColor: COLORS.borderInner }}
    >
      <div className="flex gap-2">
        <input
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="whisper to the dungeon..."
          maxLength={MAX_MESSAGE_LENGTH}
          className="flex-1 font-crimson italic text-[13px] px-3 py-2 rounded-sm outline-none transition-all"
          style={{
            background: COLORS.inputBg,
            border: `1px solid ${COLORS.borderInner}`,
            color: COLORS.inputText,
            caretColor: COLORS.caret,
          }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!isValid}
          aria-label="Send message"
          className="font-cinzel text-[9px] tracking-[1px] px-3 py-2 rounded-sm transition-all"
          style={{
            background: isValid ? "rgba(200,136,42,0.12)" : "transparent",
            border: `1px solid ${isValid ? COLORS.senderYou : COLORS.borderInner}`,
            color: isValid ? COLORS.senderYou : COLORS.borderInner,
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          ↵
        </button>
      </div>
    </div>
  );
}
