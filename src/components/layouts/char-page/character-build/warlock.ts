import * as THREE from "three";
import { Mats } from "../selection";

export function buildWarlock(g: THREE.Group, m: Mats, scale: number = 1) {
  // ===== Material tambahan biar nggak semua hitam =====
  const robeMat = new THREE.MeshStandardMaterial({
    color: 0x3a1f5d, // ungu gelap warlock
    roughness: 0.85,
    metalness: 0.05,
  });

  const robeInnerMat = new THREE.MeshStandardMaterial({
    color: 0x1a0d2e, // ungu lebih gelap untuk depth
    roughness: 1.0,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xb8a89a, // kulit pucat keabu-abuan
    roughness: 0.7,
    metalness: 0.0,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xc9a961, // emas
    roughness: 0.3,
    metalness: 0.8,
  });

  const beltMat = new THREE.MeshStandardMaterial({
    color: 0x4a2818, // coklat kulit
    roughness: 0.8,
    metalness: 0.1,
  });

  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x2a1810, // hitam kecoklatan
    roughness: 0.6,
    metalness: 0.2,
  });

  const capeLineMat = new THREE.MeshStandardMaterial({
    color: 0x6b2d8a, // ungu terang untuk lining cape
    roughness: 0.7,
    side: THREE.DoubleSide,
  });

  // ===== HEAD (kulit, bukan cloth hitam) =====
  const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 1), skinMat);
  head.scale.set(1, 1.2, 1);
  head.position.y = 1.5;
  g.add(head);

  // ===== HOOD =====
  const hood = new THREE.Mesh(
    new THREE.ConeGeometry(0.45, 0.55, 8, 1, true),
    robeMat,
  );
  hood.position.y = 1.6;
  g.add(hood);

  // Trim emas di pinggir hood
  const hoodTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.43, 0.02, 6, 16),
    trimMat,
  );
  hoodTrim.position.y = 1.37;
  hoodTrim.rotation.x = Math.PI / 2;
  g.add(hoodTrim);

  const hoodInner = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
    robeInnerMat,
  );
  hoodInner.position.y = 1.6;
  g.add(hoodInner);

  // ===== EYES (dua mata bercahaya, lebih jelas) =====
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), m.glowMat);
  eyeL.position.set(-0.08, 1.52, 0.27);
  g.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), m.glowMat);
  eyeR.position.set(0.08, 1.52, 0.27);
  g.add(eyeR);

  const mark = new THREE.Mesh(
    new THREE.TorusGeometry(0.04, 0.008, 4, 12),
    m.glowMat,
  );
  mark.position.set(0.13, 1.42, 0.26);
  g.add(mark);

  // ===== ROBE BODY =====
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 1.4, 8, 3, true),
    robeMat,
  );
  robe.position.y = 0.7;
  g.add(robe);

  const robeInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.5, 1.3, 8),
    robeInnerMat,
  );
  robeInner.position.y = 0.65;
  g.add(robeInner);

  // ===== TORSO/CHEST PIECE =====
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.3), beltMat);
  torso.position.y = 1.05;
  g.add(torso);

  // Belt emas di pinggang
  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.04, 6, 16),
    trimMat,
  );
  belt.position.y = 0.85;
  belt.rotation.x = Math.PI / 2;
  belt.scale.set(1, 0.7, 1);
  g.add(belt);

  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.08, 0.05),
    trimMat,
  );
  buckle.position.set(0, 0.85, 0.32);
  g.add(buckle);

  const buckleGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.025, 0),
    m.glowMat,
  );
  buckleGem.position.set(0, 0.85, 0.36);
  g.add(buckleGem);

  // ===== PACT MARK di dada =====
  const pactBase = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 16),
    m.glowMat,
  );
  pactBase.position.set(0, 1.15, 0.16);
  g.add(pactBase);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.13, 0.005),
      robeInnerMat,
    );
    line.position.set(Math.cos(a) * 0.06, 1.15 + Math.sin(a) * 0.02, 0.17);
    line.rotation.z = a + Math.PI / 2;
    g.add(line);
  }

  // ===== SHOULDER PADS dengan spike =====
  for (const x of [-0.5, 0.5]) {
    const shoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      robeMat,
    );
    shoulder.position.set(x, 1.15, 0);
    g.add(shoulder);

    const shoulderTrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.17, 0.015, 4, 12),
      trimMat,
    );
    shoulderTrim.position.set(x, 1.15, 0);
    shoulderTrim.rotation.x = Math.PI / 2;
    g.add(shoulderTrim);

    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.18, 6),
      trimMat,
    );
    spike.position.set(x, 1.32, 0);
    g.add(spike);
  }

  // ===== ARMS =====
  const armGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.7, 8);
  const armL = new THREE.Mesh(armGeo, robeMat);
  const armR = new THREE.Mesh(armGeo, robeMat);
  armL.position.set(-0.5, 0.7, 0);
  armR.position.set(0.5, 0.7, 0);
  g.add(armL, armR);

  // Cuff emas di pergelangan
  for (const x of [-0.5, 0.5]) {
    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8),
      trimMat,
    );
    cuff.position.set(x, 0.37, 0);
    g.add(cuff);
  }

  // ===== HANDS (kulit, bukan hitam) =====
  const handGeo = new THREE.BoxGeometry(0.13, 0.13, 0.13);
  const handL = new THREE.Mesh(handGeo, skinMat);
  const handR = new THREE.Mesh(handGeo, skinMat);
  handL.position.set(-0.5, 0.27, 0);
  handR.position.set(0.5, 0.27, 0);
  g.add(handL, handR);

  // ===== CLAWS =====
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const claw = new THREE.Mesh(
        new THREE.ConeGeometry(0.015, 0.08, 4),
        m.glowMat,
      );
      claw.position.set(side * 0.5 - 0.04 + i * 0.04, 0.18, 0.06);
      claw.rotation.x = -0.5;
      g.add(claw);
    }
  }

  // ===== KAKI (LEGS) - BARU =====
  const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.55, 8);
  for (const x of [-0.18, 0.18]) {
    const leg = new THREE.Mesh(legGeo, robeInnerMat);
    leg.position.set(x, -0.3, 0);
    g.add(leg);
  }

  // ===== BOOTS - BARU =====
  for (const x of [-0.18, 0.18]) {
    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.15, 0.28),
      bootMat,
    );
    boot.position.set(x, -0.55, 0.04); // naik dari -0.5 ke -0.27
    g.add(boot);

    // Trim emas di boot
    const bootTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.19, 0.025, 0.29),
      trimMat,
    );
    bootTrim.position.set(x, -0.48, 0.04); // naik dari -0.43 ke -0.2
    g.add(bootTrim);

    // Boot tip runcing
    const bootTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.1, 6),
      trimMat,
    );
    bootTip.position.set(x, -0.55, 0.22); // naik dari -0.5 ke -0.27
    bootTip.rotation.x = Math.PI / 2;
    g.add(bootTip);
  }

  // ===== TOME (buku terbang) =====
  const tome = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.36, 0.08),
    m.leatherMat,
  );
  tome.position.set(-0.75, 0.85, 0.25);
  tome.userData.float = true;
  g.add(tome);

  const tomeTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.02, 0.09),
    trimMat,
  );
  tomeTrim.position.set(-0.75, 1.03, 0.25);
  tomeTrim.userData.float = true;
  g.add(tomeTrim);

  const tomeGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.3),
    m.glowMat,
  );
  tomeGlow.position.set(-0.75, 0.85, 0.31);
  tomeGlow.userData.float = true;
  tomeGlow.userData.flicker = true;
  g.add(tomeGlow);

  const tomeEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 8, 8),
    m.glowMat,
  );
  tomeEye.position.set(-0.75, 0.85, 0.32);
  tomeEye.userData.float = true;
  g.add(tomeEye);

  // ===== DAGGER =====
  const daggerGrip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.18, 6),
    beltMat,
  );
  daggerGrip.position.set(0.5, 0.15, 0.15);
  g.add(daggerGrip);

  const daggerGuard = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.025, 0.04),
    trimMat,
  );
  daggerGuard.position.set(0.5, 0.27, 0.15);
  g.add(daggerGuard);

  const daggerBlade = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.4, 8),
    m.glowMat,
  );
  daggerBlade.position.set(0.55, 0.5, 0.15);
  daggerBlade.rotation.z = -0.3;
  g.add(daggerBlade);

  // ===== ORBITING SHARDS =====
  for (let i = 0; i < 6; i++) {
    const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.1), m.glowMat);
    const a = (i / 6) * Math.PI * 2;
    shard.position.set(Math.cos(a) * 1.0, 0.9, Math.sin(a) * 1.0);
    shard.userData.orbit = true;
    shard.userData.angle = a;
    shard.userData.height = 0.9;
    shard.userData.radius = 1.0;
    g.add(shard);
  }

  // ===== CAPE dengan lining kontras =====
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.5), robeMat);
  cape.position.set(0, 0.7, -0.3);
  cape.rotation.x = -0.1;
  g.add(cape);

  const capeLining = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 1.45),
    capeLineMat,
  );
  capeLining.position.set(0, 0.7, -0.28);
  capeLining.rotation.x = -0.1;
  g.add(capeLining);

  // Cape clasp emas + chain
  const claspL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), trimMat);
  claspL.position.set(-0.2, 1.32, -0.1);
  g.add(claspL);

  const claspR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), trimMat);
  claspR.position.set(0.2, 1.32, -0.1);
  g.add(claspR);

  const chain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.4, 6),
    trimMat,
  );
  chain.position.set(0, 1.32, -0.1);
  chain.rotation.z = Math.PI / 2;
  g.add(chain);

  const offsetY = -0.5;
  g.children.forEach((child) => {
    child.position.y += offsetY;
  });

  g.scale.setScalar(scale);
}
