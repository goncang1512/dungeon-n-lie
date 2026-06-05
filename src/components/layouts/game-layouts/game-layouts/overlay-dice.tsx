/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { useState, useCallback, JSX } from "react";
import { useGame } from "./game-state";
import { DND_CLASSES, ROLE_META, StatKey } from "./init-game";
import {
  getScenarioForRound,
  ScenarioChoice,
  getModifier,
} from "./game-choices";

const STAT_COLORS: Record<StatKey, string> = {
  STR: "#f87171",
  DEX: "#4ade80",
  INT: "#e879f9",
  PER: "#60a5fa",
  CHA: "#fbbf24",
};

function D20({
  value,
  spinning,
  color,
  onClick,
}: {
  value: number;
  spinning: boolean;
  color: string;
  onClick: () => void;
}): JSX.Element {
  const numColor =
    value === 20
      ? "#fbbf24"
      : value === 1
        ? "#f87171"
        : spinning
          ? "#57534e"
          : "#e7e5e4";

  return (
    <svg
      viewBox="0 0 100 100"
      width={88}
      height={88}
      style={{
        display: "block",
        cursor: "pointer",
        flexShrink: 0,
        animation: spinning ? "d20spin .25s linear infinite" : "none",
      }}
      onClick={onClick}
    >
      <style>{`@keyframes d20spin{from{transform-origin:50% 50%;transform:rotate(0)}to{transform-origin:50% 50%;transform:rotate(360deg)}}`}</style>
      <polygon
        points="50,4 96,32 96,68 50,96 4,68 4,32"
        fill="rgba(12,8,5,0.97)"
        stroke={color}
        strokeWidth="1.5"
      />
      <polygon
        points="50,15 84,35 84,65 50,85 16,65 16,35"
        fill="none"
        stroke={color}
        strokeWidth=".7"
        opacity=".35"
      />
      {(
        [
          [50, 4],
          [96, 32],
          [96, 68],
          [50, 96],
          [4, 68],
          [4, 32],
        ] as [number, number][]
      ).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill={color} opacity=".8" />
      ))}
      <text
        x="50"
        y="57"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={value >= 10 ? 28 : 32}
        fontWeight="bold"
        fill={numColor}
      >
        {spinning ? "?" : value}
      </text>
    </svg>
  );
}

// ── ChoiceCard ────────────────────────────────────────────

function ChoiceCard({
  choice,
  statValue,
  isSelected,
  isLocked,
  onSelect,
}: {
  choice: ScenarioChoice;
  statValue: number;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
}): JSX.Element {
  const mod = getModifier(statValue);
  const color = STAT_COLORS[choice.stat];

  return (
    <button
      onClick={onSelect}
      disabled={isLocked}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 10px",
        border: `1px solid ${isSelected ? color : "rgba(41,37,36,0.5)"}`,
        background: isSelected ? `${color}10` : "transparent",
        cursor: isLocked ? "default" : "pointer",
        opacity: isLocked && !isSelected ? 0.4 : 1,
        width: "100%",
        textAlign: "left",
        transition: "all .15s",
      }}
    >
      {/* Key letter */}
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: color,
          minWidth: 18,
          marginTop: 1,
          letterSpacing: ".1em",
        }}
      >
        {choice.key}.
      </span>

      {/* Body */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#e7e5e4",
            marginBottom: 3,
          }}
        >
          {choice.title}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {/* Stat badge */}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color,
              border: `1px solid ${color}40`,
              padding: "0 5px",
              letterSpacing: ".1em",
            }}
          >
            {choice.stat} {mod >= 0 ? "+" : ""}
            {mod}
          </span>
          {/* DC */}
          <span
            style={{ fontFamily: "monospace", fontSize: 9, color: "#57534e" }}
          >
            DC {choice.dc}
          </span>
          {/* Bonus indicator */}
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: mod >= 0 ? "#4ade80" : "#f87171",
            }}
          >
            {mod >= 0 ? `+${mod} bonus` : `${mod} penalti`}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── DiceRollPanel ─────────────────────────────────────────

