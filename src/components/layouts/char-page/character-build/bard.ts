import * as THREE from "three";
import { Mats } from "../selection";

export function buildBard(g: THREE.Group, m: Mats, scale: number = 1) {
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), m.skinMat);
  head.position.y = 1.5;
  g.add(head);

  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.04, 16),
    m.armorMat,
  );
  hatBrim.position.y = 1.72;
  hatBrim.rotation.z = 0.1;
  g.add(hatBrim);

  const hatTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.18, 12),
    m.armorMat,
  );
  hatTop.position.y = 1.83;
  hatTop.rotation.z = 0.1;
  g.add(hatTop);

  const feather = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.5, 8),
    m.glowMat,
  );
  feather.position.set(0.18, 2.0, -0.05);
  feather.rotation.set(0.3, 0, 0.4);
  g.add(feather);

  const feather2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.35, 6),
    m.armorMat,
  );
  feather2.position.set(0.22, 1.95, 0);
  feather2.rotation.set(0.2, 0, 0.5);
  g.add(feather2);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), m.glowMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), m.glowMat);
  eyeL.position.set(-0.1, 1.53, 0.27);
  eyeR.position.set(0.1, 1.53, 0.27);
  g.add(eyeL, eyeR);

  const vest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.42, 1.0, 12),
    m.armorMat,
  );
  vest.position.y = 0.7;
  g.add(vest);

  for (let i = 0; i < 4; i++) {
    const button = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 8),
      m.glowMat,
    );
    button.position.set(0, 1.05 - i * 0.18, 0.4);
    g.add(button);
  }

  const collar = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.2, 4),
    m.clothMat,
  );
  collar.position.set(0, 1.1, 0.36);
  collar.rotation.x = Math.PI;
  g.add(collar);

  const shoulderGeo = new THREE.SphereGeometry(0.18, 10, 10);
  const sL = new THREE.Mesh(shoulderGeo, m.armorMat);
  const sR = new THREE.Mesh(shoulderGeo, m.armorMat);
  sL.position.set(-0.52, 1.18, 0);
  sR.position.set(0.52, 1.18, 0);
  g.add(sL, sR);

  const armGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.85, 8);
  const armL = new THREE.Mesh(armGeo, m.armorMat);
  const armR = new THREE.Mesh(armGeo, m.armorMat);
  armL.position.set(-0.55, 0.6, 0);
  armR.position.set(0.55, 0.6, 0);
  g.add(armL, armR);

  const handGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const handL = new THREE.Mesh(handGeo, m.skinMat);
  handL.position.set(-0.55, 0.15, 0);
  const handR = new THREE.Mesh(handGeo, m.skinMat);
  handR.position.set(0.55, 0.15, 0);
  g.add(handL, handR);

  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.5), m.glowMat);
  sash.position.set(0, 0.3, 0);
  g.add(sash);

  const legGeo = new THREE.CylinderGeometry(0.13, 0.14, 0.85, 8);
  const legL = new THREE.Mesh(legGeo, m.leatherMat);
  const legR = new THREE.Mesh(legGeo, m.leatherMat);
  legL.position.set(-0.2, -0.35, 0);
  legR.position.set(0.2, -0.35, 0);
  g.add(legL, legR);

  const bootGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.4, 8);
  const bL = new THREE.Mesh(bootGeo, m.leatherMat);
  const bR = new THREE.Mesh(bootGeo, m.leatherMat);
  bL.position.set(-0.2, -0.85, 0.03);
  bR.position.set(0.2, -0.85, 0.03);
  g.add(bL, bR);

  const rapierGuard = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.015, 8, 16),
    m.metalMat,
  );
  rapierGuard.position.set(0.7, 0.1, 0);
  rapierGuard.rotation.x = Math.PI / 2;
  g.add(rapierGuard);

  const rapierGrip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6),
    m.leatherMat,
  );
  rapierGrip.position.set(0.7, -0.05, 0);
  g.add(rapierGrip);

  const rapierBlade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.005, 0.85, 6),
    m.metalMat,
  );
  rapierBlade.position.set(0.7, 0.55, 0);
  g.add(rapierBlade);

  const luteBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    m.leatherMat,
  );
  luteBody.scale.set(1, 1.2, 0.5);
  luteBody.position.set(-0.15, 0.7, -0.45);
  luteBody.rotation.z = 0.3;
  g.add(luteBody);

  const luteNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6),
    m.leatherMat,
  );
  luteNeck.position.set(0.05, 1.15, -0.4);
  luteNeck.rotation.z = 0.3;
  g.add(luteNeck);

  for (let i = 0; i < 4; i++) {
    const string = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 0.85, 4),
      m.glowMat,
    );
    string.position.set(-0.05 + i * 0.02, 0.92, -0.4);
    string.rotation.z = 0.3;
    g.add(string);
  }

  for (let i = 0; i < 4; i++) {
    const note = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      m.glowMat,
    );
    const a = (i / 4) * Math.PI * 2;
    note.position.set(Math.cos(a) * 0.85, 1.2, Math.sin(a) * 0.85);
    note.userData.orbit = true;
    note.userData.angle = a;
    note.userData.height = 1.2;
    note.userData.radius = 0.85;
    g.add(note);
  }
  g.scale.setScalar(scale);
}
