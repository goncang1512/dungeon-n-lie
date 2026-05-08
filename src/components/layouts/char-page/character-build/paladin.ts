import * as THREE from "three";
import { Mats } from "../selection";

export function buildPaladin(g: THREE.Group, m: Mats, scale: number = 1) {
  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7),
    m.armorMat,
  );
  helm.position.y = 1.5;
  g.add(helm);

  const helmDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 16),
    m.armorMat,
  );
  helmDome.position.y = 1.55;
  g.add(helmDome);

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.25, 0.05),
    m.armorMat,
  );
  visor.position.set(0, 1.45, 0.3);
  g.add(visor);

  const slit = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.04, 0.02),
    m.glowMat,
  );
  slit.position.set(0, 1.5, 0.34);
  g.add(slit);

  for (let i = 0; i < 5; i++) {
    const plume = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12 + i * 0.02, 0.18),
      m.goldMat,
    );
    plume.position.set(0, 1.78 + i * 0.04, -0.05 + i * 0.01);
    g.add(plume);
  }

  const gorget = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.18, 12),
    m.armorMat,
  );
  gorget.position.y = 1.25;
  g.add(gorget);

  const chest = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.05, 0.6),
    m.armorMat,
  );
  chest.position.y = 0.7;
  g.add(chest);

  const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.15, 8), m.goldMat);
  emblem.position.set(0, 0.85, 0.31);
  g.add(emblem);

  const crossV = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.18, 0.02),
    m.glowMat,
  );
  const crossH = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.05, 0.02),
    m.glowMat,
  );
  crossV.position.set(0, 0.85, 0.33);
  crossH.position.set(0, 0.85, 0.33);
  g.add(crossV, crossH);

  const pauldronGeo = new THREE.SphereGeometry(
    0.25,
    12,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2,
  );
  const pL = new THREE.Mesh(pauldronGeo, m.armorMat);
  const pR = new THREE.Mesh(pauldronGeo, m.armorMat);
  pL.position.set(-0.55, 1.2, 0);
  pR.position.set(0.55, 1.2, 0);
  pR.scale.x = -1;
  g.add(pL, pR);

  const armGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.85, 8);
  const armL = new THREE.Mesh(armGeo, m.armorMat);
  const armR = new THREE.Mesh(armGeo, m.armorMat);
  armL.position.set(-0.55, 0.55, 0);
  armR.position.set(0.55, 0.55, 0);
  g.add(armL, armR);

  const gauntletGeo = new THREE.BoxGeometry(0.15, 0.18, 0.15);
  const gL = new THREE.Mesh(gauntletGeo, m.armorMat);
  const gR = new THREE.Mesh(gauntletGeo, m.armorMat);
  gL.position.set(-0.55, 0.05, 0);
  gR.position.set(0.55, 0.05, 0);
  g.add(gL, gR);

  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.05, 8, 16),
    m.leatherMat,
  );
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.18;
  g.add(belt);

  const beltBuckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.1, 0.05),
    m.goldMat,
  );
  beltBuckle.position.set(0, 0.18, 0.42);
  g.add(beltBuckle);

  for (let i = 0; i < 4; i++) {
    const tasset = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.3, 0.06),
      m.armorMat,
    );
    const a = -0.4 + i * 0.27;
    tasset.position.set(Math.sin(a) * 0.4, 0.0, Math.cos(a) * 0.4);
    tasset.rotation.y = -a;
    g.add(tasset);
  }

  const legGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.85, 8);
  const legL = new THREE.Mesh(legGeo, m.armorMat);
  const legR = new THREE.Mesh(legGeo, m.armorMat);
  legL.position.set(-0.2, -0.4, 0);
  legR.position.set(0.2, -0.4, 0);
  g.add(legL, legR);

  const bootGeo = new THREE.BoxGeometry(0.3, 0.2, 0.42);
  const bL = new THREE.Mesh(bootGeo, m.armorMat);
  const bR = new THREE.Mesh(bootGeo, m.armorMat);
  bL.position.set(-0.2, -0.9, 0.05);
  bR.position.set(0.2, -0.9, 0.05);
  g.add(bL, bR);

  const swordGrip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8),
    m.leatherMat,
  );
  swordGrip.position.set(0.7, 0.0, 0);
  g.add(swordGrip);

  const swordPommel = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    m.goldMat,
  );
  swordPommel.position.set(0.7, -0.1, 0);
  g.add(swordPommel);

  const swordGuard = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.05, 0.1),
    m.goldMat,
  );
  swordGuard.position.set(0.7, 0.13, 0);
  g.add(swordGuard);

  const swordBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 1.0, 0.025),
    m.metalMat,
  );
  swordBlade.position.set(0.7, 0.65, 0);
  g.add(swordBlade);

  const swordGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.95, 0.01),
    m.glowMat,
  );
  swordGlow.position.set(0.7, 0.65, 0.02);
  g.add(swordGlow);

  const shield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.3, 0.06, 6),
    m.armorMat,
  );
  shield.rotation.x = Math.PI / 2;
  shield.rotation.z = Math.PI;
  shield.position.set(-0.75, 0.55, 0.15);
  g.add(shield);

  const shieldEmblem = new THREE.Mesh(
    new THREE.CircleGeometry(0.15, 16),
    m.goldMat,
  );
  shieldEmblem.position.set(-0.75, 0.55, 0.2);
  shieldEmblem.rotation.y = Math.PI;
  g.add(shieldEmblem);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const ray = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.1, 0.01),
      m.glowMat,
    );
    ray.position.set(-0.75 + Math.cos(a) * 0.1, 0.55 + Math.sin(a) * 0.1, 0.21);
    ray.rotation.z = a;
    g.add(ray);
  }

  const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), m.armorMat);
  cape.position.set(0, 0.5, -0.4);
  cape.rotation.x = -0.1;
  g.add(cape);

  g.scale.setScalar(scale);
}