function DiceRollPanel({
  choice,
  classId,
  onDone,
}: {
  choice: ScenarioChoice;
  classId: string;
  onDone: (result: RollData) => void;
}): JSX.Element {
  const cls =
    DND_CLASSES[classId as keyof typeof DND_CLASSES] ?? DND_CLASSES.barbarian;
  const statVal = cls.stats[choice.stat];
  const modifier = getModifier(statVal);
  const color = STAT_COLORS[choice.stat];

  const [display, setDisplay] = useState(20);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RollData | null>(null);
  const [advMode, setAdvMode] = useState<"adv" | "dis" | null>(null);

  const roll = useCallback(() => {
    if (spinning || result) return;
    setSpinning(true);

    let ticks = 0;
    const iv = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 20) + 1);
      ticks++;
      if (ticks >= 18) {
        clearInterval(iv);

        let raw = Math.floor(Math.random() * 20) + 1;
        if (advMode === "adv")
          raw = Math.max(raw, Math.floor(Math.random() * 20) + 1);
        if (advMode === "dis")
          raw = Math.min(raw, Math.floor(Math.random() * 20) + 1);

        const total = raw + modifier;
        const isCrit = raw === 20;
        const isFumble = raw === 1;
        const success = isCrit || (!isFumble && total >= choice.dc);
        const label = isCrit
          ? "CRITICAL HIT!"
          : isFumble
            ? "CRITICAL FAIL"
            : success
              ? "SUCCESS"
              : "FAIL";

        const outcomeKey = success ? "success" : "fail";
        const outcomeText =
          choice.outcomes[outcomeKey][
            classId as keyof typeof choice.outcomes.success
          ] ?? (success ? "Berhasil." : "Gagal.");

        const data: RollData = {
          raw,
          modifier,
          total,
          dc: choice.dc,
          success,
          isCrit,
          isFumble,
          label,
          outcomeText,
        };

        setDisplay(raw);
        setSpinning(false);
        setResult(data);
        onDone(data);
      }
    }, 55);
  }, [spinning, result, modifier, advMode, choice, classId, onDone]);

  const resultColor = result
    ? result.isCrit
      ? "#fbbf24"
      : result.isFumble
        ? "#f87171"
        : result.success
          ? "#4ade80"
          : "#f87171"
    : color;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Selected action recap */}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#78716c",
          fontStyle: "italic",
          borderLeft: `2px solid ${color}`,
          paddingLeft: 8,
        }}
      >
        &quot;{choice.title}&quot;
      </div>

      {/* Dice row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <D20
          value={display}
          spinning={spinning}
          color={result ? resultColor : color}
          onClick={roll}
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#a8a29e",
              marginBottom: 3,
            }}
          >
            {choice.stat} Check — DC {choice.dc}
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#57534e",
              marginBottom: 8,
            }}
          >
            d20 {modifier >= 0 ? "+" : ""}
            {modifier} ({cls.name} {choice.stat}: {statVal})
          </div>

          {!result ? (
            <>
              {/* Adv / Dis */}
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {(["adv", "dis"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setAdvMode(advMode === m ? null : m)}
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      letterSpacing: ".1em",
                      padding: "2px 8px",
                      border: `1px solid ${advMode === m ? (m === "adv" ? "#4ade80" : "#f87171") : "rgba(87,83,78,0.4)"}`,
                      color:
                        advMode === m
                          ? m === "adv"
                            ? "#4ade80"
                            : "#f87171"
                          : "#57534e",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {m === "adv" ? "ADV" : "DIS"}
                  </button>
                ))}
              </div>
              <button
                onClick={roll}
                disabled={spinning}
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: ".12em",
                  padding: "5px 16px",
                  border: `1px solid ${color}60`,
                  color: color,
                  background: "transparent",
                  cursor: "pointer",
                  opacity: spinning ? 0.4 : 1,
                }}
              >
                ▶ LEMPAR DADU
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 30,
                    fontWeight: "bold",
                    color: resultColor,
                  }}
                >
                  {result.total}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#57534e",
                  }}
                >
                  / DC {choice.dc}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  letterSpacing: ".18em",
                  fontWeight: "bold",
                  color: resultColor,
                  border: `1px solid ${resultColor}40`,
                  padding: "1px 7px",
                  display: "inline-block",
                  width: "fit-content",
                }}
              >
                {result.label}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: result.success ? "#4ade80" : "#f87171",
                }}
              >
                {result.success ? "✓ BERHASIL" : "✗ GAGAL"} ({result.raw}{" "}
                {modifier >= 0 ? "+" : ""}
                {modifier} = {result.total})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Character outcome */}
      {result && (
        <div
          style={{
            padding: "8px 10px",
            borderLeft: `2px solid ${resultColor}`,
            background: `${resultColor}08`,
            fontFamily: "monospace",
            fontSize: 11,
            color: "#d6d3d1",
            lineHeight: 1.7,
          }}
        >
          {result.outcomeText}
        </div>
      )}
    </div>
  );
}

// ── Tipe roll result ──────────────────────────────────────

export interface RollData {
  raw: number;
  modifier: number;
  total: number;
  dc: number;
  success: boolean;
  isCrit: boolean;
  isFumble: boolean;
  label: string;
  outcomeText: string;
}

// ── OverlayDice (main export) ─────────────────────────────

