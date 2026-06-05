"use client";

// ─────────────────────────────────────────────────────────
// dice-roller.tsx
// Komponen D20 yang bisa dimainkan secara mandiri.
// Fitur: animasi spin, advantage/disadvantage, DC check,
// label hasil (CRITICAL HIT, FAIL, dll), narasi singkat.
// ─────────────────────────────────────────────────────────

import { useState, useCallback, JSX } from "react";
import { StatKey } from "./init-game";

// ── Tipe ──────────────────────────────────────────────────

export interface DiceConfig {
  label: string; // Nama check, e.g. "Intimidasi musuh"
  stat: StatKey;
  statValue: number; // Nilai stat (bukan modifier) e.g. 8
  dc?: number; // Difficulty Class (opsional)
  advantage?: boolean;
  disadvantage?: boolean;
}

export interface RollResult {
  raw: number; // Angka murni dadu sebelum modifier
  modifier: number; // Bonus dari stat
  total: number; // raw + modifier
  dc?: number;
  success?: boolean; // undefined kalau tidak ada DC
  isCrit: boolean;
  isFumble: boolean;
  label: string;
  narrative: string;
}

// ── Helper ────────────────────────────────────────────────

function getModifier(statValue: number): number {
  return Math.floor((statValue - 10) / 2);
}

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

const STAT_COLORS: Record<StatKey, string> = {
  STR: "#f87171",
  DEX: "#4ade80",
  INT: "#e879f9",
  PER: "#60a5fa",
  CHA: "#fbbf24",
};

function getResultLabel(
  raw: number,
  total: number,
  dc?: number,
): { label: string; narrative: string } {
  if (raw === 20)
    return {
      label: "CRITICAL HIT!",
      narrative: "Sempurna. Sesuatu yang tersembunyi terungkap sepenuhnya.",
    };
  if (raw === 1)
    return {
      label: "CRITICAL FAIL",
      narrative:
        "Sesuatu berjalan sangat salah. Semua memperhatikan kegagalan ini.",
    };
  if (dc === undefined) {
    if (total >= 15)
      return {
        label: "GREAT SUCCESS",
        narrative: "Melampaui ekspektasi. Detail tambahan ditemukan.",
      };
    if (total >= 10)
      return {
        label: "SUCCESS",
        narrative: "Berhasil. Informasi berjalan sesuai rencana.",
      };
    if (total >= 6)
      return {
        label: "PARTIAL",
        narrative: "Sebagian berhasil — namun ada yang dikorbankan.",
      };
    return { label: "FAIL", narrative: "Gagal. Informasi tidak cukup." };
  }
  if (total >= dc)
    return { label: "SUCCESS", narrative: "Berhasil melewati DC " + dc + "." };
  return {
    label: "FAIL",
    narrative: "Tidak mencapai DC " + dc + ". Coba lagi.",
  };
}

// ── D20 SVG ───────────────────────────────────────────────

function D20Icon({
  value,
  spinning,
  strokeColor,
}: {
  value: number;
  spinning: boolean;
  strokeColor: string;
}): JSX.Element {
  const textFill =
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
      width={84}
      height={84}
      style={{
        display: "block",
        cursor: "pointer",
        flexShrink: 0,
        animation: spinning ? "d20spin 0.25s linear infinite" : "none",
      }}
    >
      <style>{`@keyframes d20spin{from{transform-origin:50% 50%;transform:rotate(0deg) scale(1)}to{transform-origin:50% 50%;transform:rotate(360deg) scale(0.95)}}`}</style>
      {/* Outer hex */}
      <polygon
        points="50,4 96,32 96,68 50,96 4,68 4,32"
        fill="rgba(12,8,5,0.97)"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {/* Inner hex */}
      <polygon
        points="50,15 84,35 84,65 50,85 16,65 16,35"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.7"
        opacity="0.35"
      />
      {/* Corner dots */}
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
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="2.5"
          fill={strokeColor}
          opacity="0.8"
        />
      ))}
      {/* Number */}
      <text
        x="50"
        y="57"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={value >= 10 ? 28 : 32}
        fontWeight="bold"
        fill={textFill}
      >
        {spinning ? "?" : value}
      </text>
    </svg>
  );
}

