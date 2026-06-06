/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEngine } from "@/src/store/game.store";
import { JSX, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";

interface VoteEliminatedDialogProps {
  isVisible: boolean;
  onClose?: () => void;
}

export function VoteEliminatedDialog({
  isVisible,
  onClose,
}: VoteEliminatedDialogProps): JSX.Element | null {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const { voteResult } = useEngine(
    useShallow((state) => ({ voteResult: state.voteResult })),
  );

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      setExiting(false);

      // Auto-close setelah 5 detik
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setVisible(false);
          onClose?.();
        }, 600);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.88)",
        animation: exiting
          ? "fadeOut 0.6s ease forwards"
          : "fadeIn 0.4s ease forwards",
      }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,1) 2px,rgba(0,0,0,1) 4px)",
        }}
      />

      <div
        className="relative flex flex-col items-center gap-6 px-10 py-10 max-w-sm w-full mx-4"
        style={{
          background: "rgba(8,5,3,0.97)",
          border: "1px solid rgba(239,68,68,0.4)",
          boxShadow:
            "0 0 60px rgba(239,68,68,0.15), 0 0 120px rgba(239,68,68,0.05)",
          animation: exiting
            ? "scaleOut 0.6s ease forwards"
            : "scaleIn 0.4s ease forwards",
        }}
      >
        {/* Corner brackets */}
        <div
          className="absolute top-0 left-0 w-4 h-4"
          style={{
            borderTop: "2px solid rgba(239,68,68,0.7)",
            borderLeft: "2px solid rgba(239,68,68,0.7)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-4 h-4"
          style={{
            borderTop: "2px solid rgba(239,68,68,0.7)",
            borderRight: "2px solid rgba(239,68,68,0.7)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-4 h-4"
          style={{
            borderBottom: "2px solid rgba(239,68,68,0.7)",
            borderLeft: "2px solid rgba(239,68,68,0.7)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-4 h-4"
          style={{
            borderBottom: "2px solid rgba(239,68,68,0.7)",
            borderRight: "2px solid rgba(239,68,68,0.7)",
          }}
        />

        {/* Icon */}
        <div
          className="text-5xl"
          style={{
            filter: "drop-shadow(0 0 12px rgba(239,68,68,0.8))",
            animation: "pulse 1.5s ease infinite",
          }}
        >
          ☠
        </div>

        {/* System label */}
        <span
          className="text-[9px] tracking-[0.3em] uppercase"
          style={{ fontFamily: "monospace", color: "rgba(239,68,68,0.6)" }}
        >
          ◈ SISTEM · KEPUTUSAN DITETAPKAN
        </span>

        {/* Main message */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p
            className="text-sm tracking-widest uppercase leading-relaxed"
            style={{ fontFamily: "monospace", color: "#e7e5e4" }}
          >
            {voteResult.name} TELAH
          </p>
          <p
            className="text-2xl font-bold tracking-[0.2em] uppercase"
            style={{
              fontFamily: "monospace",
              color: "#ef4444",
              textShadow: "0 0 20px rgba(239,68,68,0.7)",
            }}
          >
            DIELIMINASI
          </p>
          {voteResult.name && (
            <p
              className="text-[10px] tracking-widest mt-1"
              style={{
                fontFamily: "monospace",
                color: "rgba(214,211,209,0.5)",
              }}
            >
              [ {voteResult.name} ]
            </p>
          )}
        </div>

        {/* Divider */}
        <div
          className="w-full h-px"
          style={{ background: "rgba(239,68,68,0.2)" }}
        />

        {/* Sub-message */}
        <p
          className="text-[10px] tracking-wider text-center leading-relaxed"
          style={{ fontFamily: "monospace", color: "rgba(214,211,209,0.45)" }}
        >
          Mic dan kamera kamu telah dinonaktifkan.
          <br />
          Kamu masih dapat mengamati jalannya permainan.
        </p>

        {/* Auto-close indicator */}
        <div
          className="w-full h-0.5 overflow-hidden"
          style={{ background: "rgba(239,68,68,0.15)" }}
        >
          <div
            className="h-full"
            style={{
              background: "rgba(239,68,68,0.5)",
              animation: "drainBar 5s linear forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut  { from { opacity: 1 } to { opacity: 0 } }
        @keyframes scaleIn  { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes scaleOut { from { transform: scale(1); opacity: 1 } to { transform: scale(0.92); opacity: 0 } }
        @keyframes pulse    { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        @keyframes drainBar { from { width: 100% } to { width: 0% } }
      `}</style>
    </div>
  );
}
