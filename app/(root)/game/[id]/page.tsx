"use client";
import { useState, useEffect, useRef, JSX } from "react";
import * as THREE from "three";

/* ─── Types ─────────────────────────────────────────────── */
interface Player {
  id: number;
  name: string;
  role: string;
  position: string;
  suspicious: boolean;
  status: "active" | "inactive";
  isYou?: boolean;
}
interface Clue {
  id: number;
  type: string;
  text: string;
  severity: "high" | "medium" | "low";
}

/* ─── Data ──────────────────────────────────────────────── */
const PLAYERS: Player[] = [
  {
    id: 1,
    name: "ALISTAIR",
    role: "INVESTIGATOR",
    position: "top-left",
    suspicious: false,
    status: "active",
  },
  {
    id: 2,
    name: "ELARA",
    role: "ARCHIVIST",
    position: "mid-left",
    suspicious: false,
    status: "active",
  },
  {
    id: 3,
    name: "MORGANE",
    role: "WARDEN",
    position: "bot-left",
    suspicious: false,
    status: "active",
  },
  {
    id: 4,
    name: "YOU (SHALIN)",
    role: "UNKNOWN",
    position: "top-right",
    suspicious: false,
    status: "active",
    isYou: true,
  },
  {
    id: 5,
    name: "CEDRIC",
    role: "SCOUT",
    position: "mid-right",
    suspicious: false,
    status: "active",
  },
  {
    id: 6,
    name: "LUNA",
    role: "MEDIC",
    position: "bot-right",
    suspicious: false,
    status: "active",
  },
];
const CLUES: Clue[] = [
  {
    id: 1,
    type: "MOTION",
    text: "Heavy footsteps recorded near the East Annex.",
    severity: "high",
  },
  {
    id: 2,
    type: "ANOMALY",
    text: "Alistair's vitals spiked for 6 seconds.",
    severity: "medium",
  },
  {
    id: 3,
    type: "SYSTEM",
    text: "Sensor grid disrupted in the Chapel.",
    severity: "low",
  },
];
const NARRATIVE = `"The torches dim. Somewhere in the corridor, a door was left open that should have been sealed. Someone moved when the lights went out."`;
const ACTIONS = ["INVESTIGATE", "PROTECT", "ACCUSE", "WAIT"] as const;
type Action = (typeof ACTIONS)[number];

