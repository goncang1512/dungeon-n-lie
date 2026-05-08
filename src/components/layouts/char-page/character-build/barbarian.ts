import * as THREE from "three";
import { Mats } from "../selection";

export function buildBarbarian(g: THREE.Group, m: Mats, scale: number = 1) {
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 16, 16),
    m.skinMat,
  );
  head.position.y = 1.5;
  g.add(head);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.18, 6),
      m.clothMat,
    );
    spike.position.set(Math.cos(a) * 0.25, 1.7, Math.sin(a) * 0.25);
    spike.rotation.set(Math.random() * 0.5, a, Math.random() * 0.3);
    g.add(spike);
  }

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), m.glowMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), m.glowMat);
  eyeL.position.set(-0.1, 1.53, 0.3);
  eyeR.position.set(0.1, 1.53, 0.3);
  g.add(eyeL, eyeR);

  const paint = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.04, 0.02),
    m.glowMat,
  );
  paint.position.set(0, 1.45, 0.32);
  g.add(paint);

  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.45, 1.0, 12),
    m.skinMat,
  );
  chest.position.y = 0.7;
  g.add(chest);

  const strap = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.12, 0.05),
    m.leatherMat,
  );
  strap.position.set(0, 0.85, 0.35);
  strap.rotation.z = 0.3;
  g.add(strap);

  const shoulderGeo = new THREE.SphereGeometry(0.28, 12, 12);
  const sL = new THREE.Mesh(shoulderGeo, m.skinMat);
  const sR = new THREE.Mesh(shoulderGeo, m.skinMat);
  sL.position.set(-0.6, 1.15, 0);
  sR.position.set(0.6, 1.15, 0);
  g.add(sL, sR);

  const armGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.85, 8);
  const armL = new THREE.Mesh(armGeo, m.skinMat);
  const armR = new THREE.Mesh(armGeo, m.skinMat);
  armL.position.set(-0.65, 0.55, 0);
  armR.position.set(0.65, 0.55, 0);
  g.add(armL, armR);

  for (const x of [-0.65, 0.65]) {
    const br = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.25, 8),
      m.metalMat,
    );
    br.position.set(x, 0.18, 0);
    g.add(br);
    for (let i = 0; i < 4; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.1, 6),
        m.metalMat,
      );
      const a = (i / 4) * Math.PI * 2;
      spike.position.set(x + Math.cos(a) * 0.18, 0.18, Math.sin(a) * 0.18);
      spike.rotation.z = a + Math.PI / 2;
      g.add(spike);
    }
  }

  const handGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
  const handL = new THREE.Mesh(handGeo, m.skinMat);
  handL.position.set(-0.65, -0.05, 0);
  const handR = new THREE.Mesh(handGeo, m.skinMat);
  handR.position.set(0.65, -0.05, 0);
  g.add(handL, handR);

  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.06, 8, 16),
    m.leatherMat,
  );
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.18;
  g.add(belt);

  const buckle = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    m.metalMat,
  );
  buckle.position.set(0, 0.18, 0.42);
  g.add(buckle);

  const loin = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.1),
    m.leatherMat,
  );
  loin.position.set(0, -0.05, 0.3);
  g.add(loin);

  const legGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.85, 8);
  const legL = new THREE.Mesh(legGeo, m.skinMat);
  const legR = new THREE.Mesh(legGeo, m.skinMat);
  legL.position.set(-0.22, -0.4, 0);
  legR.position.set(0.22, -0.4, 0);
  g.add(legL, legR);

  const bootGeo = new THREE.BoxGeometry(0.32, 0.25, 0.42);
  const bL = new THREE.Mesh(bootGeo, m.leatherMat);
  const bR = new THREE.Mesh(bootGeo, m.leatherMat);
  bL.position.set(-0.22, -0.92, 0.06);
  bR.position.set(0.22, -0.92, 0.06);
  g.add(bL, bR);

  const axeHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8),
    m.leatherMat,
  );
  axeHandle.position.set(0.85, 0.6, 0);
  axeHandle.rotation.z = -0.15;
  g.add(axeHandle);

  const axeBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.5, 0.06),
    m.metalMat,
  );
  axeBlade.position.set(1.0, 1.25, 0);
  axeBlade.rotation.z = -0.15;
  g.add(axeBlade);

  const axeEdge = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.05, 0.02),
    m.glowMat,
  );
  axeEdge.position.set(1.0, 1.05, 0);
  axeEdge.rotation.z = -0.15;
  g.add(axeEdge);

  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    m.armorMat,
  );
  skull.position.set(-0.4, 0.05, 0.35);
  skull.scale.y = 1.1;
  g.add(skull);
  g.scale.setScalar(scale);
}
