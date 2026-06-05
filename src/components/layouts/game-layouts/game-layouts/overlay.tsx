"use client";

// ─────────────────────────────────────────────────────────
// overlays.tsx
// Empat konten overlay yang muncul di atas center panel:
//
//  OverlayStory      → narasi DM + clue + quest tracker
//  OverlayDice       → D20 roller per class check + quest
//  OverlayInfiltrator→ aksi rahasia infiltrator / catalyst
//  OverlayVote       → voting, sidang, resolusi ronde
//
// Semua pakai useGame() — tidak terima props data besar.
// ─────────────────────────────────────────────────────────

import { useState, JSX } from "react";
import { useGame } from "./game-state";
import { DND_CLASSES } from "./init-game";
import {
  CHAPTERS,
  CLUES,
  QUESTS,
  INFILTRATOR_ACTIONS,
  InfiltratorAction,
} from "./game-story";

// ═══════════════════════════════════════════════════════
// OVERLAY STORY
// ═══════════════════════════════════════════════════════

export function OverlayStory(): JSX.Element {
  const { state, myPlayer } = useGame();
  const [expandedClue, setExpandedClue] = useState<string | null>(null);
  const [showQuests, setShowQuests] = useState(true);

  const chapter = CHAPTERS.find((c) => c.round === state.round) ?? CHAPTERS[0];
  const isInfil = myPlayer?.role === "infiltrator";
  const visibleClues = CLUES.filter((c) => c.round <= state.round);
  const newClueIds = CLUES.filter((c) => c.round === state.round).map(
    (c) => c.id,
  );

  const CLUE_COLORS = {
    physical: "#60a5fa",
    testimony: "#4ade80",
    magical: "#e879f9",
    fabricated: "#f87171",
  };

  const QUEST_ICONS = { locked: "◻", active: "◈", success: "✓", failed: "✗" };
  const QUEST_COLORS = {
    locked: "#44403c",
    active: "#d97706",
    success: "#4ade80",
    failed: "#f87171",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Chapter header */}
      <div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: "#57534e",
            letterSpacing: "0.2em",
            marginBottom: 3,
          }}
        >
          BABAK {state.round} — {chapter.title.toUpperCase()}
        </div>
        <div
          style={{
            padding: "6px 10px",
            borderLeft: "2px solid rgba(217,119,6,0.4)",
            background: "rgba(217,119,6,0.04)",
            fontFamily: "monospace",
            fontSize: 10,
            color: "#78716c",
            fontStyle: "italic",
          }}
        >
          {chapter.whisper}
        </div>
      </div>

      {/* DM Narrative */}
      <div
        style={{
          border: "1px solid rgba(41,37,36,0.4)",
          background: "rgba(4,3,2,0.5)",
          padding: "10px 12px",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: "#44403c",
            letterSpacing: "0.2em",
            marginBottom: 6,
          }}
        >
          ⟨ DUNGEON MASTER ⟩
        </div>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#d6d3d1",
            lineHeight: 1.7,
          }}
        >
          {chapter.narrative}
        </p>
      </div>

      {/* Infiltrator secret */}
      {isInfil && (
        <div
          style={{
            padding: "8px 10px",
            borderLeft: "2px solid rgba(248,113,113,0.5)",
            background: "rgba(248,113,113,0.06)",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#f87171",
              letterSpacing: "0.15em",
              marginBottom: 3,
            }}
          >
            ⚠ PESAN RAHASIA
          </div>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#f87171",
              opacity: 0.8,
              lineHeight: 1.6,
            }}
          >
            {chapter.infiltratorSecret}
          </p>
        </div>
      )}

      {/* Clues */}
      <div
        style={{
          border: "1px solid rgba(41,37,36,0.5)",
          background: "rgba(4,3,2,0.6)",
        }}
      >
        <div
          style={{
            padding: "5px 10px",
            fontFamily: "monospace",
            fontSize: 9,
            color: "#57534e",
            letterSpacing: "0.15em",
            borderBottom: "1px solid rgba(41,37,36,0.4)",
          }}
        >
          PETUNJUK DITEMUKAN ({visibleClues.length})
        </div>
        {visibleClues.map((c) => {
          const color = CLUE_COLORS[c.type];
          const isNew = newClueIds.includes(c.id);
          return (
            <div key={c.id}>
              <div
                onClick={() =>
                  setExpandedClue(expandedClue === c.id ? null : c.id)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(41,37,36,0.25)",
                  background:
                    expandedClue === c.id ? `${color}08` : "transparent",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#a8a29e",
                    flex: 1,
                  }}
                >
                  {c.title}
                </span>
                {isNew && (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 8,
                      letterSpacing: "0.15em",
                      color: "#d97706",
                      border: "1px solid rgba(217,119,6,0.4)",
                      padding: "0 4px",
                      background: "rgba(217,119,6,0.08)",
                    }}
                  >
                    NEW
                  </span>
                )}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#44403c",
                  }}
                >
                  {expandedClue === c.id ? "▲" : "▼"}
                </span>
              </div>
              {expandedClue === c.id && (
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#78716c",
                    lineHeight: 1.6,
                    padding: "5px 10px 8px 24px",
                    borderBottom: "1px solid rgba(41,37,36,0.25)",
                  }}
                >
                  {c.description}
                  {c.dcToRead && (
                    <span style={{ color: "#44403c", marginLeft: 8 }}>
                      [DC {c.dcToRead}]
                    </span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quests */}
      <div style={{ border: "1px solid rgba(41,37,36,0.5)" }}>
        <button
          onClick={() => setShowQuests(!showQuests)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 10px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#d97706",
              letterSpacing: "0.15em",
            }}
          >
            ⬡ MISI AKTIF
          </span>
          <span
            style={{ fontFamily: "monospace", fontSize: 9, color: "#44403c" }}
          >
            {
              QUESTS.filter(
                (q) => (state.questProgress[q.id] ?? "locked") === "success",
              ).length
            }
            /{QUESTS.length} {showQuests ? "▲" : "▼"}
          </span>
        </button>

        {showQuests && (
          <div style={{ borderTop: "1px solid rgba(41,37,36,0.4)" }}>
            {QUESTS.filter((q) => q.round <= state.round + 1).map((q) => {
              const status = state.questProgress[q.id] ?? "locked";
              return (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    padding: "6px 10px",
                    borderBottom: "1px solid rgba(41,37,36,0.25)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: QUEST_COLORS[status],
                      marginTop: 1,
                    }}
                  >
                    {QUEST_ICONS[status]}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 10,
                        color:
                          status === "active"
                            ? "#e7e5e4"
                            : QUEST_COLORS[status],
                      }}
                    >
                      {q.title}
                    </div>
                    {status === "active" && (
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 9,
                          color: "#57534e",
                          marginTop: 2,
                        }}
                      >
                        {q.objective}
                      </div>
                    )}
                  </div>
                  {status === "active" && (
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 9,
                        color: "#d97706",
                        flexShrink: 0,
                      }}
                    >
                      DC {q.dc}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// OverlayDice sudah dipindah ke overlay-dice.tsx