/* ─── Dungeon Background ────────────────────────────────── */
function DungeonBackground(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use setSize with updateStyle=true so canvas w/h attributes ARE set
    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(1); // keep at 1 to avoid size confusion
    renderer.setSize(W, H, true); // true = also update canvas.style.width/height
    renderer.setClearColor(0x0a0806, 1);
    // No shadow maps — saves perf and avoids black-scene issues

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0806, 8, 32); // linear fog, easier to tune

    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 60);
    camera.position.set(0, 1.8, 1.0);
    camera.lookAt(0, 1.6, -10);

    /* ── Fog — thick darkness beyond torchlight ── */
    scene.fog = new THREE.FogExp2(0x000000, 0.062);

    /* ── NO ambient light — pure torch illumination only ── */
    // A tiny hemisphere so facing-away surfaces aren't invisible void
    const hemi = new THREE.HemisphereLight(0x1a0a03, 0x000000, 0.1);
    scene.add(hemi);

    /* ── Brick palette — warm mid-tones, lit by orange torchlight ── */
    const BW = 0.5,
      BH = 0.24,
      BD = 0.28;
    const SX = BW + 0.04,
      SY = BH + 0.04;

    const bPal: number[] = [
      0x5a3820, 0x4e2e18, 0x60381e, 0x6a4028, 0x4a2e16, 0x5c361c, 0x523018,
      0x6e4230,
    ];

    const bGeo = new THREE.BoxGeometry(BW, BH, BD);
    const mortarMat = new THREE.MeshLambertMaterial({ color: 0x221510 });

    function brick(hex: number): THREE.MeshLambertMaterial {
      const c = new THREE.Color(hex);
      c.multiplyScalar(0.75 + Math.random() * 0.5);
      return new THREE.MeshLambertMaterial({ color: c });
    }

    function addBrickWall(
      cx: number,
      cz: number,
      rotY: number,
      W2: number,
      H2: number,
    ): void {
      const g = new THREE.Group();
      // mortar backing
      const slabMesh = new THREE.Mesh(
        new THREE.BoxGeometry(W2 + 0.08, H2 + 0.08, 0.06),
        mortarMat,
      );
      slabMesh.receiveShadow = false;
      g.add(slabMesh);
      const cols = Math.ceil(W2 / SX) + 1;
      const rows = Math.ceil(H2 / SY) + 1;
      for (let row = 0; row < rows; row++) {
        const ox = row % 2 === 1 ? SX * 0.5 : 0;
        for (let col = -1; col < cols; col++) {
          const lx = col * SX + ox - W2 * 0.5 + BW * 0.5;
          const ly = row * SY - H2 * 0.5 + BH * 0.5;
          if (lx + BW * 0.5 < -W2 * 0.5 - 0.05) continue;
          if (lx - BW * 0.5 > W2 * 0.5 + 0.05) continue;
          const m = new THREE.Mesh(
            bGeo,
            brick(bPal[Math.floor(Math.random() * bPal.length)]),
          );
          m.position.set(
            lx + (Math.random() - 0.5) * 0.006,
            ly + (Math.random() - 0.5) * 0.005,
            BD * 0.5 + 0.02,
          );
          m.rotation.z = (Math.random() - 0.5) * 0.01;
          g.add(m);
        }
      }
      g.position.set(cx, H2 * 0.5, cz);
      g.rotation.y = rotY;
      scene.add(g);
    }

    function addStoneFloor(z0: number, z1: number, w: number): void {
      const SW = 0.95,
        SD = 1.15;
      const pal: number[] = [0x3a2e22, 0x332819, 0x40301e, 0x3c2d1c];
      const cols = Math.ceil(w / SW) + 1;
      const rows = Math.ceil((z1 - z0) / SD) + 2;
      for (let r = 0; r < rows; r++) {
        const ox = r % 2 === 1 ? SW * 0.5 : 0;
        for (let c = -1; c < cols; c++) {
          const col = new THREE.Color(
            pal[Math.floor(Math.random() * pal.length)],
          );
          col.multiplyScalar(0.8 + Math.random() * 0.4);
          const s = new THREE.Mesh(
            new THREE.BoxGeometry(SW - 0.03, 0.1, SD - 0.03),
            new THREE.MeshLambertMaterial({ color: col }),
          );
          s.position.set(
            c * (SW + 0.04) + ox - w * 0.5 + SW * 0.5,
            -0.05,
            z0 + r * (SD + 0.04),
          );
          scene.add(s);
        }
      }
    }

    function addCeiling(z0: number, z1: number, w: number, h: number): void {
      const CW2 = 1.2,
        CD = 1.4;
      const cols = Math.ceil(w / CW2) + 1;
      const rows = Math.ceil((z1 - z0) / CD) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const col = new THREE.Color(0x2a1e12);
          col.multiplyScalar(0.5 + Math.random() * 0.4);
          const b = new THREE.Mesh(
            new THREE.BoxGeometry(
              CW2 - 0.05,
              0.18 + Math.random() * 0.1,
              CD - 0.05,
            ),
            new THREE.MeshLambertMaterial({ color: col }),
          );
          b.position.set(
            c * (CW2 + 0.05) - w * 0.5 + CW2 * 0.5,
            h + 0.08,
            z0 + r * (CD + 0.05),
          );
          scene.add(b);
        }
      }
    }

    function addPillar(x: number, z: number, h: number): void {
      const pW = 0.3,
        pD = 0.3;
      const g = new THREE.Group();
      const pillarBase = new THREE.Mesh(
        new THREE.BoxGeometry(pW + 0.08, h, pD + 0.08),
        new THREE.MeshLambertMaterial({ color: 0x1a1008 }),
      );
      pillarBase.position.set(0, h / 2, 0);
      g.add(pillarBase);
      const rowCnt = Math.ceil(h / SY) + 1;
      for (let row = 0; row < rowCnt; row++) {
        const ly = row * SY + BH / 2;
        for (let side = 0; side < 4; side++) {
          const col = new THREE.Color(
            bPal[Math.floor(Math.random() * bPal.length)],
          );
          col.multiplyScalar(0.65 + Math.random() * 0.45);
          const blk = new THREE.Mesh(
            new THREE.BoxGeometry(
              side % 2 === 0 ? pW + 0.08 : 0.08,
              BH,
              side % 2 === 1 ? pD + 0.08 : 0.08,
            ),
            new THREE.MeshLambertMaterial({ color: col }),
          );
          blk.position.set(
            side === 2 ? -(pW / 2 + 0.04) : side === 3 ? pW / 2 + 0.04 : 0,
            ly,
            side === 0 ? -(pD / 2 + 0.04) : side === 1 ? pD / 2 + 0.04 : 0,
          );
          g.add(blk);
        }
      }
      g.position.set(x, 0, z);
      scene.add(g);
    }

    function addArch(z: number, cw: number, ch: number): void {
      for (let i = 0; i <= 10; i++) {
        const a = (Math.PI / 10) * i;
        const s = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.3, 0.38),
          new THREE.MeshLambertMaterial({
            color: bPal[Math.floor(Math.random() * bPal.length)],
          }),
        );
        s.position.set(
          -Math.cos(a) * (cw / 2 - 0.12),
          ch + Math.sin(a) * 0.6,
          z,
        );
        s.rotation.z = -a + Math.PI / 2;
        scene.add(s);
      }
    }

    /* ── Build corridor ── */
    const CW = 5.8,
      CH = 4.0,
      CL = 38;
    const ZS = 1.5,
      ZE = ZS - CL;
    const midZ = (ZS + ZE) / 2;

    addBrickWall(-CW / 2, midZ, Math.PI / 2, CL, CH);
    addBrickWall(CW / 2, midZ, -Math.PI / 2, CL, CH);
    addBrickWall(0, ZE, 0, CW, CH);
    addStoneFloor(ZE - 1, ZS + 1, CW);
    addCeiling(ZE - 1, ZS + 1, CW, CH);
    [-2.4, 2.4].forEach((px) =>
      [-4, -11, -19, -27].forEach((pz) => addPillar(px, pz, CH)),
    );
    [-4, -11, -19, -27].forEach((z) => addArch(z, CW, CH));

    /* ── Torches — sole light source, 3 layers each ── */
    const tPos: [number, number, number][] = [
      [-CW / 2 + 0.25, 2.5, -4],
      [CW / 2 - 0.25, 2.5, -4],
      [-CW / 2 + 0.25, 2.5, -11],
      [CW / 2 - 0.25, 2.5, -11],
      [-CW / 2 + 0.25, 2.5, -19],
      [CW / 2 - 0.25, 2.5, -19],
    ];

    interface TorchGroup {
      core: THREE.PointLight;
      coreBase: number;
      corePhase: number;
      mid: THREE.PointLight;
      midBase: number;
      midPhase: number;
      glow: THREE.PointLight;
      glowBase: number;
      glowPhase: number;
    }
    const torchGroups: TorchGroup[] = [];
    const bMat = new THREE.MeshLambertMaterial({ color: 0x2a1a08 });

    // Animated flame refs for scale pulsing
    const flameRefs: { mesh: THREE.Mesh; phase: number }[] = [];

    tPos.forEach(([x, y, z]) => {
      const tz = z + (x < 0 ? 0.16 : -0.16);
      const wallOffset = x < 0 ? 0.04 : -0.04; // bracket presses against wall

      /* ── Physical torch geometry ── */

      // Wall mount plate
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.22, 0.04),
        new THREE.MeshLambertMaterial({ color: 0x1a1208 }),
      );
      plate.position.set(x + wallOffset, y, z - wallOffset * 0.5);
      scene.add(plate);

      // Horizontal bracket arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.28), bMat);
      arm.position.set(x, y + 0.04, z + (x < 0 ? 0.12 : -0.12));
      scene.add(arm);

      // Torch handle (vertical rod)
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6),
        bMat,
      );
      handle.position.set(x, y + 0.1, tz);
      scene.add(handle);

      // Bowl / cup
      const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.04, 0.1, 8),
        new THREE.MeshLambertMaterial({ color: 0x3a2808 }),
      );
      bowl.position.set(x, y + 0.25, tz);
      scene.add(bowl);

      // Ember glow disc inside bowl
      const ember = new THREE.Mesh(
        new THREE.CircleGeometry(0.055, 8),
        new THREE.MeshBasicMaterial({ color: 0xff6600 }),
      );
      ember.rotation.x = -Math.PI / 2;
      ember.position.set(x, y + 0.3, tz);
      scene.add(ember);

      /* ── Flame — 4 nested cones, different sizes & opacity ── */
      const flameLayers = [
        { color: 0xff2200, r: 0.09, h: 0.32, op: 1.0, yo: 0.0 }, // base orange-red
        { color: 0xff7700, r: 0.07, h: 0.4, op: 0.9, yo: 0.04 }, // mid orange
        { color: 0xffbb00, r: 0.04, h: 0.3, op: 0.8, yo: 0.08 }, // inner yellow
        { color: 0xffffff, r: 0.015, h: 0.16, op: 0.6, yo: 0.14 }, // core white-hot tip
      ];
      flameLayers.forEach(({ color, r, h: fh, op, yo }, fi) => {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(r, fh, 8),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: op,
            depthWrite: false,
          }),
        );
        cone.position.set(x, y + 0.36 + yo, tz);
        scene.add(cone);
        if (fi === 1)
          flameRefs.push({ mesh: cone, phase: Math.random() * Math.PI * 2 });
      });

      // Spark particles — small bright dots around flame
      for (let s = 0; s < 5; s++) {
        const spark = new THREE.Mesh(
          new THREE.SphereGeometry(0.012, 4, 4),
          new THREE.MeshBasicMaterial({
            color: 0xffdd88,
            transparent: true,
            opacity: 0.7,
          }),
        );
        spark.position.set(
          x + (Math.random() - 0.5) * 0.12,
          y + 0.38 + Math.random() * 0.18,
          tz + (Math.random() - 0.5) * 0.12,
        );
        scene.add(spark);
      }

      /* ── 3-layer point lights ── */

      // LAYER 1 — Core: hot white-orange, very short range, intense
      // Creates the "burning hot" centre right at the flame
      const core = new THREE.PointLight(0xffcc88, 20.0, 4.0);
      core.position.set(x, y + 0.42, tz);
      scene.add(core);

      // LAYER 2 — Mid: warm orange, medium range
      // Illuminates the nearby brickwork and floor
      const mid = new THREE.PointLight(0xff7722, 15.0, 12.0);
      mid.position.set(x, y + 0.36, tz);
      scene.add(mid);

      // LAYER 3 — Far glow: deep amber, long soft falloff
      // Fills the corridor between torches so it's not pitch black
      const glow = new THREE.PointLight(0xff4400, 9.5, 22.0);
      glow.position.set(x, y + 0.2, tz);
      scene.add(glow);

      torchGroups.push({
        core,
        coreBase: 20.0,
        corePhase: Math.random() * Math.PI * 2,
        mid,
        midBase: 15.0,
        midPhase: Math.random() * Math.PI * 2 + 0.7,
        glow,
        glowBase: 9.5,
        glowPhase: Math.random() * Math.PI * 2 + 1.4,
      });
    });

    /* ── Ground mist — denser at floor level ── */
    const mist = new THREE.Mesh(
      new THREE.PlaneGeometry(CW, CL),
      new THREE.MeshBasicMaterial({
        color: 0x100806,
        transparent: true,
        opacity: 0.45,
      }),
    );
    mist.rotation.x = -Math.PI / 2;
    mist.position.set(0, 0.08, midZ);
    scene.add(mist);

    // Second thinner layer slightly higher
    const mist2 = new THREE.Mesh(
      new THREE.PlaneGeometry(CW, CL),
      new THREE.MeshBasicMaterial({
        color: 0x0d0603,
        transparent: true,
        opacity: 0.25,
      }),
    );
    mist2.rotation.x = -Math.PI / 2;
    mist2.position.set(0, 0.28, midZ);
    scene.add(mist2);

    /* ── Animate ── */
    let frame = 0,
      animId: number;
    const animate = (): void => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.016;

      torchGroups.forEach(
        ({
          core,
          coreBase,
          corePhase,
          mid,
          midBase,
          midPhase,
          glow,
          glowBase,
          glowPhase,
        }) => {
          // Core flickers fastest and most intensely (hot, unstable)
          core.intensity =
            coreBase +
            Math.sin(t * 7.3 + corePhase) * 1.8 +
            Math.sin(t * 13.1 + corePhase * 1.5) * 0.9 +
            Math.sin(t * 3.2 + corePhase * 0.6) * 0.5;

          // Mid flickers moderately
          mid.intensity =
            midBase +
            Math.sin(t * 4.1 + midPhase) * 0.8 +
            Math.sin(t * 8.7 + midPhase * 1.3) * 0.4 +
            Math.sin(t * 1.9 + midPhase * 0.8) * 0.3;

          // Glow barely flickers — slow, stable atmospheric fill
          glow.intensity =
            glowBase +
            Math.sin(t * 1.4 + glowPhase) * 0.25 +
            Math.sin(t * 3.3 + glowPhase * 0.9) * 0.12;
        },
      );

      // Flame scale pulse — subtle breathing
      flameRefs.forEach(({ mesh, phase }) => {
        const s =
          0.92 +
          Math.sin(t * 6.2 + phase) * 0.08 +
          Math.sin(t * 11.7 + phase * 1.4) * 0.04;
        mesh.scale.set(s, 0.95 + Math.sin(t * 4.1 + phase) * 0.06, s);
      });

      // Very slow, smooth camera breathe
      camera.position.x = Math.sin(t * 0.05) * 0.08;
      camera.position.y = 1.8 + Math.sin(t * 0.08) * 0.03;
      camera.lookAt(Math.sin(t * 0.04) * 0.05, 1.6, -10);

      renderer.render(scene, camera);
    };
    animate();

    /* ── Resize ── */
    const onResize = (): void => {
      const nw = window.innerWidth,
        nh = window.innerHeight;
      renderer.setSize(nw, nh, true); // true = update canvas style too
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  /* Canvas has NO inline width/height — let Three.js control sizing via setSize(w,h,true) */
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, display: "block", zIndex: 0 }}
    />
  );
}