export function DiceRoller({
  config,
  onResult,
  disabled = false,
}: {
  config: DiceConfig;
  onResult?: (r: RollResult) => void;
  disabled?: boolean;
}): JSX.Element {
  const [display, setDisplay] = useState(20);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);
  const [advMode, setAdvMode] = useState<"none" | "adv" | "dis">("none");

  const modifier = getModifier(config.statValue);
  const statColor = STAT_COLORS[config.stat];

  const handleRoll = useCallback(() => {
    if (spinning || disabled) return;
    setSpinning(true);
    setResult(null);

    let ticks = 0;
    const interval = setInterval(() => {
      setDisplay(rollD20());
      ticks++;
      if (ticks >= 18) {
        clearInterval(interval);

        // Roll dengan advantage / disadvantage
        let raw = rollD20();
        if (advMode === "adv") raw = Math.max(raw, rollD20());
        if (advMode === "dis") raw = Math.min(raw, rollD20());

        const total = raw + modifier;
        const success =
          config.dc !== undefined ? total >= config.dc : undefined;
        const isCrit = raw === 20;
        const isFumble = raw === 1;
        const { label, narrative } = getResultLabel(raw, total, config.dc);

        const r: RollResult = {
          raw,
          modifier,
          total,
          dc: config.dc,
          success,
          isCrit,
          isFumble,
          label,
          narrative,
        };

        setDisplay(raw);
        setSpinning(false);
        setResult(r);
        onResult?.(r);
      }
    }, 55);
  }, [spinning, disabled, modifier, advMode, config.dc, onResult]);

  const reset = () => {
    setResult(null);
    setDisplay(20);
  };

  // Warna hasil
  const resultColor = result
    ? result.isCrit
      ? "#fbbf24"
      : result.isFumble
        ? "#f87171"
        : result.success === true
          ? "#4ade80"
          : result.success === false
            ? "#f87171"
            : "#e7e5e4"
    : "#57534e";

  const strokeColor = spinning ? "#44403c" : resultColor;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "12px",
        border: "1px solid rgba(41,37,36,0.6)",
        background: "rgba(4,3,2,0.7)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "#a8a29e",
            letterSpacing: "0.1em",
          }}
        >
          {config.label.toUpperCase()}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            fontWeight: "bold",
            letterSpacing: "0.15em",
            color: statColor,
            border: `1px solid ${statColor}50`,
            padding: "1px 7px",
            background: `${statColor}10`,
          }}
        >
          {config.stat} {modifier >= 0 ? "+" : ""}
          {modifier}
        </span>
      </div>

      {/* Dice + result row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* D20 */}
        <div onClick={!spinning && !result ? handleRoll : undefined}>
          <D20Icon
            value={display}
            spinning={spinning}
            strokeColor={strokeColor}
          />
        </div>

        {/* Info / Result */}
        <div style={{ flex: 1 }}>
          {!result ? (
            <>
              {/* DC badge */}
              {config.dc && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      color: "#57534e",
                    }}
                  >
                    DC
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#a8a29e",
                      border: "1px solid rgba(87,83,78,0.4)",
                      padding: "0 6px",
                    }}
                  >
                    {config.dc}
                  </span>
                </div>
              )}

              {/* Adv / Dis buttons */}
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {(["adv", "dis"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setAdvMode(advMode === m ? "none" : m)}
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      letterSpacing: "0.1em",
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

              {/* Roll button */}
              <button
                onClick={handleRoll}
                disabled={disabled || spinning}
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  padding: "5px 16px",
                  border: "1px solid rgba(217,119,6,0.5)",
                  color: "#d97706",
                  background: "transparent",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.3 : 1,
                }}
              >
                ▶ LEMPAR DADU
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Total number */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
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
                {config.dc && (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#57534e",
                    }}
                  >
                    / {config.dc}
                  </span>
                )}
              </div>

              {/* Label badge */}
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  fontWeight: "bold",
                  color: resultColor,
                  border: `1px solid ${resultColor}40`,
                  padding: "1px 6px",
                  display: "inline-block",
                  width: "fit-content",
                }}
              >
                {result.label}
              </span>

              {/* Success / fail verdict */}
              {result.success !== undefined && (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: result.success ? "#4ade80" : "#f87171",
                  }}
                >
                  {result.success ? "✓ BERHASIL" : "✗ GAGAL"}
                </span>
              )}

              {/* Narrative */}
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "#78716c",
                  lineHeight: 1.5,
                  fontStyle: "italic",
                  marginTop: 2,
                }}
              >
                {result.narrative}
              </p>

              {/* Reset */}
              <button
                onClick={reset}
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  color: "#57534e",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  marginTop: 2,
                  textAlign: "left",
                  padding: 0,
                }}
              >
                [ROLL LAGI]
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