// (sistem pilihan 5 aksi + D20 + outcome per karakter)
export { OverlayDice } from "./overlay-dice";

// ═══════════════════════════════════════════════════════
// OVERLAY INFILTRATOR
// ═══════════════════════════════════════════════════════

export function OverlayInfiltrator(): JSX.Element {
  const { state, myPlayer, isInfiltrator, isCatalyst, dispatch } = useGame();
  const [confirming, setConfirming] = useState<InfiltratorAction | null>(null);
  const [executed, setExecuted] = useState<string[]>([]);

  if (!isInfiltrator && !isCatalyst) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <p style={{ fontFamily: "monospace", fontSize: 11, color: "#44403c" }}>
          Panel ini hanya tersedia untuk Infiltrator dan Catalyst.
        </p>
      </div>
    );
  }

  const isAvailable = (a: InfiltratorAction): boolean => {
    if (a.isOnce && state.infiltrator.usedActionIds.includes(a.id))
      return false;
    if ((state.infiltrator.cooldowns[a.id] ?? 0) > 0) return false;
    if (executed.includes(a.id)) return false;
    if (a.availableFrom > state.round) return false;
    return true;
  };

  const handleExecute = (a: InfiltratorAction) => {
    dispatch({
      type: "EXEC_INFIL_ACTION",
      actionId: a.id,
      cooldown: a.cooldown,
      isOnce: a.isOnce,
    });
    if (isCatalyst) dispatch({ type: "INCREMENT_CATALYST" });
    if (a.id === "blackout") {
      dispatch({ type: "SET_BLACKOUT", active: true });
      setTimeout(
        () => dispatch({ type: "SET_BLACKOUT", active: false }),
        10_000,
      );
    }
    dispatch({
      type: "PUSH_LOG",
      entry: {
        type: "ALERT",
        color: "#f87171",
        text: `Aksi rahasia dieksekusi.`,
      },
    });
    setExecuted((p) => [...p, a.id]);
    setConfirming(null);
  };

  const availableActions = INFILTRATOR_ACTIONS.filter(
    (a) => a.availableFrom <= state.round,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Warning banner */}
      <div
        style={{
          padding: "7px 10px",
          border: "1px solid rgba(248,113,113,0.2)",
          background: "rgba(248,113,113,0.06)",
          fontFamily: "monospace",
          fontSize: 9,
          color: "#f87171",
          lineHeight: 1.6,
        }}
      >
        ⚠{" "}
        {isInfiltrator
          ? "Panel ini hanya terlihat olehmu. Tindakan tidak diketahui pemain lain — kecuali mereka berhasil mendeteksimu."
          : "Kamu adalah Catalyst. Bertindak bersama Infiltrator 2+ kali → kamu berpihak pada mereka."}
      </div>

      {/* Confirm dialog */}
      {confirming && (
        <div
          style={{
            border: "1px solid rgba(248,113,113,0.4)",
            padding: "12px",
            background: "rgba(8,3,3,0.99)",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#f87171",
              letterSpacing: "0.15em",
              marginBottom: 6,
            }}
          >
            ⚠ KONFIRMASI: {confirming.name}
          </div>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#78716c",
              lineHeight: 1.6,
              marginBottom: 6,
            }}
          >
            {confirming.effect}
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#44403c",
              marginBottom: 10,
            }}
          >
            Risiko deteksi: DC {confirming.dcDetect}
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => handleExecute(confirming)}
              style={{
                flex: 1,
                padding: "5px",
                border: "1px solid #f87171",
                color: "#f87171",
                background: "transparent",
                fontFamily: "monospace",
                fontSize: 10,
                letterSpacing: "0.12em",
                cursor: "pointer",
              }}
            >
              LANJUTKAN
            </button>
            <button
              onClick={() => setConfirming(null)}
              style={{
                flex: 1,
                padding: "5px",
                border: "1px solid rgba(87,83,78,0.4)",
                color: "#57534e",
                background: "transparent",
                fontFamily: "monospace",
                fontSize: 10,
                letterSpacing: "0.12em",
                cursor: "pointer",
              }}
            >
              BATALKAN
            </button>
          </div>
        </div>
      )}

      {/* Actions list */}
      {availableActions.map((a) => {
        const avail = isAvailable(a);
        const cdLeft = state.infiltrator.cooldowns[a.id] ?? 0;
        const used = a.isOnce && state.infiltrator.usedActionIds.includes(a.id);
        return (
          <div
            key={a.id}
            style={{
              border: `1px solid ${avail ? "rgba(248,113,113,0.3)" : "rgba(41,37,36,0.4)"}`,
              background: "rgba(4,3,2,0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 10px",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: "bold",
                  letterSpacing: "0.12em",
                  color: avail ? "#f87171" : "#44403c",
                }}
              >
                {a.name}
              </span>
              {used ? (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "#44403c",
                    border: "1px solid rgba(41,37,36,0.4)",
                    padding: "0 6px",
                  }}
                >
                  USED
                </span>
              ) : cdLeft > 0 ? (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "#57534e",
                    border: "1px solid rgba(87,83,78,0.3)",
                    padding: "0 6px",
                  }}
                >
                  CD {cdLeft}R
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "#4ade80",
                    border: "1px solid rgba(74,222,128,0.3)",
                    padding: "0 6px",
                  }}
                >
                  READY
                </span>
              )}
            </div>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: avail ? "#a8a29e" : "#44403c",
                padding: "0 10px 5px",
                lineHeight: 1.5,
              }}
            >
              {a.description}
            </p>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "#57534e",
                padding: "0 10px 5px",
                borderLeft: "2px solid rgba(248,113,113,0.2)",
                margin: "0 10px 6px",
                lineHeight: 1.5,
              }}
            >
              Efek: {a.effect}
            </p>
            <div style={{ padding: "0 10px 8px" }}>
              <button
                onClick={() => setConfirming(a)}
                disabled={!avail}
                style={{
                  width: "100%",
                  padding: "4px",
                  border: `1px solid ${avail ? "#f87171" : "rgba(87,83,78,0.3)"}`,
                  color: avail ? "#f87171" : "#44403c",
                  background: "transparent",
                  fontFamily: "monospace",
                  fontSize: 9,
                  fontWeight: "bold",
                  letterSpacing: "0.15em",
                  cursor: avail ? "pointer" : "not-allowed",
                  opacity: avail ? 1 : 0.4,
                }}
              >
                AKTIFKAN
              </button>
            </div>
          </div>
        );
      })}

      {/* Catalyst alignment bar */}
      {isCatalyst && (
        <div
          style={{
            border: "1px solid rgba(251,146,60,0.3)",
            padding: "10px",
            background: "rgba(251,146,60,0.04)",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#fb923c",
              letterSpacing: "0.15em",
              marginBottom: 6,
            }}
          >
            ⚡ CATALYST ALIGNMENT
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                flex: 1,
                height: 3,
                background: "rgba(41,37,36,0.5)",
                borderRadius: 0,
              }}
            >
              <div
                style={{
                  width: `${Math.min((state.catalystAllyCount / 2) * 100, 100)}%`,
                  height: "100%",
                  background: "#fb923c",
                  transition: "width .4s",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: state.catalystAllyCount >= 2 ? "#fb923c" : "#57534e",
              }}
            >
              {state.catalystAllyCount}/2
            </span>
          </div>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#57534e",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {state.catalystAllyCount >= 2
              ? "Kamu telah berpihak pada Infiltrator."
              : `Bertindak ${2 - state.catalystAllyCount}x lagi bersama Infiltrator untuk berpihak.`}
          </p>
        </div>
      )}

      {/* Status summary */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "8px 0",
          borderTop: "1px solid rgba(248,113,113,0.15)",
        }}
      >
        {[
          {
            label: "BLACKOUT",
            val: state.infiltrator.blackoutUsed ? "USED" : "READY",
            ok: !state.infiltrator.blackoutUsed,
          },
          {
            label: "AKSI RONDE",
            val: `${executed.length}/1`,
            ok: executed.length === 0,
          },
          {
            label: "TOTAL AKSI",
            val: `${state.infiltrator.usedActionIds.length}`,
            ok: true,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "#44403c",
                letterSpacing: "0.12em",
              }}
            >
              {s.label}
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: s.ok ? "#57534e" : "#f87171",
              }}
            >
              {s.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OVERLAY VOTE
// ═══════════════════════════════════════════════════════

export function OverlayVote(): JSX.Element {
  const {
    state,
    myPlayer,
    activePlayers,
    voteLeader,
    hasMajority,
    dispatch,
    advancePhase,
  } = useGame();

  const phase = state.phase;

  // ── Resolusi ronde ──
  if (phase === "resolution") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "24px 16px",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 13,
            color: "#d97706",
            letterSpacing: "0.15em",
          }}
        >
          RONDE {state.round} SELESAI
        </span>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#78716c",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {state.eliminatedThisRound.length > 0
            ? `${state.eliminatedThisRound.length} pemain dieliminasi ronde ini.`
            : "Tidak ada eliminasi. Ancaman masih ada di antara kalian."}
        </p>
        <button
          onClick={advancePhase}
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            letterSpacing: "0.15em",
            padding: "7px 24px",
            border: "1px solid rgba(217,119,6,0.5)",
            color: "#d97706",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          RONDE BERIKUTNYA →
        </button>
      </div>
    );
  }

  const totalActive = activePlayers.length;
  const trialTarget = state.trialTargetId
    ? state.players.find((p) => p.userId === state.trialTargetId)
    : null;

  const trialDC = 14;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Header status */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 9,
          color: "#57534e",
          letterSpacing: "0.15em",
        }}
      >
        {phase === "voting"
          ? "PILIH SIAPA YANG PALING MENCURIGAKAN"
          : phase === "trial"
            ? `SIDANG — ${trialTarget?.displayName ?? "?"}`
            : "VOTING"}
      </div>

      {/* Majority notice */}
      {hasMajority && voteLeader && phase === "voting" && (
        <div
          style={{
            padding: "6px 10px",
            border: "1px solid rgba(251,191,36,0.3)",
            background: "rgba(251,191,36,0.05)",
            fontFamily: "monospace",
            fontSize: 10,
            color: "#fbbf24",
            textAlign: "center",
          }}
        >
          Mayoritas tercapai.{" "}
          {
            state.players.find((p) => p.userId === voteLeader.targetId)
              ?.displayName
          }{" "}
          dibawa ke sidang.
        </div>
      )}

      {/* Player list */}
      {state.players.map((p) => {
        const isElim = p.isEliminated;
        const vcount = (state.voteMap[p.userId] ?? []).length;
        const pct =
          totalActive > 0 ? Math.round((vcount / totalActive) * 100) : 0;
        const isMyVote = state.myVoteTarget === p.userId;

        return (
          <div
            key={p.userId}
            style={{
              border: `1px solid ${isMyVote ? "rgba(248,113,113,0.5)" : "rgba(41,37,36,0.5)"}`,
              background: isMyVote
                ? "rgba(248,113,113,0.06)"
                : "rgba(4,3,2,0.5)",
              opacity: isElim ? 0.35 : 1,
              padding: "7px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Avatar */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: "1px solid rgba(87,83,78,0.5)",
                  background: "rgba(8,5,3,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: "bold",
                  color: "#78716c",
                  flexShrink: 0,
                }}
              >
                {p.displayName.slice(0, 2).toUpperCase()}
              </div>

              {/* Name + tokens */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: isElim ? "#44403c" : "#e7e5e4",
                    textDecoration: isElim ? "line-through" : "none",
                  }}
                >
                  {p.displayName}
                  {p.userId === state.myUserId && (
                    <span style={{ color: "#57534e", marginLeft: 6 }}>
                      (KAMU)
                    </span>
                  )}
                </div>
                {p.suspicionTokens > 0 && (
                  <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                    {Array.from(
                      { length: Math.min(p.suspicionTokens, 5) },
                      (_, i) => (
                        <div
                          key={i}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#f87171",
                          }}
                        />
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Vote count */}
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: vcount > 0 ? "#f87171" : "#44403c",
                }}
              >
                {vcount}
              </span>

              {/* Button */}
              {!isElim &&
                (isMyVote ? (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: "#f87171",
                      border: "1px solid rgba(248,113,113,0.4)",
                      padding: "2px 8px",
                    }}
                  >
                    ✓ PILIHMU
                  </span>
                ) : state.myVoteTarget ? (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: "#44403c",
                      border: "1px solid rgba(41,37,36,0.3)",
                      padding: "2px 8px",
                    }}
                  >
                    —
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      dispatch({
                        type: "CAST_VOTE",
                        voterId: state.myUserId,
                        targetId: p.userId,
                      });
                    }}
                    disabled={phase !== "voting"}
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      padding: "2px 10px",
                      border: "1px solid rgba(87,83,78,0.5)",
                      color: "#78716c",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    TUDUH
                  </button>
                ))}
              {isElim && (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "#44403c",
                    border: "1px solid rgba(41,37,36,0.3)",
                    padding: "1px 6px",
                  }}
                >
                  ELIM
                </span>
              )}
            </div>

            {/* Vote bar */}
            {vcount > 0 && (
              <div style={{ height: 2, background: "rgba(41,37,36,0.4)" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: "#f87171",
                    transition: "width .4s",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Trial section */}
      {phase === "trial" && trialTarget && (
        <div
          style={{
            border: "1px solid rgba(251,191,36,0.3)",
            background: "rgba(251,191,36,0.04)",
            padding: "10px",
            marginTop: 4,
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#fbbf24",
              letterSpacing: "0.15em",
              marginBottom: 8,
            }}
          >
            SIDANG — {trialTarget.displayName.toUpperCase()}
          </div>

          {state.trialRollResult === null ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "#78716c",
                  flex: 1,
                }}
              >
                Terdakwa dapat melakukan Persuasion Check (CHA) DC {trialDC}{" "}
                untuk membebaskan diri.
              </p>
              <button
                onClick={() => {
                  const cls = DND_CLASSES[trialTarget.classId];
                  const raw = Math.floor(Math.random() * 20) + 1;
                  const mod = Math.floor((cls.stats.CHA - 10) / 2);
                  dispatch({ type: "SET_TRIAL_ROLL", result: raw + mod });
                }}
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  padding: "4px 12px",
                  border: "1px solid rgba(251,191,36,0.4)",
                  color: "#fbbf24",
                  background: "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                ROLL CHA
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    color: "#78716c",
                  }}
                >
                  Hasil persuasion:
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 24,
                    fontWeight: "bold",
                    color:
                      state.trialRollResult >= trialDC ? "#4ade80" : "#f87171",
                  }}
                >
                  {state.trialRollResult}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color:
                      state.trialRollResult >= trialDC ? "#4ade80" : "#f87171",
                  }}
                >
                  {state.trialRollResult >= trialDC ? "SELAMAT" : "GUILTY"}
                </span>
              </div>
              <button
                onClick={() => {
                  dispatch({
                    type: "ELIMINATE_PLAYER",
                    targetId: trialTarget.userId,
                  });
                  advancePhase();
                }}
                style={{
                  padding: "6px",
                  border: `1px solid ${state.trialRollResult >= trialDC ? "#4ade80" : "#f87171"}`,
                  color:
                    state.trialRollResult >= trialDC ? "#4ade80" : "#f87171",
                  background: "transparent",
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {state.trialRollResult >= trialDC
                  ? "BEBASKAN — TIDAK CUKUP BUKTI"
                  : "ELIMINATE — KEPUTUSAN BULAT"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