export function OverlayDice(): JSX.Element {
  const { state, dispatch, myPlayer } = useGame();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [rollDone, setRollDone] = useState(false);

  const classId = myPlayer?.classId ?? "barbarian";
  const cls = DND_CLASSES[classId] ?? DND_CLASSES.barbarian;
  const scenario = getScenarioForRound(state.round);
  const roleMeta = ROLE_META[myPlayer?.role ?? "survivor"];

  const selectedChoice =
    scenario?.choices.find((c) => c.key === selectedKey) ?? null;

  const handleRollDone = useCallback(
    (result: RollData) => {
      if (!selectedChoice) return;
      setRollDone(true);

      dispatch({
        type: "PUSH_LOG",
        entry: {
          type: result.isCrit
            ? "CRITICAL"
            : result.success
              ? "SUCCESS"
              : "FAIL",
          color: result.isCrit
            ? "#fbbf24"
            : result.success
              ? "#4ade80"
              : "#f87171",
          text: `${cls.name} [${myPlayer?.displayName ?? "?"}] — ${selectedChoice.title}: ${result.label} (${result.total} vs DC ${selectedChoice.dc})`,
        },
      });

      // Jika quest roll
      const quest = state.questProgress[`q${state.round}`];
      if (quest === "active" && result.success) {
        dispatch({
          type: "SET_QUEST",
          questId: `q${state.round}`,
          status: "success",
        });
      }
    },
    [selectedChoice, cls, myPlayer, dispatch, state.round, state.questProgress],
  );

  const reset = () => {
    setSelectedKey(null);
    setRollDone(false);
  };

  if (!scenario) {
    return (
      <div
        style={{
          padding: "20px",
          fontFamily: "monospace",
          fontSize: 11,
          color: "#57534e",
          textAlign: "center",
        }}
      >
        Skenario tidak tersedia untuk ronde ini.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Character + stat mini header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          border: "1px solid rgba(41,37,36,0.5)",
          background: "rgba(8,5,3,0.6)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#57534e",
              letterSpacing: ".15em",
            }}
          >
            KARAKTERMU
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: ".1em",
              color: roleMeta.color,
            }}
          >
            {cls.name.toUpperCase()} — {cls.archetype}
          </span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {(Object.entries(cls.stats) as [StatKey, number][]).map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 8,
                  color: k === cls.primaryStat ? STAT_COLORS[k] : "#44403c",
                  letterSpacing: ".1em",
                }}
              >
                {k}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: "bold",
                  color: k === cls.primaryStat ? STAT_COLORS[k] : "#78716c",
                }}
              >
                {v}
                <span
                  style={{
                    fontSize: 8,
                    color: getModifier(v) >= 0 ? "#4ade80" : "#f87171",
                  }}
                >
                  {" "}
                  {getModifier(v) >= 0 ? "+" : ""}
                  {getModifier(v)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase label */}
      <div>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: "#57534e",
            letterSpacing: ".2em",
            marginBottom: 4,
          }}
        >
          BABAK {state.round} — {scenario.title.toUpperCase()}
        </div>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#a8a29e",
            lineHeight: 1.6,
            borderLeft: "2px solid rgba(217,119,6,0.3)",
            paddingLeft: 8,
            fontStyle: "italic",
          }}
        >
          {scenario.narrative.slice(0, 120)}…
        </p>
      </div>

      {/* Choice selection OR dice panel */}
      {!selectedKey ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#d97706",
              letterSpacing: ".2em",
              marginBottom: 6,
            }}
          >
            PILIH TINDAKANMU — SEMUA PEMAIN AKAN MELIHAT HASILNYA
          </div>
          {scenario.choices.map((c) => (
            <ChoiceCard
              key={c.key}
              choice={c}
              statValue={cls.stats[c.stat]}
              isSelected={false}
              isLocked={false}
              onSelect={() => setSelectedKey(c.key)}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Show chosen */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 9,
              color: "#d97706",
              letterSpacing: ".2em",
              marginBottom: 2,
            }}
          >
            PILIHAN: {selectedChoice?.key}. {selectedChoice?.title}
          </div>

          {selectedChoice && (
            <DiceRollPanel
              choice={selectedChoice}
              classId={classId}
              onDone={handleRollDone}
            />
          )}

          {!rollDone && (
            <button
              onClick={reset}
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                color: "#57534e",
                background: "none",
                border: "none",
                cursor: "pointer",
                letterSpacing: ".1em",
                textAlign: "left",
                padding: 0,
              }}
            >
              ← PILIH ULANG
            </button>
          )}

          {rollDone && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: "#57534e",
                padding: "6px 0",
                borderTop: "1px solid rgba(41,37,36,0.4)",
              }}
            >
              ✓ Hasil dikirim ke semua pemain via System Log.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
