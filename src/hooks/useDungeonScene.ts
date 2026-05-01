import { useEffect } from "react";
import * as THREE from "three";

export function useDungeonScene(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getSize = () => ({
      w: canvas.parentElement?.offsetWidth ?? window.innerWidth,
      h: canvas.parentElement?.offsetHeight ?? window.innerHeight,
    });

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.6;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c1208);
    scene.fog = new THREE.FogExp2(0x1c1208, 0.032);

    const { w, h } = getSize();
    const camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 100);
    camera.position.set(0, 2.2, 9);
    camera.lookAt(0, 1.5, 0);
    renderer.setSize(w, h);

    // ── Procedural stone texture ──────────────────────────────────────────
    function makeStoneCanvas(
      base: [number, number, number],
      grout: [number, number, number],
      cols: number,
      rows: number,
      res = 512,
    ): HTMLCanvasElement {
      const cv = document.createElement("canvas");
      cv.width = res;
      cv.height = res;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = `rgb(${grout[0]},${grout[1]},${grout[2]})`;
      ctx.fillRect(0, 0, res, res);
      const bw = res / cols,
        bh = res / rows;
      const gw = 5;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const off = r % 2 === 0 ? 0 : bw / 2;
          const x = (c * bw + off) % res,
            y = r * bh;
          const n = () => (Math.random() - 0.5) * 22;
          const cr = Math.max(0, Math.min(255, base[0] + n()));
          const cg = Math.max(0, Math.min(255, base[1] + n()));
          const cb = Math.max(0, Math.min(255, base[2] + n()));
          ctx.fillStyle = `rgb(${Math.round(cr)},${Math.round(cg)},${Math.round(cb)})`;
          ctx.fillRect(x + gw, y + gw, bw - gw * 2, bh - gw * 2);
          ctx.fillStyle = `rgba(0,0,0,0.12)`;
          ctx.fillRect(x + gw, y + gw, bw - gw * 2, 3);
          ctx.fillRect(x + gw, y + gw, 3, bh - gw * 2);
          for (let k = 0; k < 2; k++) {
            ctx.strokeStyle = `rgba(${Math.round(cr * 0.5)},${Math.round(cg * 0.5)},${Math.round(cb * 0.5)},0.35)`;
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
      for (let i = 0; i < 4000; i++) {
        const v = Math.random() > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${v},${v},${v},0.025)`;
        ctx.fillRect(Math.random() * res, Math.random() * res, 1, 1);
      }
      return cv;
    }

    // ── Procedural wood texture for torch handle ──────────────────────────
    function makeWoodCanvas(res = 256): HTMLCanvasElement {
      const cv = document.createElement("canvas");
      cv.width = res;
      cv.height = res;
      const ctx = cv.getContext("2d")!;
      // Base dark walnut color
      ctx.fillStyle = "#2e1608";
      ctx.fillRect(0, 0, res, res);
      // Vertical grain streaks
      for (let x = 0; x < res; x++) {
        const wave = Math.sin(x * 0.55 + Math.sin(x * 0.12) * 4) * 6;
        const bright = 18 + Math.abs(Math.sin(x * 0.25 + wave * 0.3)) * 28;
        ctx.strokeStyle = `rgba(${Math.round(70 + bright)},${Math.round(35 + bright * 0.45)},${Math.round(8 + bright * 0.18)},0.55)`;
        ctx.lineWidth = 0.7 + Math.random() * 0.9;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + wave * 0.4, res);
        ctx.stroke();
      }
      // Horizontal ring bands (growth rings)
      for (let y = 0; y < res; y += 12 + Math.random() * 18) {
        ctx.strokeStyle = `rgba(15,6,2,${0.08 + Math.random() * 0.1})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(res, y + (Math.random() - 0.5) * 3);
        ctx.stroke();
      }
      // Knot rings
      for (let k = 0; k < 2; k++) {
        const kx = res * (0.2 + Math.random() * 0.6),
          ky = Math.random() * res;
        for (let r = 1; r < 10; r += 2.2) {
          ctx.strokeStyle = `rgba(12,5,1,${0.18 - r * 0.015})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.ellipse(kx, ky, r * 1.6, r, 0.1, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // Edge vignette (darkens the sides of the cylinder naturally)
      const vg = ctx.createLinearGradient(0, 0, res, 0);
      vg.addColorStop(0, "rgba(0,0,0,0.45)");
      vg.addColorStop(0.15, "rgba(0,0,0,0.05)");
      vg.addColorStop(0.85, "rgba(0,0,0,0.05)");
      vg.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, res, res);
      return cv;
    }

    // ── Procedural metal/iron texture ─────────────────────────────────────
    function makeMetalCanvas(res = 128): HTMLCanvasElement {
      const cv = document.createElement("canvas");
      cv.width = res;
      cv.height = res;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = "#1a0e06";
      ctx.fillRect(0, 0, res, res);
      // Hammered texture noise
      for (let i = 0; i < 600; i++) {
        const x = Math.random() * res,
          y = Math.random() * res;
        const v = 12 + Math.random() * 24;
        ctx.fillStyle = `rgba(${v},${Math.round(v * 0.75)},${Math.round(v * 0.4)},0.35)`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // Directional scratch lines
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = `rgba(50,30,12,0.22)`;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        const y0 = Math.random() * res;
        ctx.moveTo(0, y0);
        ctx.lineTo(res, y0 + (Math.random() - 0.5) * 6);
        ctx.stroke();
      }
      // Rust spots
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * res,
          y = Math.random() * res,
          r = 2 + Math.random() * 5;
        const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, "rgba(90,30,8,0.3)");
        rg.addColorStop(1, "rgba(90,30,8,0)");
        ctx.fillStyle = rg;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      return cv;
    }

    // ── Procedural flame gradient texture for billboard ───────────────────
    function makeFlameCanvas(res = 128): HTMLCanvasElement {
      const cv = document.createElement("canvas");
      cv.width = res;
      cv.height = res * 2;
      const ctx = cv.getContext("2d")!;
      ctx.clearRect(0, 0, res, res * 2);
      // Outer soft glow
      const outer = ctx.createRadialGradient(
        res / 2,
        res * 1.5,
        4,
        res / 2,
        res * 0.85,
        res * 0.72,
      );
      outer.addColorStop(0, "rgba(255,240,160,1)");
      outer.addColorStop(0.12, "rgba(255,200,50,0.95)");
      outer.addColorStop(0.32, "rgba(255,90,8,0.85)");
      outer.addColorStop(0.58, "rgba(180,25,0,0.5)");
      outer.addColorStop(0.82, "rgba(80,10,0,0.2)");
      outer.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = outer;
      ctx.fillRect(0, 0, res, res * 2);
      // Inner bright core streak
      const inner = ctx.createRadialGradient(
        res / 2,
        res * 1.5,
        1,
        res / 2,
        res * 1.1,
        res * 0.28,
      );
      inner.addColorStop(0, "rgba(255,255,220,0.9)");
      inner.addColorStop(0.35, "rgba(255,220,80,0.6)");
      inner.addColorStop(0.7, "rgba(255,100,20,0.25)");
      inner.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = inner;
      ctx.fillRect(0, 0, res, res * 2);
      return cv;
    }

    function stoneTex(
      base: [number, number, number],
      grout: [number, number, number],
      cols: number,
      rows: number,
      repU = 2,
      repV = 2,
    ) {
      const t = new THREE.CanvasTexture(
        makeStoneCanvas(base, grout, cols, rows),
      );
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repU, repV);
      return t;
    }

    const wallT = stoneTex([88, 68, 42], [40, 30, 16], 5, 8, 2.5, 3);
    const floorT = stoneTex([70, 54, 32], [32, 24, 12], 8, 8, 4, 4);
    const pilT = stoneTex([78, 60, 36], [35, 26, 14], 2, 7, 1, 2);

    // Wood texture for torch handle
    const woodT = new THREE.CanvasTexture(makeWoodCanvas());
    woodT.wrapS = woodT.wrapT = THREE.RepeatWrapping;
    woodT.repeat.set(1, 2);

    // Metal texture for bracket/bands
    const metalTexture = new THREE.CanvasTexture(makeMetalCanvas());
    metalTexture.wrapS = metalTexture.wrapT = THREE.RepeatWrapping;

    // Flame billboard texture
    const flameTexture = new THREE.CanvasTexture(makeFlameCanvas());

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallT,
      roughness: 0.93,
      metalness: 0.02,
      color: 0xd4a060,
    });
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorT,
      roughness: 0.97,
      metalness: 0.0,
      color: 0xb88840,
    });
    const ceilMat = new THREE.MeshStandardMaterial({
      map: wallT,
      roughness: 1.0,
      metalness: 0.0,
      color: 0x7a5830,
    });
    const pilMat = new THREE.MeshStandardMaterial({
      map: pilT,
      roughness: 0.9,
      metalness: 0.0,
      color: 0xc09050,
    });
    const stoneDk = new THREE.MeshStandardMaterial({
      map: pilT,
      roughness: 0.95,
      metalness: 0.0,
      color: 0x8a6838,
    });
    // NEW: wood + metal materials for torch
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodT,
      roughness: 0.88,
      metalness: 0.0,
      color: 0xd08040,
    });
    const ironMat = new THREE.MeshStandardMaterial({
      map: metalTexture,
      roughness: 0.55,
      metalness: 0.85,
      color: 0x806040,
    });
    const charMat = new THREE.MeshStandardMaterial({
      color: 0x1a0d04,
      roughness: 1.0,
      metalness: 0.0,
    });

    // ── Floor ────────────────────────────────────────────────────────────
    const flGeo = new THREE.PlaneGeometry(26, 26, 24, 24);
    const fp = flGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < fp.count; i++) fp.setZ(i, (Math.random() - 0.5) * 0.07);
    flGeo.computeVertexNormals();
    const floor = new THREE.Mesh(flGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Ceiling ──────────────────────────────────────────────────────────
    const clGeo = new THREE.PlaneGeometry(26, 26, 16, 16);
    const cp = clGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, (Math.random() - 0.5) * 0.14);
    clGeo.computeVertexNormals();
    const ceil = new THREE.Mesh(clGeo, ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 6.8;
    scene.add(ceil);

    // ── Walls ────────────────────────────────────────────────────────────
    const addBox = (
      x: number,
      y: number,
      z: number,
      sx: number,
      sy: number,
      sz: number,
      mat: THREE.Material,
      ry = 0,
    ) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    };
    addBox(-8.8, 3, 0, 0.6, 8, 22, wallMat);
    addBox(8.8, 3, 0, 0.6, 8, 22, wallMat);
    addBox(0, 3, -11, 20, 8, 0.6, wallMat);
    addBox(0, 3, 11, 20, 8, 0.6, wallMat);

    // ── Pillars ──────────────────────────────────────────────────────────
    const pDefs: [number, number][] = [
      [-4.8, -4.5],
      [-4.8, 0.5],
      [-4.8, 5.5],
      [4.8, -4.5],
      [4.8, 0.5],
      [4.8, 5.5],
    ];
    pDefs.forEach(([x, z]) => {
      addBox(x, -0.3, z, 1.0, 0.38, 1.0, stoneDk);
      addBox(x, 3.1, z, 0.68, 6.8, 0.68, pilMat);
      addBox(x, 6.55, z, 1.05, 0.32, 1.05, stoneDk);
      addBox(x, 6.72, z, 1.35, 0.18, 1.35, stoneDk);
      addBox(x, 6.38, z, 1.6, 0.2, 0.2, stoneDk);
      addBox(x, 6.38, z, 0.2, 0.2, 1.6, stoneDk);
    });
    for (let z = -6; z <= 7; z += 4.5) {
      addBox(0, 6.65, z, 18.5, 0.32, 0.55, stoneDk);
    }

    // ── IMPROVED TORCH BUILDER ────────────────────────────────────────────
    type TP = [number, number, number];
    const tPos: TP[] = [
      [-4.5, 3.3, -1.5],
      [-4.5, 3.3, 3.5],
      [4.5, 3.3, -1.5],
      [4.5, 3.3, 3.5],
    ];
    const ptLights: THREE.PointLight[] = [];
    const ptPhase: number[] = [];
    const flameBillboards: THREE.Mesh[] = []; // face-camera flame planes
    const flameBillboards2: THREE.Mesh[] = []; // second layer, 90° rotated

    tPos.forEach((pos, i) => {
      const [px, py, pz] = pos;
      const side = px < 0 ? 1 : -1; // which wall side

      // ── Wall mounting plate (iron) ──────────────────────────────────
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.24, 0.08),
        ironMat,
      );
      plate.position.set(px + side * 0.03, py - 0.06, pz);
      plate.castShadow = true;
      scene.add(plate);

      // ── Horizontal arm extending from wall ──────────────────────────
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.02, 0.36, 10),
        ironMat,
      );
      arm.rotation.z = Math.PI / 2;
      arm.position.set(px + side * 0.2, py + 0.02, pz);
      arm.castShadow = true;
      scene.add(arm);

      // ── Ring clamp holding the torch ────────────────────────────────
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.014, 8, 18),
        ironMat,
      );
      ring.rotation.z = Math.PI / 2;
      ring.position.set(px + side * 0.39, py + 0.02, pz);
      scene.add(ring);

      // Small bolts on ring
      for (let b = 0; b < 2; b++) {
        const bolt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.008, 0.022, 6),
          ironMat,
        );
        bolt.position.set(
          px + side * 0.39 + (b === 0 ? 0.0 : 0.0),
          py + 0.02 + (b === 0 ? 0.048 : -0.048),
          pz,
        );
        scene.add(bolt);
      }

      // ── Torch handle — tapered cylinder with wood texture ────────────
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.042, 0.58, 14, 6), // more segments for better texture
        woodMat,
      );
      handle.position.set(px, py, pz);
      handle.castShadow = true;
      scene.add(handle);

      // ── Decorative iron bands on handle ──────────────────────────────
      const bandYs = [-0.21, -0.04, 0.16];
      bandYs.forEach((by) => {
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(0.046, 0.046, 0.024, 14),
          ironMat,
        );
        band.position.set(px, py + by, pz);
        scene.add(band);
      });

      // ── Charred top section (burnt wood near flame) ───────────────────
      const charTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.034, 0.14, 12),
        charMat,
      );
      charTop.position.set(px, py + 0.3, pz);
      scene.add(charTop);

      // ── Iron fire bowl / cup ──────────────────────────────────────────
      const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.058, 0.03, 0.065, 12, 1, true), // open-top cup
        ironMat,
      );
      bowl.position.set(px, py + 0.345, pz);
      scene.add(bowl);
      // Bowl base disc
      const bowlBase = new THREE.Mesh(
        new THREE.CircleGeometry(0.03, 12),
        ironMat,
      );
      bowlBase.rotation.x = Math.PI / 2;
      bowlBase.position.set(px, py + 0.313, pz);
      scene.add(bowlBase);

      // ── Flame billboard — two crossed alpha planes ────────────────────
      // These face the camera each frame (see tick loop)
      const flameGeo = new THREE.PlaneGeometry(0.3, 0.58);
      const flameMat = new THREE.MeshBasicMaterial({
        map: flameTexture,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const fb1 = new THREE.Mesh(flameGeo, flameMat);
      fb1.position.set(px, py + 0.62, pz);
      fb1.renderOrder = 2;
      scene.add(fb1);
      flameBillboards.push(fb1);

      const fb2 = new THREE.Mesh(flameGeo.clone(), flameMat.clone());
      fb2.position.set(px, py + 0.62, pz);
      fb2.rotation.y = Math.PI / 2;
      fb2.renderOrder = 2;
      scene.add(fb2);
      flameBillboards2.push(fb2);

      // ── Bright inner core sphere ──────────────────────────────────────
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.048, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xfffde8 }),
      );
      core.position.set(px, py + 0.39, pz);
      scene.add(core);

      // ── Soft orange halo glow sphere ──────────────────────────────────
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

      // ── Point light ───────────────────────────────────────────────────
      const pt = new THREE.PointLight(0xff8822, 5.5, 16);
      pt.position.set(px, py + 0.44, pz);
      pt.castShadow = true;
      pt.shadow.mapSize.set(512, 512);
      pt.shadow.radius = 3;
      scene.add(pt);
      ptLights.push(pt);
      ptPhase.push(i * 1.5 + Math.random() * Math.PI * 2);
    });

    // ── Ambient / hemisphere ─────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x5a3c18, 0.65));
    scene.add(new THREE.HemisphereLight(0x7a5020, 0x1c0e04, 0.4));

    // ── Fire particles ────────────────────────────────────────────────────
    const FIRE = 360;
    const fp2 = new Float32Array(FIRE * 3),
      fv = new Float32Array(FIRE * 3);
    const fl2 = new Float32Array(FIRE),
      fm = new Float32Array(FIRE),
      ft = new Int32Array(FIRE);
    const fGeo = new THREE.BufferGeometry();
    for (let i = 0; i < FIRE; i++) {
      const ti = Math.floor(Math.random() * tPos.length);
      ft[i] = ti;
      const p = tPos[ti];
      fp2[i * 3] = p[0] + (Math.random() - 0.5) * 0.1;
      fp2[i * 3 + 1] = p[1] + 0.3;
      fp2[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.1;
      fv[i * 3] = (Math.random() - 0.5) * 0.007;
      fv[i * 3 + 1] = 0.011 + Math.random() * 0.018;
      fv[i * 3 + 2] = (Math.random() - 0.5) * 0.007;
      fm[i] = 45 + Math.random() * 85;
      fl2[i] = Math.random() * fm[i];
    }
    fGeo.setAttribute("position", new THREE.BufferAttribute(fp2, 3));
    scene.add(
      new THREE.Points(
        fGeo,
        new THREE.PointsMaterial({
          color: 0xff9933,
          size: 0.065,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );

    // Bright yellow inner fire particles
    const INNER = 90;
    const ip = new Float32Array(INNER * 3),
      iv = new Float32Array(INNER * 3);
    const il = new Float32Array(INNER),
      im = new Float32Array(INNER),
      it2 = new Int32Array(INNER);
    const iGeo = new THREE.BufferGeometry();
    for (let i = 0; i < INNER; i++) {
      const ti = Math.floor(Math.random() * tPos.length);
      it2[i] = ti;
      const p = tPos[ti];
      ip[i * 3] = p[0] + (Math.random() - 0.5) * 0.06;
      ip[i * 3 + 1] = p[1] + 0.34;
      ip[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.06;
      iv[i * 3] = (Math.random() - 0.5) * 0.004;
      iv[i * 3 + 1] = 0.007 + Math.random() * 0.011;
      iv[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
      im[i] = 28 + Math.random() * 42;
      il[i] = Math.random() * im[i];
    }
    iGeo.setAttribute("position", new THREE.BufferAttribute(ip, 3));
    scene.add(
      new THREE.Points(
        iGeo,
        new THREE.PointsMaterial({
          color: 0xffee55,
          size: 0.042,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );

    // Orange halo particles
    const HALO = 120;
    const hp = new Float32Array(HALO * 3),
      hv = new Float32Array(HALO * 3);
    const hl = new Float32Array(HALO),
      hm = new Float32Array(HALO),
      ht2 = new Int32Array(HALO);
    const hGeo = new THREE.BufferGeometry();
    for (let i = 0; i < HALO; i++) {
      const ti = Math.floor(Math.random() * tPos.length);
      ht2[i] = ti;
      const p = tPos[ti];
      hp[i * 3] = p[0] + (Math.random() - 0.5) * 0.3;
      hp[i * 3 + 1] = p[1] + 0.3 + (Math.random() - 0.5) * 0.3;
      hp[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.3;
      hv[i * 3] = (Math.random() - 0.5) * 0.005;
      hv[i * 3 + 1] = 0.003 + Math.random() * 0.006;
      hv[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
      hm[i] = 80 + Math.random() * 120;
      hl[i] = Math.random() * hm[i];
    }
    hGeo.setAttribute("position", new THREE.BufferAttribute(hp, 3));
    scene.add(
      new THREE.Points(
        hGeo,
        new THREE.PointsMaterial({
          color: 0xff6600,
          size: 0.12,
          transparent: true,
          opacity: 0.28,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );

    // Sparks
    const SPARK = 110;
    const sp = new Float32Array(SPARK * 3),
      sv = new Float32Array(SPARK * 3);
    const sl = new Float32Array(SPARK),
      sm = new Float32Array(SPARK),
      sti = new Int32Array(SPARK);
    const sGeo = new THREE.BufferGeometry();
    for (let i = 0; i < SPARK; i++) {
      const ti = Math.floor(Math.random() * tPos.length);
      sti[i] = ti;
      const p = tPos[ti];
      sp[i * 3] = p[0];
      sp[i * 3 + 1] = p[1] + 0.38;
      sp[i * 3 + 2] = p[2];
      sv[i * 3] = (Math.random() - 0.5) * 0.03;
      sv[i * 3 + 1] = 0.026 + Math.random() * 0.038;
      sv[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
      sm[i] = 15 + Math.random() * 28;
      sl[i] = Math.random() * sm[i];
    }
    sGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    scene.add(
      new THREE.Points(
        sGeo,
        new THREE.PointsMaterial({
          color: 0xffeeaa,
          size: 0.028,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );

    // Smoke (subtle dark wisps rising from flame)
    const SMOKE = 55;
    const smp = new Float32Array(SMOKE * 3),
      smv = new Float32Array(SMOKE * 3);
    const sml = new Float32Array(SMOKE),
      smm = new Float32Array(SMOKE),
      smt = new Int32Array(SMOKE);
    const smGeo = new THREE.BufferGeometry();
    for (let i = 0; i < SMOKE; i++) {
      const ti = Math.floor(Math.random() * tPos.length);
      smt[i] = ti;
      const p = tPos[ti];
      smp[i * 3] = p[0] + (Math.random() - 0.5) * 0.1;
      smp[i * 3 + 1] = p[1] + 0.62;
      smp[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.1;
      smv[i * 3] = (Math.random() - 0.5) * 0.004;
      smv[i * 3 + 1] = 0.006 + Math.random() * 0.008;
      smv[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
      smm[i] = 90 + Math.random() * 110;
      sml[i] = Math.random() * smm[i];
    }
    smGeo.setAttribute("position", new THREE.BufferAttribute(smp, 3));
    scene.add(
      new THREE.Points(
        smGeo,
        new THREE.PointsMaterial({
          color: 0x1a0e06,
          size: 0.16,
          transparent: true,
          opacity: 0.16,
          depthWrite: false,
        }),
      ),
    );

    // Dust
    const DUST = 200;
    const dp = new Float32Array(DUST * 3),
      dv = new Float32Array(DUST * 3);
    const dGeo = new THREE.BufferGeometry();
    for (let i = 0; i < DUST; i++) {
      dp[i * 3] = (Math.random() - 0.5) * 16;
      dp[i * 3 + 1] = Math.random() * 5.5;
      dp[i * 3 + 2] = (Math.random() - 0.5) * 12;
      dv[i * 3] = (Math.random() - 0.5) * 0.003;
      dv[i * 3 + 1] = (Math.random() - 0.5) * 0.0015;
      dv[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    dGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    scene.add(
      new THREE.Points(
        dGeo,
        new THREE.PointsMaterial({
          color: 0xddaa55,
          size: 0.026,
          transparent: true,
          opacity: 0.28,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );

    // ── Mouse ─────────────────────────────────────────────────────────────
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

    // ── Animation loop ────────────────────────────────────────────────────
    let t = 0,
      raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += 0.016;

      camera.position.x += (mx * 0.35 - camera.position.x) * 0.022;
      camera.position.y += (2.2 + my * 0.22 - camera.position.y) * 0.022;
      camera.lookAt(0, 1.5, 0);

      // Torch flicker + billboard face-camera
      ptLights.forEach((l, i) => {
        ptPhase[i] += 0.065 + Math.random() * 0.045;
        const flk =
          Math.sin(ptPhase[i]) * 1.5 + Math.sin(ptPhase[i] * 2.4) * 0.7;
        l.intensity = 5.0 + flk;
        l.color.setHSL(0.075 + Math.sin(ptPhase[i] * 0.35) * 0.008, 0.93, 0.52);

        // Wobble flame scale
        const fw = 1.0 + Math.sin(ptPhase[i] * 2.2) * 0.11;
        const fh = 1.0 + Math.sin(ptPhase[i] * 1.7 + 0.8) * 0.09;

        // Billboard 1: always face the camera (yaw only)
        if (flameBillboards[i]) {
          const fb = flameBillboards[i];
          fb.scale.set(fw, fh, 1);
          fb.position.y =
            tPos[i][1] + 0.62 + Math.sin(ptPhase[i] * 2.1) * 0.016;
          fb.position.x = tPos[i][0] + Math.sin(ptPhase[i] * 1.4) * 0.012;
          fb.rotation.y = Math.atan2(
            camera.position.x - fb.position.x,
            camera.position.z - fb.position.z,
          );
        }
        // Billboard 2: perpendicular to billboard 1
        if (flameBillboards2[i]) {
          const fb2 = flameBillboards2[i];
          fb2.scale.set(fw * 0.88, fh * 0.92, 1);
          fb2.position.y =
            tPos[i][1] + 0.6 + Math.sin(ptPhase[i] * 2.4) * 0.014;
          fb2.rotation.y = flameBillboards[i].rotation.y + Math.PI / 2;
        }
      });

      // Fire particles
      for (let i = 0; i < FIRE; i++) {
        fl2[i]++;
        if (fl2[i] > fm[i]) {
          const p = tPos[ft[i]];
          fp2[i * 3] = p[0] + (Math.random() - 0.5) * 0.09;
          fp2[i * 3 + 1] = p[1] + 0.28;
          fp2[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.09;
          fv[i * 3] = (Math.random() - 0.5) * 0.007;
          fv[i * 3 + 1] = 0.011 + Math.random() * 0.018;
          fv[i * 3 + 2] = (Math.random() - 0.5) * 0.007;
          fl2[i] = 0;
          fm[i] = 45 + Math.random() * 85;
        } else {
          fp2[i * 3] += fv[i * 3] + Math.sin(t * 1.8 + i * 0.3) * 0.003;
          fp2[i * 3 + 1] += fv[i * 3 + 1];
          fp2[i * 3 + 2] += fv[i * 3 + 2];
        }
      }
      fGeo.attributes.position.needsUpdate = true;

      // Inner fire
      for (let i = 0; i < INNER; i++) {
        il[i]++;
        if (il[i] > im[i]) {
          const p = tPos[it2[i]];
          ip[i * 3] = p[0] + (Math.random() - 0.5) * 0.05;
          ip[i * 3 + 1] = p[1] + 0.34;
          ip[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.05;
          iv[i * 3] = (Math.random() - 0.5) * 0.004;
          iv[i * 3 + 1] = 0.007 + Math.random() * 0.011;
          iv[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
          il[i] = 0;
        } else {
          ip[i * 3] += iv[i * 3];
          ip[i * 3 + 1] += iv[i * 3 + 1];
          ip[i * 3 + 2] += iv[i * 3 + 2];
        }
      }
      iGeo.attributes.position.needsUpdate = true;

      // Halo
      for (let i = 0; i < HALO; i++) {
        hl[i]++;
        if (hl[i] > hm[i]) {
          const p = tPos[ht2[i]];
          hp[i * 3] = p[0] + (Math.random() - 0.5) * 0.3;
          hp[i * 3 + 1] = p[1] + 0.3;
          hp[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.3;
          hv[i * 3] = (Math.random() - 0.5) * 0.005;
          hv[i * 3 + 1] = 0.003 + Math.random() * 0.006;
          hv[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
          hl[i] = 0;
        } else {
          hp[i * 3] += hv[i * 3];
          hp[i * 3 + 1] += hv[i * 3 + 1];
          hp[i * 3 + 2] += hv[i * 3 + 2];
        }
      }
      hGeo.attributes.position.needsUpdate = true;

      // Sparks
      for (let i = 0; i < SPARK; i++) {
        sl[i]++;
        if (sl[i] > sm[i]) {
          const p = tPos[sti[i]];
          sp[i * 3] = p[0] + (Math.random() - 0.5) * 0.05;
          sp[i * 3 + 1] = p[1] + 0.38;
          sp[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.05;
          sv[i * 3] = (Math.random() - 0.5) * 0.03;
          sv[i * 3 + 1] = 0.026 + Math.random() * 0.038;
          sv[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
          sl[i] = 0;
        } else {
          sv[i * 3 + 1] -= 0.0009;
          sp[i * 3] += sv[i * 3];
          sp[i * 3 + 1] += sv[i * 3 + 1];
          sp[i * 3 + 2] += sv[i * 3 + 2];
        }
      }
      sGeo.attributes.position.needsUpdate = true;

      // Smoke
      for (let i = 0; i < SMOKE; i++) {
        sml[i]++;
        if (sml[i] > smm[i]) {
          const p = tPos[smt[i]];
          smp[i * 3] = p[0] + (Math.random() - 0.5) * 0.1;
          smp[i * 3 + 1] = p[1] + 0.6;
          smp[i * 3 + 2] = p[2] + (Math.random() - 0.5) * 0.1;
          smv[i * 3] = (Math.random() - 0.5) * 0.004;
          smv[i * 3 + 1] = 0.005 + Math.random() * 0.007;
          smv[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
          sml[i] = 0;
        } else {
          smp[i * 3] += smv[i * 3] + Math.sin(t * 0.9 + i) * 0.0018;
          smp[i * 3 + 1] += smv[i * 3 + 1];
          smp[i * 3 + 2] += smv[i * 3 + 2];
        }
      }
      smGeo.attributes.position.needsUpdate = true;

      // Dust
      for (let i = 0; i < DUST; i++) {
        dp[i * 3] += dv[i * 3];
        dp[i * 3 + 1] += dv[i * 3 + 1] + Math.sin(t + i * 0.4) * 0.0004;
        dp[i * 3 + 2] += dv[i * 3 + 2];
        if (Math.abs(dp[i * 3]) > 8) dv[i * 3] *= -1;
        if (dp[i * 3 + 1] < 0 || dp[i * 3 + 1] > 5.5) dv[i * 3 + 1] *= -1;
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
  }, [canvasRef]);
}
