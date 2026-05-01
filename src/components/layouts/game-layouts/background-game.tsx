"use client";
import { useEffect, useRef, JSX } from "react";
import * as THREE from "three";

export function DungeonBackground(): JSX.Element {
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
