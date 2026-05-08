import * as THREE from "three";
import { Mats } from "../selection";

export function buildWizard(g: THREE.Group, m: Mats, scale: number = 1) {
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 16),
    m.skinMat,
  );
  head.position.y = 1.5;
  g.add(head);

  const beard = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.4, 8),
    m.clothMat,
  );
  beard.position.set(0, 1.25, 0.18);
  beard.rotation.x = -0.2;
  g.add(beard);

  const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16),
    m.armorMat,
  );
  hatBrim.position.y = 1.7;
  g.add(hatBrim);

  const hatCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.7, 16),
    m.armorMat,
  );
  hatCone.position.y = 2.05;
  hatCone.rotation.z = 0.15;
  hatCone.rotation.x = -0.05;
  g.add(hatCone);

  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), m.glowMat);
  star.position.set(0.05, 2.35, 0);
  g.add(star);

  const hatBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.025, 8, 24),
    m.goldMat,
  );
  hatBand.rotation.x = Math.PI / 2;
  hatBand.position.y = 1.78;
  g.add(hatBand);

  const hatGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), m.glowMat);
  hatGem.position.set(0, 1.78, 0.32);
  g.add(hatGem);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), m.glowMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), m.glowMat);
  eyeL.position.set(-0.08, 1.53, 0.25);
  eyeR.position.set(0.08, 1.53, 0.25);
  g.add(eyeL, eyeR);

  const robe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.7, 1.6, 12),
    m.armorMat,
  );
  robe.position.y = 0.4;
  g.add(robe);

  const trim = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.02, 6, 32),
    m.glowMat,
  );
  trim.rotation.x = Math.PI / 2;
  trim.position.y = -0.4;
  g.add(trim);

  const sash = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.04, 6, 16),
    m.glowMat,
  );
  sash.rotation.x = Math.PI / 2;
  sash.position.y = 0.25;
  g.add(sash);

  const armGeo = new THREE.CylinderGeometry(0.1, 0.18, 0.85, 8);
  const armL = new THREE.Mesh(armGeo, m.armorMat);
  const armR = new THREE.Mesh(armGeo, m.armorMat);
  armL.position.set(-0.5, 0.6, 0);
  armR.position.set(0.5, 0.6, 0);
  g.add(armL, armR);

  const handGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const handL = new THREE.Mesh(handGeo, m.skinMat);
  const handR = new THREE.Mesh(handGeo, m.skinMat);
  handL.position.set(-0.5, 0.15, 0);
  handR.position.set(0.5, 0.15, 0);
  g.add(handL, handR);

  const staffShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2.0, 8),
    m.leatherMat,
  );
  staffShaft.position.set(0.75, 0.7, 0);
  g.add(staffShaft);

  const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 1), m.glowMat);
  orb.position.set(0.75, 1.75, 0);
  orb.userData.flicker = true;
  g.add(orb);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const prong = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6),
      m.metalMat,
    );
    prong.position.set(0.75 + Math.cos(a) * 0.08, 1.7, Math.sin(a) * 0.08);
    prong.rotation.z = -a * 0.3;
    g.add(prong);
  }

  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.4, 0.08),
    m.leatherMat,
  );
  book.position.set(-0.7, 0.5, 0.2);
  book.userData.float = true;
  g.add(book);

  const bookGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.3),
    m.glowMat,
  );
  bookGlow.position.set(-0.7, 0.5, 0.25);
  bookGlow.userData.float = true;
  g.add(bookGlow);

  for (let i = 0; i < 5; i++) {
    const rune = new THREE.Mesh(new THREE.TetrahedronGeometry(0.05), m.glowMat);
    const a = (i / 5) * Math.PI * 2;
    rune.position.set(
      Math.cos(a) * 0.7,
      1.0 + Math.sin(a) * 0.3,
      Math.sin(a) * 0.7,
    );
    rune.userData.orbit = true;
    rune.userData.angle = a;
    rune.userData.height = 1.0;
    rune.userData.radius = 0.7;
    g.add(rune);
  }

  const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.5), m.armorMat);
  cape.position.set(0, 0.5, -0.4);
  cape.rotation.x = -0.1;
  g.add(cape);
  g.scale.setScalar(scale);
}
