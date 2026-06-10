import { useEngine } from "@/src/store/game.store";
import { useCallStateHooks } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { JSX, useEffect } from "react";
import { useShallow } from "zustand/shallow";

export function CallControls(): JSX.Element {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { camera, isMute: camMuted } = useCameraState();
  const { microphone, isMute: micMuted } = useMicrophoneState();

  const sessionGame = useEngine(useShallow((state) => state.sessionGame));
  const isKilled = sessionGame?.status === "killed";

  useEffect(() => {
    if (!isKilled) return;

    // Paksa disable dengan retry — Stream SDK butuh waktu init setelah mount
    const disable = async () => {
      try {
        await camera.disable();
      } catch {}
      try {
        await microphone.disable();
      } catch {}
    };

    // Jalankan segera
    disable();

    // Retry setelah 500ms — antisipasi SDK belum siap saat mount
    const retry = setTimeout(disable, 500);

    return () => clearTimeout(retry);

    // Hapus camMuted/micMuted dari dependency — kita tidak ingin
    // effect ini berhenti karena state mute sudah true
  }, [isKilled, camera, microphone]);

  return (
    <div className="flex gap-2">
      {/* Mic button */}
      <button
        onClick={() => !isKilled && microphone.toggle()}
        disabled={isKilled}
        title={isKilled ? "Eliminated" : micMuted ? "Unmute mic" : "Mute mic"}
        className="group flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-all duration-200"
        style={{
          background: micMuted ? "rgba(239,68,68,0.12)" : "rgba(87,83,78,0.10)",
          border: `1px solid ${micMuted ? "rgba(239,68,68,0.5)" : "rgba(87,83,78,0.4)"}`,
          color: micMuted ? "#f87171" : "#a8a29e",
          minWidth: 52,
        }}
      >
        {micMuted ? (
          /* Mic off icon */
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
            <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : (
          /* Mic on icon */
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
        <span
          className="text-[8px] tracking-widest leading-none"
          style={{ fontFamily: "monospace" }}
        >
          {micMuted ? "UNMUTE" : "MUTE"}
        </span>
      </button>

      {/* Camera button */}
      <button
        onClick={() => !isKilled && camera.toggle()}
        disabled={isKilled}
        title={
          isKilled
            ? "Eliminated"
            : camMuted
              ? "Turn on camera"
              : "Turn off camera"
        }
        className="group flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-all duration-200"
        style={{
          background: camMuted ? "rgba(239,68,68,0.12)" : "rgba(87,83,78,0.10)",
          border: `1px solid ${camMuted ? "rgba(239,68,68,0.5)" : "rgba(87,83,78,0.4)"}`,
          color: camMuted ? "#f87171" : "#a8a29e",
          minWidth: 52,
        }}
      >
        {camMuted ? (
          /* Camera off icon */
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34" />
            <path d="M22 8l-6 4 6 4V8z" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          /* Camera on icon */
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        )}
        <span
          className="text-[8px] tracking-widest leading-none"
          style={{ fontFamily: "monospace" }}
        >
          {camMuted ? "CAM ON" : "CAM OFF"}
        </span>
      </button>
    </div>
  );
}