/* ─── Player Card ───────────────────────────────────────── */
function PlayerCard({ player }: { player: Player }): JSX.Element {
  const [suspicious, setSuspicious] = useState<boolean>(false);
  const border = player.isYou
    ? "border-amber-400"
    : suspicious
      ? "border-red-500"
      : "border-stone-600";
  const label = player.isYou
    ? "bg-amber-500 text-black"
    : "bg-stone-900/90 text-stone-300";

  return (
    <div
      className={`relative cursor-pointer select-none transition-all duration-300 ${player.isYou ? "ring-1 ring-amber-500/40" : ""}`}
      onClick={() => !player.isYou && setSuspicious((s) => !s)}
    >
      <div
        className={`relative w-full aspect-video border ${border} overflow-hidden`}
        style={{
          background:
            "linear-gradient(135deg,#100d0a 0%,#1e1510 50%,#100d0a 100%)",
          boxShadow: player.isYou
            ? "0 0 16px rgba(245,158,11,0.35),inset 0 0 18px rgba(0,0,0,0.55)"
            : suspicious
              ? "0 0 12px rgba(239,68,68,0.45)"
              : "inset 0 0 18px rgba(0,0,0,0.55)",
        }}
      >
        {/* scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.25) 2px,rgba(0,0,0,0.25) 4px)",
          }}
        />
        {/* silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 60 80" className="w-10 h-14 opacity-50">
            <ellipse cx="30" cy="15" rx="10" ry="12" fill="#2a1a0e" />
            <path d="M10 80 Q15 45 30 40 Q45 45 50 80Z" fill="#2a1a0e" />
            <path d="M10 50 Q5 40 8 30 Q12 25 15 35" fill="#2a1a0e" />
            <path d="M50 50 Q55 40 52 30 Q48 25 45 35" fill="#2a1a0e" />
          </svg>
        </div>
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,0.65) 100%)",
          }}
        />
        <div className="absolute top-1 right-1 text-[9px] font-mono text-stone-500 opacity-70">
          #{String(player.id).padStart(2, "0")}
        </div>
        <div
          className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full"
          style={{
            background: player.status === "active" ? "#22c55e" : "#ef4444",
            boxShadow:
              player.status === "active"
                ? "0 0 4px #22c55e"
                : "0 0 4px #ef4444",
          }}
        />
        {suspicious && !player.isYou && (
          <div className="absolute inset-0 bg-red-900/20 border border-red-500/30 flex items-center justify-center">
            <span className="font-mono text-red-400 text-xs tracking-widest font-bold">
              MARKED
            </span>
          </div>
        )}
      </div>
      <div
        className={`px-1.5 py-0.5 text-xs font-mono tracking-wider flex items-center justify-between ${label} border-t ${border}`}
      >
        <span className="truncate">{player.name}</span>
        {player.isYou && (
          <span className="text-amber-400 text-[10px] ml-1">YOU</span>
        )}
      </div>
    </div>
  );
}

/* ─── Clue Row ──────────────────────────────────────────── */
function ClueRow({ clue }: { clue: Clue }): JSX.Element {
  const C: Record<
    Clue["severity"],
    { dot: string; glow: string; text: string }
  > = {
    high: { dot: "#ef4444", glow: "rgba(239,68,68,0.5)", text: "text-red-400" },
    medium: {
      dot: "#f59e0b",
      glow: "rgba(245,158,11,0.5)",
      text: "text-amber-400",
    },
    low: {
      dot: "#6b7280",
      glow: "rgba(107,114,128,0.4)",
      text: "text-stone-400",
    },
  };
  const c = C[clue.severity];
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-stone-800/50 last:border-0">
      <div
        className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: c.dot, boxShadow: `0 0 5px ${c.glow}` }}
      />
      <span
        className={`text-[10px] font-mono ${c.text} shrink-0 tracking-wider`}
      >
        {clue.type}
      </span>
      <span className="text-xs text-stone-400 font-mono leading-snug">
        {clue.text}
      </span>
    </div>
  );
}

