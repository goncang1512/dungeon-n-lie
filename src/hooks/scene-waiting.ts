"use client";

import { useEffect } from "react";
import * as THREE from "three";

export function useScene(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const getSize = () => ({
      w: canvas.parentElement?.offsetWidth ?? window.innerWidth,
      h: canvas.parentElement?.offsetHeight ?? window.innerHeight,
    });

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0804);
    // Fog thicker so portal glow stands out at the end
    scene.fog = new THREE.FogExp2(0x0c0804, 0.024);

    const { w, h } = getSize();
    const camera = new THREE.PerspectiveCamera(62, w / h, 0.1, 80);
    // Camera positioned to look down the corridor toward portal
    camera.position.set(0, 2.2, 10);
    camera.lookAt(0, 1.8, -20);
    renderer.setSize(w, h);

    // ── Procedural stone texture ────────────────────────────────────────────
    function makeStone(
      base: [number, number, number],
      grout: [number, number, number],
      cols: number,
      rows: number,
      res = 512,
    ) {
      const cv = document.createElement("canvas");
      cv.width = cv.height = res;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = `rgb(${grout.join(",")})`;
      ctx.fillRect(0, 0, res, res);
      const bw = res / cols,
        bh = res / rows,
        gw = 5;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const off = r % 2 ? bw / 2 : 0;
          const x = (c * bw + off) % res,
            y = r * bh;
          const n = () => (Math.random() - 0.5) * 24;
          const cr = Math.max(0, Math.min(255, base[0] + n()));
          const cg = Math.max(0, Math.min(255, base[1] + n()));
          const cb = Math.max(0, Math.min(255, base[2] + n()));
          ctx.fillStyle = `rgb(${[cr, cg, cb].map(Math.round).join(",")})`;
          ctx.fillRect(x + gw, y + gw, bw - gw * 2, bh - gw * 2);
          ctx.fillStyle = "rgba(0,0,0,0.13)";
          ctx.fillRect(x + gw, y + gw, bw - gw * 2, 3);
          ctx.fillRect(x + gw, y + gw, 3, bh - gw * 2);
          for (let k = 0; k < 2; k++) {
            ctx.strokeStyle = `rgba(${Math.round(cr * 0.45)},${Math.round(cg * 0.45)},${Math.round(cb * 0.45)},0.3)`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            const cx = x + gw + Math.random() * (bw - gw * 2);
            const cy = y + gw + Math.random() * (bh - gw * 2);
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + (Math.random() - 0.5) * 18,
              cy + (Math.random() - 0.5) * 18,
            );
            ctx.stroke();
          }
        }
      }
      for (let i = 0; i < 3500; i++) {
        const v = Math.random() > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${v},${v},${v},0.02)`;
        ctx.fillRect(Math.random() * res, Math.random() * res, 1, 1);
      }
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }

    function makeWood(res = 256) {
      const cv = document.createElement("canvas");
      cv.width = cv.height = res;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = "#2e1608";
      ctx.fillRect(0, 0, res, res);
      for (let x = 0; x < res; x++) {
        const wv = Math.sin(x * 0.55 + Math.sin(x * 0.12) * 4) * 6;
        const b = 18 + Math.abs(Math.sin(x * 0.25 + wv * 0.3)) * 28;
        ctx.strokeStyle = `rgba(${Math.round(70 + b)},${Math.round(35 + b * 0.45)},${Math.round(8 + b * 0.18)},0.55)`;
        ctx.lineWidth = 0.7 + Math.random() * 0.9;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + wv * 0.4, res);
        ctx.stroke();
      }
      const vg = ctx.createLinearGradient(0, 0, res, 0);
      vg.addColorStop(0, "rgba(0,0,0,0.45)");
      vg.addColorStop(0.15, "rgba(0,0,0,0)");
      vg.addColorStop(0.85, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, res, res);
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1, 3);
      return t;
    }

    function makeFlame(res = 128) {
      const cv = document.createElement("canvas");
      cv.width = res;
      cv.height = res * 2;
      const ctx = cv.getContext("2d")!;
      const g = ctx.createRadialGradient(
        res / 2,
        res * 1.5,
        4,
        res / 2,
        res * 0.85,
        res * 0.72,
      );
      g.addColorStop(0, "rgba(255,240,160,1)");
      g.addColorStop(0.12, "rgba(255,200,50,.95)");
      g.addColorStop(0.32, "rgba(255,90,8,.85)");
      g.addColorStop(0.6, "rgba(180,25,0,.5)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, res, res * 2);
      return new THREE.CanvasTexture(cv);
    }

    // ── Portal swirl texture ────────────────────────────────────────────────
    function makePortalTex(res = 256) {
      const cv = document.createElement("canvas");
      cv.width = cv.height = res;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, res, res);
      // Radial amber-gold gradient core
      const g = ctx.createRadialGradient(
        res / 2,
        res / 2,
        2,
        res / 2,
        res / 2,
        res / 2,
      );
      g.addColorStop(0, "rgba(255,240,180,1)");
      g.addColorStop(0.15, "rgba(255,180,40,0.95)");
      g.addColorStop(0.38, "rgba(200,100,10,0.85)");
      g.addColorStop(0.62, "rgba(100,40,5,0.6)");
      g.addColorStop(0.85, "rgba(40,15,2,0.3)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, res, res);
      // Spiral tendrils
      for (let s = 0; s < 8; s++) {
        ctx.strokeStyle = `rgba(255,${160 + s * 10},${20 + s * 5},${0.25 + s * 0.04})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 5; a += 0.04) {
          const rr = (a / (Math.PI * 5)) * (res * 0.44);
          const ang = a + s * (Math.PI / 4);
          const px = res / 2 + Math.cos(ang) * rr;
          const py = res / 2 + Math.sin(ang) * rr;
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          a < 0.04 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      // Secondary bright core
      const g2 = ctx.createRadialGradient(
        res / 2,
        res / 2,
        0,
        res / 2,
        res / 2,
        res * 0.22,
      );
      g2.addColorStop(0, "rgba(255,255,220,0.9)");
      g2.addColorStop(0.5, "rgba(255,200,80,0.5)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, res, res);
      return new THREE.CanvasTexture(cv);
    }

    // ── Materials ───────────────────────────────────────────────────────────
    const wallT = makeStone([88, 68, 42], [40, 30, 16], 5, 8);
    wallT.repeat.set(2.5, 3);
    const floorT = makeStone([70, 54, 32], [32, 24, 12], 8, 8);
    floorT.repeat.set(4, 4);
    const ceilT = makeStone([60, 46, 28], [28, 20, 10], 5, 8);
    ceilT.repeat.set(2.5, 3);
    const pilT = makeStone([78, 60, 36], [35, 26, 14], 2, 7);
    pilT.repeat.set(1, 2);
    const woodT = makeWood();
    const flameT = makeFlame();

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallT,
      roughness: 0.93,
      metalness: 0.02,
      color: 0xd4a060,
    });
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorT,
      roughness: 0.97,
      color: 0xb88840,
    });
    const ceilMat = new THREE.MeshStandardMaterial({
      map: ceilT,
      roughness: 1.0,
      color: 0x7a5830,
    });
    const pilMat = new THREE.MeshStandardMaterial({
      map: pilT,
      roughness: 0.9,
      color: 0xc09050,
    });
    const stoneDk = new THREE.MeshStandardMaterial({
      map: pilT,
      roughness: 0.95,
      color: 0x8a6838,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodT,
      roughness: 0.88,
      color: 0xc07838,
    });
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x2e1c08,
      roughness: 0.6,
      metalness: 0.85,
    });

    const addBox = (
      x: number,
      y: number,
      z: number,
      sx: number,
      sy: number,
      sz: number,
      mat: THREE.Material,
    ) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    };

    // ── LONG CORRIDOR extending far into the scene ─────────────────────────
    const CORRIDOR_LENGTH = 60; // deep corridor toward portal

    // Floor — long plane
    const flGeo = new THREE.PlaneGeometry(12, CORRIDOR_LENGTH, 24, 48);
    const fp = flGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < fp.count; i++) fp.setZ(i, (Math.random() - 0.5) * 0.07);
    flGeo.computeVertexNormals();
    const floor = new THREE.Mesh(flGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.5, -CORRIDOR_LENGTH / 2 + 10);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const clGeo = new THREE.PlaneGeometry(12, CORRIDOR_LENGTH, 12, 24);
    const cp = clGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, (Math.random() - 0.5) * 0.14);
    clGeo.computeVertexNormals();
    const ceil = new THREE.Mesh(clGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, 6.8, -CORRIDOR_LENGTH / 2 + 10);
    scene.add(ceil);

    // Left wall
    const lwGeo = new THREE.PlaneGeometry(CORRIDOR_LENGTH, 8, 40, 6);
    const lwMesh = new THREE.Mesh(lwGeo, wallMat);
    lwMesh.rotation.y = Math.PI / 2;
    lwMesh.position.set(-6, 3, -CORRIDOR_LENGTH / 2 + 10);
    lwMesh.receiveShadow = true;
    scene.add(lwMesh);

    // Right wall
    const rwMesh = new THREE.Mesh(lwGeo.clone(), wallMat);
    rwMesh.rotation.y = -Math.PI / 2;
    rwMesh.position.set(6, 3, -CORRIDOR_LENGTH / 2 + 10);
    rwMesh.receiveShadow = true;
    scene.add(rwMesh);

    // Back wall (behind camera)
    addBox(0, 3, 12, 14, 8, 0.6, wallMat);

    // End wall arch around portal
    // const endWallL = addBox(-4, 3, -CORRIDOR_LENGTH + 10, 4, 8, 0.6, wallMat);
    // const endWallR = addBox(4, 3, -CORRIDOR_LENGTH + 10, 4, 8, 0.6, wallMat);
    // const endWallTop = addBox(
    //   0,
    //   6,
    //   -CORRIDOR_LENGTH + 10,
    //   12,
    //   0.8,
    //   0.6,
    //   wallMat,
    // );
    // Arch stones
    for (let i = 0; i < 8; i++) {
      const a = (i / 7) * Math.PI;
      const ax = Math.cos(a) * 3.2,
        ay = Math.sin(a) * 3.2 + 3;
      addBox(ax, ay, -CORRIDOR_LENGTH + 10, 0.55, 0.55, 0.7, stoneDk);
    }

    // Ceiling crossbeams
    for (let z = 8; z > -CORRIDOR_LENGTH + 12; z -= 5.5) {
      addBox(0, 6.65, z, 12.5, 0.32, 0.55, stoneDk);
    }

    // ── PILLARS along both sides of corridor ─────────────────────────────
    const pillarZs = [6, 0, -6, -12, -18, -24, -30, -36, -42];
    pillarZs.forEach((z) => {
      [-5.5, 5.5].forEach((x) => {
        addBox(x, -0.3, z, 1.0, 0.38, 1.0, stoneDk);
        addBox(x, 3.1, z, 0.68, 6.8, 0.68, pilMat);
        addBox(x, 6.55, z, 1.05, 0.32, 1.05, stoneDk);
        addBox(x, 6.72, z, 1.35, 0.18, 1.35, stoneDk);
        addBox(x, 6.38, z, 1.6, 0.2, 0.2, stoneDk);
        addBox(x, 6.38, z, 0.2, 0.2, 1.6, stoneDk);
      });
    });

    // ── TORCHES along corridor walls ───────────────────────────────────────
    type TP = [number, number, number];
    const tPos: TP[] = [
      [-5.3, 3.2, 4],
      [-5.3, 3.2, -2],
      [-5.3, 3.2, -8],
      [-5.3, 3.2, -14],
      [-5.3, 3.2, -20],
      [-5.3, 3.2, -26],
      [-5.3, 3.2, -32],
      [5.3, 3.2, 4],
      [5.3, 3.2, -2],
      [5.3, 3.2, -8],
      [5.3, 3.2, -14],
      [5.3, 3.2, -20],
      [5.3, 3.2, -26],
      [5.3, 3.2, -32],
    ];

    const ptLights: THREE.PointLight[] = [];
    const ptPhase: number[] = [];
    const fbs: THREE.Mesh[] = [],
      fbs2: THREE.Mesh[] = [];

    const flameMat = new THREE.MeshBasicMaterial({
      map: flameT,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    tPos.forEach((pos, i) => {
      const [px, py, pz] = pos;
      const side = px < 0 ? 1 : -1;
      addBox(px + side * 0.04, py - 0.08, pz, 0.08, 0.22, 0.07, ironMat);
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.022, 0.36, 10),
        ironMat,
      );
      arm.rotation.z = Math.PI / 2;
      arm.position.set(px + side * 0.2, py + 0.02, pz);
      scene.add(arm);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.014, 8, 18),
        ironMat,
      );
      ring.rotation.z = Math.PI / 2;
      ring.position.set(px + side * 0.38, py + 0.02, pz);
      scene.add(ring);
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.027, 0.042, 0.56, 14, 6),
        woodMat,
      );
      handle.position.set(px, py, pz);
      handle.castShadow = true;
      scene.add(handle);
      [-0.21, -0.04, 0.16].forEach((by) => {
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(0.046, 0.046, 0.024, 14),
          ironMat,
        );
        band.position.set(px, py + by, pz);
        scene.add(band);
      });
      const charMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.034, 0.14, 12),
        new THREE.MeshStandardMaterial({ color: 0x1a0d04, roughness: 1 }),
      );
      charMesh.position.set(px, py + 0.3, pz);
      scene.add(charMesh);
      const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.03, 0.065, 12, 1, true),
        ironMat,
      );
      bowl.position.set(px, py + 0.345, pz);
      scene.add(bowl);

      const fb1 = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.58),
        flameMat.clone(),
      );
      fb1.position.set(px, py + 0.62, pz);
      fb1.renderOrder = 2;
      scene.add(fb1);
      fbs.push(fb1);
      const fb2 = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.58),
        flameMat.clone(),
      );
      fb2.position.set(px, py + 0.62, pz);
      fb2.rotation.y = Math.PI / 2;
      fb2.renderOrder = 2;
      scene.add(fb2);
      fbs2.push(fb2);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.048, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xfffde8 }),
      );
      core.position.set(px, py + 0.38, pz);
      scene.add(core);

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 10),
        new THREE.MeshBasicMaterial({
          color: 0xff8800,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      halo.position.set(px, py + 0.44, pz);
      scene.add(halo);

      const pt = new THREE.PointLight(0xff8822, 3.5, 12);
      pt.position.set(px, py + 0.44, pz);
      pt.castShadow = false;
      scene.add(pt);
      ptLights.push(pt);
      ptPhase.push(i * 1.3 + Math.random() * Math.PI * 2);
    });

    // ── PORTAL at end of corridor ──────────────────────────────────────────
    const PORTAL_Z = -CORRIDOR_LENGTH + 10.5;

    // Portal archway pillar stones  (already done above via endWall)

    // Outer gold ring
    const portalOuterGeo = new THREE.TorusGeometry(3.0, 0.22, 16, 80);
    const portalOuterMat = new THREE.MeshStandardMaterial({
      color: 0xc8882a,
      emissive: 0xc8882a,
      emissiveIntensity: 1.2,
      roughness: 0.3,
      metalness: 0.8,
    });
    const portalOuter = new THREE.Mesh(portalOuterGeo, portalOuterMat);
    portalOuter.position.set(0, 3, PORTAL_Z);
    portalOuter.rotation.y = Math.PI / 2;
    scene.add(portalOuter);

    // Inner ring
    const portalInnerGeo = new THREE.TorusGeometry(2.2, 0.1, 12, 60);
    const portalInnerMat = new THREE.MeshBasicMaterial({ color: 0xffe880 });
    const portalInner = new THREE.Mesh(portalInnerGeo, portalInnerMat);
    portalInner.position.set(0, 3, PORTAL_Z + 0.05);
    portalInner.rotation.y = Math.PI / 2;
    scene.add(portalInner);

    // Portal face — swirling gold vortex
    const portalFaceMat = new THREE.MeshBasicMaterial({
      map: makePortalTex(),
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const portalFace = new THREE.Mesh(
      new THREE.CircleGeometry(2.9, 80),
      portalFaceMat,
    );
    portalFace.position.set(0, 3, PORTAL_Z + 0.1);
    portalFace.rotation.y = Math.PI / 2;
    scene.add(portalFace);

    // Soft halo behind portal
    const portalHaloMat = new THREE.MeshBasicMaterial({
      color: 0xc87020,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const portalHalo = new THREE.Mesh(
      new THREE.CircleGeometry(6.5, 48),
      portalHaloMat,
    );
    portalHalo.position.set(0, 3, PORTAL_Z - 0.05);
    portalHalo.rotation.y = Math.PI / 2;
    scene.add(portalHalo);

    // Second wider halo
    const halo2Mat = new THREE.MeshBasicMaterial({
      color: 0xff9933,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const halo2 = new THREE.Mesh(new THREE.CircleGeometry(9.0, 48), halo2Mat);
    halo2.position.set(0, 3, PORTAL_Z - 0.12);
    halo2.rotation.y = Math.PI / 2;
    scene.add(halo2);

    // Orbiting energy rings around portal
    type OrbitRing = { mesh: THREE.Mesh; speed: number; axis: THREE.Vector3 };
    const orbitRings: OrbitRing[] = [
      { speed: 0.5, axis: new THREE.Vector3(0, 1, 0) },
      { speed: -0.35, axis: new THREE.Vector3(0, 0.7, 0.7).normalize() },
      { speed: 0.45, axis: new THREE.Vector3(1, 0, 0.3).normalize() },
    ].map(({ speed, axis }, i) => {
      const r = 3.3 + i * 0.35;
      const geo = new THREE.TorusGeometry(r, 0.045, 8, 60);
      const mat = new THREE.MeshBasicMaterial({
        color: [0xff9933, 0xffcc44, 0xff6611][i],
        transparent: true,
        opacity: 0.65,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 3, PORTAL_Z);
      mesh.rotation.y = Math.PI / 2;
      scene.add(mesh);
      return { mesh, speed, axis };
    });

    // Portal ground glow
    const gGlowMat = new THREE.MeshBasicMaterial({
      color: 0xc87020,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const groundGlow = new THREE.Mesh(
      new THREE.CircleGeometry(5, 40),
      gGlowMat,
    );
    groundGlow.rotation.x = -Math.PI / 2;
    groundGlow.position.set(0, -0.48, PORTAL_Z);
    scene.add(groundGlow);

    // Gold rune tablets floating around portal
    const runeChars = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ"];
    const runeMeshes: THREE.Mesh[] = [];

    const makeRuneTex = (glyph: string, res = 128) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = res;
      const ctx = cv.getContext("2d")!;
      ctx.clearRect(0, 0, res, res);
      ctx.font = `bold ${res * 0.65}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,190,60,0.9)";
      ctx.fillText(glyph, res / 2, res / 2);
      return new THREE.CanvasTexture(cv);
    };

    runeChars.forEach((r, i) => {
      const a = (i / runeChars.length) * Math.PI * 2;
      const radius = 4.8;
      const mat = new THREE.MeshBasicMaterial({
        map: makeRuneTex(r),
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), mat);
      mesh.position.set(
        Math.cos(a) * radius,
        3 + Math.sin(a) * radius * 0.45,
        PORTAL_Z - 0.3,
      );
      mesh.rotation.y = Math.PI / 2;
      scene.add(mesh);
      runeMeshes.push(mesh);
    });

    // Ground rune ring near portal
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const mat = new THREE.MeshBasicMaterial({
        map: makeRuneTex(runeChars[i % runeChars.length]),
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), mat);
      m.position.set(Math.cos(a) * 4.2, -0.3, PORTAL_Z + Math.sin(a) * 1.5);
      m.rotation.x = -Math.PI / 2;
      scene.add(m);
    }

    // ── PORTAL LIGHT — main amber glow lighting the corridor ───────────────
    const portalLight = new THREE.PointLight(0xff8822, 8.0, 30);
    portalLight.position.set(0, 3, PORTAL_Z + 1);
    portalLight.castShadow = true;
    portalLight.shadow.mapSize.set(1024, 1024);
    scene.add(portalLight);

    // Secondary fill light from portal (so corridor far end is lit)
    const portalFill = new THREE.PointLight(0xff6600, 3.0, 50);
    portalFill.position.set(0, 3, PORTAL_Z + 2);
    scene.add(portalFill);

    // Ambient
    scene.add(new THREE.AmbientLight(0x5a3c18, 0.55));
    scene.add(new THREE.HemisphereLight(0x7a5020, 0x1c0e04, 0.38));

    // ── PARTICLES ─────────────────────────────────────────────────────────
    // Torch fire particles
    const mkP = (
      count: number,
      positions: TP[],
      color: number,
      size: number,
    ) => {
      const pos = new Float32Array(count * 3),
        vel = new Float32Array(count * 3);
      const life = new Float32Array(count),
        maxL = new Float32Array(count),
        ti = new Int32Array(count);
      for (let i = 0; i < count; i++) {
        const t = Math.floor(Math.random() * positions.length);
        ti[i] = t;
        const p = positions[t];
        pos[i * 3] = p[0] + (Math.random() - 0.5) * 0.1;
        pos[i * 3 + 1] = p[1] + 0.2;
        pos[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.1;
        vel[i * 3] = (Math.random() - 0.5) * 0.007;
        vel[i * 3 + 1] = 0.011 + Math.random() * 0.017;
        vel[i * 3 + 2] = (Math.random() - 0.5) * 0.007;
        maxL[i] = 50 + Math.random() * 80;
        life[i] = Math.random() * maxL[i];
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      scene.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            color,
            size,
            transparent: true,
            opacity: 0.88,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }),
        ),
      );
      return { pos, vel, life, maxL, ti, geo };
    };
    const fire = mkP(320, tPos, 0xff9933, 0.062);
    const spark = mkP(90, tPos, 0xffeebb, 0.026);

    // Portal vortex particles — spiral into portal
    const VORTEX = 500;
    const vPos = new Float32Array(VORTEX * 3);
    const vAngle = new Float32Array(VORTEX);
    const vRad = new Float32Array(VORTEX);
    const vH = new Float32Array(VORTEX);
    const vLife = new Float32Array(VORTEX),
      vMax = new Float32Array(VORTEX);

    const initVortexParticle = (i: number) => {
      vAngle[i] = Math.random() * Math.PI * 2;
      vRad[i] = 0.3 + Math.random() * 3.0;
      vH[i] = 1.5 + Math.random() * 3.0;
      vLife[i] = 0;
      vMax[i] = 40 + Math.random() * 80;
    };
    for (let i = 0; i < VORTEX; i++) {
      initVortexParticle(i);
      vLife[i] = Math.random() * vMax[i];
    }

    const vGeo = new THREE.BufferGeometry();
    vGeo.setAttribute("position", new THREE.BufferAttribute(vPos, 3));
    scene.add(
      new THREE.Points(
        vGeo,
        new THREE.PointsMaterial({
          color: 0xffaa33,
          size: 0.055,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );

    // Ambient floating dust throughout corridor
    const DUST = 280;
    const dPos = new Float32Array(DUST * 3),
      dVel = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      dPos[i * 3] = (Math.random() - 0.5) * 10;
      dPos[i * 3 + 1] = Math.random() * 6;
      dPos[i * 3 + 2] = Math.random() * (-CORRIDOR_LENGTH + 12) + 10;
      dVel[i * 3] = (Math.random() - 0.5) * 0.002;
      dVel[i * 3 + 1] = (Math.random() - 0.5) * 0.001;
      dVel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    scene.add(
      new THREE.Points(
        dGeo,
        new THREE.PointsMaterial({
          color: 0xddaa55,
          size: 0.022,
          transparent: true,
          opacity: 0.25,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );

    // ── Mouse parallax ─────────────────────────────────────────────────────
    let mx = 0,
      my = 0;
    const onMM = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = -((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    canvas.addEventListener("mousemove", onMM);
    const onResize = () => {
      const s = getSize();
      camera.aspect = s.w / s.h;
      camera.updateProjectionMatrix();
      renderer.setSize(s.w, s.h);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ──────────────────────────────────────────────────────
    let t = 0,
      raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += 0.016;

      // Camera parallax — view down corridor with subtle sway
      const sway = Math.sin(t * 0.18) * 0.3;
      camera.position.x += (mx * 0.25 + sway - camera.position.x) * 0.02;
      camera.position.y += (2.2 + my * 0.2 - camera.position.y) * 0.02;
      camera.lookAt(0, 1.8, -20);

      // Torch flicker
      ptLights.forEach((l, i) => {
        ptPhase[i] += 0.068 + Math.random() * 0.04;
        l.intensity =
          3.5 + Math.sin(ptPhase[i]) * 1.2 + Math.sin(ptPhase[i] * 2.4) * 0.5;
        l.color.setHSL(0.075 + Math.sin(ptPhase[i] * 0.35) * 0.008, 0.93, 0.52);
        if (fbs[i]) {
          const fw = 1 + Math.sin(ptPhase[i] * 2.1) * 0.11,
            fh = 1 + Math.sin(ptPhase[i] * 1.7) * 0.09;
          fbs[i].scale.set(fw, fh, 1);
          fbs[i].position.y =
            tPos[i][1] + 0.62 + Math.sin(ptPhase[i] * 2.2) * 0.016;
          fbs[i].rotation.y = Math.atan2(
            camera.position.x - fbs[i].position.x,
            camera.position.z - fbs[i].position.z,
          );
          fbs2[i].scale.set(fw * 0.88, fh * 0.9, 1);
          fbs2[i].position.y = fbs[i].position.y - 0.02;
          fbs2[i].rotation.y = fbs[i].rotation.y + Math.PI / 2;
        }
      });

      // Portal spin and pulse
      portalFace.rotation.z += 0.007;
      portalOuter.rotation.z += 0.002;
      portalInner.rotation.z -= 0.004;

      const portalPulse = Math.sin(t * 2.2) * 0.6 + Math.sin(t * 3.8) * 0.3;
      portalLight.intensity = 8.0 + portalPulse * 2;
      portalLight.color.setHSL(
        0.075 + Math.sin(t * 0.5) * 0.015,
        0.92,
        0.52 + portalPulse * 0.05,
      );

      // Orbiting rings
      orbitRings.forEach(({ mesh, speed, axis }) => {
        mesh.rotateOnAxis(axis, speed * 0.016);
      });

      // Rune tablets float + opacity pulse
      runeMeshes.forEach((m, i) => {
        m.position.y = 3 + Math.sin(t * 0.7 + i * 0.78) * 0.35;
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.45 + Math.abs(Math.sin(t * 0.8 + i * 0.65)) * 0.4;
      });

      // Vortex particles spiral into portal
      for (let i = 0; i < VORTEX; i++) {
        vLife[i]++;
        if (vLife[i] > vMax[i]) {
          initVortexParticle(i);
        } else {
          const spiralSpeed = 0.025 + (1 - vRad[i] / 3.3) * 0.05;
          vAngle[i] += spiralSpeed;
          vRad[i] *= 0.994;
          vPos[i * 3] = Math.cos(vAngle[i]) * vRad[i];
          vPos[i * 3 + 1] = vH[i] + Math.sin(t * 0.8 + i) * 0.08;
          vPos[i * 3 + 2] =
            PORTAL_Z + 0.5 + Math.sin(vAngle[i]) * vRad[i] * 0.08;
        }
      }
      vGeo.attributes.position.needsUpdate = true;

      // Torch fire
      [fire, spark].forEach((p, pi) => {
        const count = pi === 0 ? 320 : 90;
        for (let i = 0; i < count; i++) {
          p.life[i]++;
          if (p.life[i] > p.maxL[i]) {
            const tp = tPos[p.ti[i]];
            p.pos[i * 3] = tp[0] + (Math.random() - 0.5) * 0.09;
            p.pos[i * 3 + 1] = tp[1] + 0.2;
            p.pos[i * 3 + 2] = tp[2] + (Math.random() - 0.5) * 0.09;
            p.vel[i * 3] = (Math.random() - 0.5) * 0.007;
            p.vel[i * 3 + 1] = 0.011 + Math.random() * 0.017;
            p.vel[i * 3 + 2] = (Math.random() - 0.5) * 0.007;
            p.life[i] = 0;
            p.maxL[i] = 50 + Math.random() * 80;
          } else {
            p.pos[i * 3] += p.vel[i * 3];
            p.pos[i * 3 + 1] += p.vel[i * 3 + 1];
            p.pos[i * 3 + 2] += p.vel[i * 3 + 2];
          }
        }
        p.geo.attributes.position.needsUpdate = true;
      });

      // Dust drift
      for (let i = 0; i < DUST; i++) {
        dPos[i * 3] += dVel[i * 3] + Math.sin(t + i * 0.3) * 0.0008;
        dPos[i * 3 + 1] += dVel[i * 3 + 1] + Math.sin(t * 0.5 + i) * 0.0004;
        dPos[i * 3 + 2] += dVel[i * 3 + 2];
        if (Math.abs(dPos[i * 3]) > 6) dVel[i * 3] *= -1;
        if (dPos[i * 3 + 1] < 0 || dPos[i * 3 + 1] > 7) dVel[i * 3 + 1] *= -1;
        if (dPos[i * 3 + 2] > 12 || dPos[i * 3 + 2] < PORTAL_Z - 2)
          dVel[i * 3 + 2] *= -1;
      }
      dGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMM);
      renderer.dispose();
    };
  }, [ref]);
}
