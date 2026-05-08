"use client";
import {
  calculateTotalPower,
  CLASSES,
  DnDClassId,
  STAT_NAMES,
  StatKey,
} from "@/src/types/classes";
import { startTransition, useState } from "react";
import * as THREE from "three";
import { CharacterStage } from "./character-stage";
import { styles } from "./style-char";
import { authClient } from "@/src/lib/auth/client";
import { selectCharacter } from "@/src/actions/character.action";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export type Mats = {
  skinMat: THREE.Material;
  armorMat: THREE.Material;
  clothMat: THREE.Material;
  leatherMat: THREE.Material;
  glowMat: THREE.Material;
  metalMat: THREE.Material;
  goldMat: THREE.Material;
};

export default function CharacterViewer() {
  const { data } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] =
    useState<DnDClassId>("barbarian");

  const selectedClass = CLASSES.find((c) => c.id === selectedClassId)!;
  const totalPower = calculateTotalPower(selectedClass.baseStats);

  const changeCharacter = () => {
    setLoading(true);
    startTransition(async () => {
      await selectCharacter(selectedClassId, data?.user.id ?? "");
      setLoading(false);
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <Link href={"/"} className="brand">
            <div className="sigil">
              <svg viewBox="0 0 32 32" width="28" height="28">
                <path
                  d="M16 2 L28 10 L28 22 L16 30 L4 22 L4 10 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M16 8 L22 14 L16 24 L10 14 Z"
                  fill="currentColor"
                  opacity="0.7"
                />
              </svg>
            </div>
            <div>
              <h1>
                DUNGEON<span className="accent">·</span>CODEX
              </h1>
              <small>CHARACTER CREATION // VOL. I</small>
            </div>
          </Link>
          <div className="status">
            <span className="ember"></span>
            <span>SCROLL OPEN</span>
            <span className="status-divider">⟡</span>
            <span>VI CLASSES // VI ROLES</span>
          </div>
        </header>

        <main className="layout">
          <aside className="sidebar">
            <div className="sidebar-head">
              <h2>PILIH CLASS</h2>
              <p className="sidebar-sub">
                Pemain memilih bebas. Class menentukan stat, skill, dan
                tampilan.
              </p>
            </div>
            <ul className="char-list">
              {CLASSES.map((c) => (
                <li
                  key={c.id}
                  className={`char-item ${selectedClassId === c.id ? "active" : ""}`}
                  onClick={() => setSelectedClassId(c.id)}
                >
                  <div className="char-id">{c.classCode}</div>
                  <div className="char-meta">
                    <div className="char-name">{c.name}</div>
                    <div className="char-role">
                      {c.archetype} · {c.hitDie}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={changeCharacter}
              className="sidebar-foot cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin size-3" /> : "⚔"}{" "}
              FORGED IN SHADOW
            </button>
          </aside>

          <section className="stage">
            <CharacterStage selectedClass={selectedClass} />
            <div className="vignette" />

            <div className="overlay corner-tl">
              <div className="ov-label">CLASS</div>
              <div className="ov-value">{selectedClass.classCode}</div>
            </div>
            <div className="overlay corner-tr">
              <div className="ov-label">HIT DIE</div>
              <div className="ov-value">{selectedClass.hitDie}</div>
            </div>
            <div className="overlay corner-bl">
              <div className="ov-label">PRIMARY</div>
              <div className="ov-value">{selectedClass.primaryStat}</div>
            </div>
            <div className="overlay corner-br">
              <div className="ov-label">POWER</div>
              <div className="ov-value">{totalPower}</div>
            </div>

            <div className="name-display">
              <div className="name-label">
                ⟡ {selectedClass.name.toUpperCase()} ⟡
              </div>
              <div className="name-text">{selectedClass.name}</div>
              <div className="name-title">{selectedClass.archetype}</div>
            </div>
          </section>

          <aside className="panel">
            <section className="panel-section">
              <h3>Hikayat Class</h3>
              <p className="description">{selectedClass.description}</p>
            </section>

            <div className="loadout">
              <div className="loadout-row">
                <span className="loadout-label">⚔ Senjata</span>
                <span className="loadout-value">{selectedClass.weapon}</span>
              </div>
              <div className="loadout-row">
                <span className="loadout-label">⛨ Armor</span>
                <span className="loadout-value">{selectedClass.armor}</span>
              </div>
            </div>

            <div className="power-card">
              <div>
                <div className="power-label">Total Power</div>
                <div className="power-sub">
                  5 Atribut · {selectedClass.hitDie} HP
                </div>
              </div>
              <div className="power-value">{totalPower}</div>
            </div>

            <section className="panel-section">
              <h3>Atribut Class</h3>
              <div className="stats">
                {(Object.keys(selectedClass.baseStats) as StatKey[]).map(
                  (k) => {
                    const isPrimary = selectedClass.primaryStat === k;
                    return (
                      <div
                        key={k}
                        className={`stat-row ${isPrimary ? "primary" : ""}`}
                      >
                        <div className="stat-label">
                          <div className="stat-code">
                            {k}
                            {isPrimary && (
                              <span className="primary-mark">★</span>
                            )}
                          </div>
                          <div className="stat-name">{STAT_NAMES[k]}</div>
                        </div>
                        <div className="stat-bar">
                          <div
                            className="stat-fill"
                            style={{
                              width: `${selectedClass.baseStats[k] * 10}%`,
                            }}
                          />
                        </div>
                        <div className="stat-value">
                          {selectedClass.baseStats[k]
                            .toString()
                            .padStart(2, "0")}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>

            <section className="panel-section">
              <h3>Class Skills</h3>
              {selectedClass.classSkills.map((s) => (
                <div key={s.name} className="skill-card">
                  <div className="skill-name">⟡ {s.name}</div>
                  <div className="skill-desc">{s.desc}</div>
                </div>
              ))}
            </section>

            <section className="panel-section">
              <h3>Sistem Dadu (d20)</h3>
              <ul className="dice-list">
                {selectedClass.diceChecks.map((d, i) => (
                  <li key={i}>
                    <span className="dice-check">{d.check}</span>
                    <span className="dice-arrow">→</span>
                    <code className="dice-formula">{d.formula}</code>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </main>
      </div>
    </>
  );
}
