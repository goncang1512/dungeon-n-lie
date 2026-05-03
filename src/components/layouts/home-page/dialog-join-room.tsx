import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { DungeonAudio } from "./dungeon-audio";
import { matchStore } from "@/src/store/room.store";
import { useShallow } from "zustand/shallow";

interface JoinRoomProps {
  joinOpen: boolean;
  audio: DungeonAudio;
  code: string;
  codeError: string;
  handleJoin: () => void;
  joining: boolean;
}

export default function DialogJoinRoom({
  joinOpen,
  codeError,
  audio,
  code,
  handleJoin,
  joining,
}: JoinRoomProps) {
  const { setValue } = matchStore(
    useShallow((state) => ({ setValue: state.setValue })),
  );

  return (
    <Dialog
      open={joinOpen}
      onOpenChange={(open) => {
        if (!open) audio.playClick();
        setValue("joinOpen", open);
        setValue("code", "");
        setValue("codeError", "");
      }}
    >
      <DialogContent
        className="max-w-md border-0 p-0 shadow-none bg-transparent"
        style={{ outline: "none" }}
      >
        <div
          className="relative p-8 rounded-sm"
          style={{
            background: "rgba(14,10,4,0.97)",
            border: "1px solid #5a3f1c",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 0 60px rgba(0,0,0,0.9), 0 0 30px rgba(224,168,58,0.06), inset 0 1px 0 rgba(224,168,58,0.1)",
          }}
        >
          {/* Ornament corners */}
          {[
            ["top-[4px] left-[4px]", "border-t border-l"],
            ["top-[4px] right-[4px]", "border-t border-r"],
            ["bottom-[4px] left-[4px]", "border-b border-l"],
            ["bottom-[4px] right-[4px]", "border-b border-r"],
          ].map(([pos, borders], i) => (
            <span
              key={i}
              className={`absolute ${pos} w-3 h-3 ${borders}`}
              style={{ borderColor: "#e0a83a" }}
            />
          ))}
          <div
            className="absolute -top-px left-6 w-14 h-0.5"
            style={{
              background: "#e0a83a",
              boxShadow: "0 0 8px rgba(224,168,58,0.5)",
            }}
          />

          <DialogHeader className="mb-6">
            <DialogTitle>
              <h2
                className="font-cinzel font-bold tracking-[4px] text-[18px]"
                style={{
                  color: "#e0a83a",
                  textShadow: "0 0 20px rgba(224,168,58,0.4)",
                }}
              >
                BREACH THE GATE
              </h2>
            </DialogTitle>
            <DialogDescription>
              <p
                className="font-cinzel text-[8px] tracking-[3px] mt-1"
                style={{ color: "rgba(120,80,20,0.7)" }}
              >
                ENTER THE 6-CHARACTER CIPHER TO JOIN A REALM
              </p>
            </DialogDescription>
          </DialogHeader>

          {/* Code display boxes */}
          <div className="relative">
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-11 h-14 flex items-center justify-center rounded-sm text-xl font-cinzel font-bold transition-all duration-200"
                  style={{
                    background: code[i]
                      ? "rgba(30,20,8,0.98)"
                      : "rgba(10,7,2,0.98)",
                    border: code[i]
                      ? "1px solid #e0a83a"
                      : codeError
                        ? "1px solid rgba(192,48,48,0.6)"
                        : "1px solid #3a2810",
                    color: "#e0a83a",
                    boxShadow: code[i]
                      ? "0 0 8px rgba(224,168,58,0.25), inset 0 0 6px rgba(224,168,58,0.04)"
                      : "none",
                  }}
                >
                  {code[i] ?? ""}
                </div>
              ))}
            </div>

            {/* Hidden actual input */}
            <input
              className="absolute inset-0 opacity-0 w-full cursor-text"
              maxLength={6}
              value={code}
              autoFocus
              onChange={(e) => {
                const v = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "");
                setValue("code", v);
                setValue("codeError", "");
                if (v.length <= 6) audio.playClick();
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          {/* Error */}
          {codeError && (
            <p
              className="font-cinzel text-[9px] tracking-[2px] text-center mt-3 animate-fade-up"
              style={{ color: "#f87171" }}
            >
              {codeError}
            </p>
          )}

          {/* Divider */}
          <div
            className="h-px my-6"
            style={{
              background:
                "linear-gradient(to right, transparent, #3a2810, transparent)",
            }}
          />

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setValue("joinOpen", false);
                audio.playClick();
              }}
              className="flex-1 font-cinzel text-[9px] tracking-[2px] py-3 rounded-sm transition-all duration-200"
              style={{
                background: "transparent",
                border: "1px solid #3a2810",
                color: "#5a3d18",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#5a3d18";
                e.currentTarget.style.color = "#8a6030";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#3a2810";
                e.currentTarget.style.color = "#5a3d18";
              }}
            >
              RETREAT
            </button>

            <button
              onClick={handleJoin}
              disabled={joining || code.length < 6}
              className="flex-2 font-cinzel text-[9px] tracking-[2px] py-3 rounded-sm transition-all duration-300 relative overflow-hidden"
              style={{
                background: "transparent",
                border:
                  code.length === 6 && !joining
                    ? "1px solid #e0a83a"
                    : "1px solid #3a2810",
                color: code.length === 6 && !joining ? "#e0a83a" : "#5a3d18",
                boxShadow:
                  code.length === 6 && !joining
                    ? "0 0 16px rgba(224,168,58,0.15)"
                    : "none",
                cursor: joining || code.length < 6 ? "not-allowed" : "pointer",
              }}
            >
              {joining ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span
                    className="inline-block w-3 h-3 border border-current rounded-full animate-spin"
                    style={{ borderTopColor: "transparent" }}
                  />
                  ENTERING...
                </span>
              ) : (
                "BREACH THE GATE"
              )}
            </button>
          </div>

          {/* Rune footer */}
          <p
            className="text-center font-cinzel text-[9px] tracking-[6px] mt-5"
            style={{ color: "rgba(90,60,20,0.3)" }}
          >
            ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