/* ─── App ───────────────────────────────────────────────── */
export default function App(): JSX.Element {
  const [timeLeft, setTimeLeft] = useState<number>(522);
  const [round] = useState<number>(2);
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [systemMsg, setSystemMsg] = useState<string>(
    "Koneksi stabil. Menunggu tindakan pemain...",
  );
  const [glitch, setGlitch] = useState<boolean>(false);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const msgs = [
      "Sensor grid tidak stabil di koridor timur...",
      "Anomali terdeteksi. Memeriksa log sistem...",
      "Peringatan: Koneksi terputus sesaat.",
      "Aktivitas mencurigakan di dekat Chapel.",
      "Pembaruan: Petunjuk baru tersedia.",
    ];
    const id = setInterval(() => {
      setGlitch(true);
      setSystemMsg(msgs[Math.floor(Math.random() * msgs.length)]);
      setTimeout(() => setGlitch(false), 300);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const urgency =
    timeLeft < 120
      ? "text-red-400"
      : timeLeft < 240
        ? "text-amber-400"
        : "text-stone-300";
  const left = PLAYERS.filter((p) => p.position.endsWith("left"));
  const right = PLAYERS.filter((p) => p.position.endsWith("right"));

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-mono"
      style={{ background: "#080503" }}
    >
      {/* ① Three.js canvas — z:0 */}
      <DungeonBackground />

      {/* ② Deep vignette — heavy corners, transparent center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse 70% 65% at 50% 45%, transparent 0%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.80) 100%)",
        }}
      />

      {/* ③ Top & bottom gradient bars for cinematic feel */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />

      {/* ④ Very faint scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          opacity: 0.03,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,1) 3px,rgba(0,0,0,1) 6px)",
        }}
      />

      {/* ⑤ UI — explicit z:2 */}
      <div className="absolute inset-0 flex flex-col" style={{ zIndex: 2 }}>
        {/* TOP HUD */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-stone-800/60"
          style={{
            background: "rgba(4,3,2,0.88)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full bg-amber-500"
              style={{ boxShadow: "0 0 6px rgba(245,158,11,0.8)" }}
            />
            <span className="text-amber-500 text-xs tracking-widest uppercase">
              Session Active
            </span>
          </div>
          <div
            className={`text-2xl font-bold tracking-widest ${urgency} ${glitch ? "opacity-40" : ""} transition-opacity`}
            style={{
              textShadow:
                timeLeft < 120
                  ? "0 0 10px rgba(239,68,68,0.8)"
                  : "0 0 8px rgba(245,158,11,0.6)",
            }}
          >
            {fmt(timeLeft)}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 tracking-wider">
            <span>ROUND {round} OF 5</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <div
                  key={r}
                  className="w-4 h-1"
                  style={{
                    background: r <= round ? "#d97706" : "#292524",
                    boxShadow:
                      r <= round ? "0 0 4px rgba(217,119,6,0.6)" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex flex-1 gap-3 px-3 py-3 min-h-0">
          <div className="flex flex-col gap-2 w-44 shrink-0">
            {left.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>

          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {/* Narrative */}
            <div
              className="flex-1 flex flex-col items-center justify-center px-6 py-4 border border-stone-800/50 relative overflow-hidden"
              style={{
                background: "rgba(4,3,2,0.60)",
                backdropFilter: "blur(2px)",
              }}
            >
              {[
                "top-0 left-0",
                "top-0 right-0",
                "bottom-0 left-0",
                "bottom-0 right-0",
              ].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-4 h-4 border-amber-600/60`}
                  style={{
                    borderTopWidth: i < 2 ? "1px" : "0",
                    borderBottomWidth: i >= 2 ? "1px" : "0",
                    borderLeftWidth: i % 2 === 0 ? "1px" : "0",
                    borderRightWidth: i % 2 === 1 ? "1px" : "0",
                  }}
                />
              ))}
              <div className="flex gap-2 mb-4">
                {[1, 2, 3].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: d <= round % 3 ? "#d97706" : "#292524",
                      boxShadow:
                        d <= round % 3 ? "0 0 5px rgba(217,119,6,0.7)" : "none",
                    }}
                  />
                ))}
              </div>
              <p
                className="text-center text-stone-200 text-sm leading-relaxed italic max-w-xs"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,1)" }}
              >
                {NARRATIVE}
              </p>
              {glitch && (
                <div className="absolute bottom-6 left-0 right-0 h-px bg-amber-500/50" />
              )}
            </div>

            {/* Clue log */}
            <div
              className="border border-stone-800/50 px-3 py-2"
              style={{
                background: "rgba(4,3,2,0.82)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div className="text-[10px] text-stone-500 tracking-widest mb-1 uppercase">
                System Log
              </div>
              {CLUES.map((c) => (
                <ClueRow key={c.id} clue={c} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-44 shrink-0">
            {right.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          className="border-t border-stone-800/60 px-4 py-2 flex items-center gap-3"
          style={{
            background: "rgba(4,3,2,0.92)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex gap-2">
            {["M", "C"].map((ic, i) => (
              <button
                key={i}
                className="w-8 h-8 border border-stone-600 flex items-center justify-center text-stone-400 hover:border-amber-600 hover:text-amber-400 transition-colors text-xs"
              >
                {ic}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-1 justify-center">
            {ACTIONS.map((action) => {
              const isAcc = action === "ACCUSE",
                isAct = activeAction === action;
              return (
                <button
                  key={action}
                  onClick={() => setActiveAction(isAct ? null : action)}
                  className={`px-5 py-1.5 text-xs tracking-widest font-bold border transition-all duration-200 ${
                    isAct
                      ? isAcc
                        ? "bg-red-900/60 border-red-500 text-red-300"
                        : "bg-amber-900/50 border-amber-500 text-amber-300"
                      : isAcc
                        ? "border-red-800/60 text-red-600 hover:border-red-500 hover:text-red-400"
                        : "border-stone-600/60 text-stone-400 hover:border-amber-600 hover:text-amber-400"
                  }`}
                  style={
                    isAct
                      ? {
                          boxShadow: isAcc
                            ? "0 0 10px rgba(239,68,68,0.3)"
                            : "0 0 10px rgba(245,158,11,0.3)",
                        }
                      : {}
                  }
                >
                  {action}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            {["»", "«"].map((s, i) => (
              <button
                key={i}
                className="w-8 h-8 border border-stone-700 flex items-center justify-center text-stone-600 hover:border-stone-500 hover:text-stone-400 transition-colors text-xs"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* TICKER */}
        <div
          className={`px-4 py-1 text-xs text-stone-600 tracking-wide border-t border-stone-900/60 transition-opacity duration-200 ${glitch ? "opacity-20" : ""}`}
          style={{ background: "rgba(0,0,0,0.92)" }}
        >
          <span className="text-stone-600 mr-2">SYS ›</span>
          {systemMsg}
        </div>
      </div>
    </div>
  );
}
