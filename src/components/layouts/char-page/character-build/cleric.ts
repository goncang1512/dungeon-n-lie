import * as THREE from "three";
import { Mats } from "../selection";

export function buildCleric(g: THREE.Group, m: Mats, scale: number = 1) {
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), m.skinMat);
  head.position.y = 1.5;
  g.add(head);

  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.7),
    m.armorMat,
  );
  hood.position.y = 1.55;
  g.add(hood);

  const cowl = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.025, 6, 24, Math.PI * 1.3),
    m.goldMat,
  );
  cowl.position.y = 1.5;
  cowl.rotation.x = -0.3;
  g.add(cowl);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), m.glowMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), m.glowMat);
  eyeL.position.set(-0.09, 1.52, 0.27);
  eyeR.position.set(0.09, 1.52, 0.27);
  g.add(eyeL, eyeR);

  const robe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 1.5, 12),
    m.armorMat,
  );
  robe.position.y = 0.4;
  g.add(robe);

  const trim1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.02, 6, 32),
    m.goldMat,
  );
  trim1.rotation.x = Math.PI / 2;
  trim1.position.y = -0.35;
  g.add(trim1);

  const trim2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.02, 6, 32),
    m.goldMat,
  );
  trim2.rotation.x = Math.PI / 2;
  trim2.position.y = 0.2;
  g.add(trim2);

  const symbolBase = new THREE.Mesh(
    new THREE.CircleGeometry(0.13, 8),
    m.goldMat,
  );
  symbolBase.position.set(0, 0.85, 0.42);
  g.add(symbolBase);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const ray = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.16, 0.015),
      m.glowMat,
    );
    ray.position.set(Math.cos(a) * 0.05, 0.85 + Math.sin(a) * 0.05, 0.43);
    ray.rotation.z = a;
    g.add(ray);
  }

  const symbolCenter = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    m.glowMat,
  );
  symbolCenter.position.set(0, 0.85, 0.44);
  symbolCenter.userData.flicker = true;
  g.add(symbolCenter);

  const shoulderGeo = new THREE.SphereGeometry(0.16, 10, 10);
  const sL = new THREE.Mesh(shoulderGeo, m.armorMat);
  const sR = new THREE.Mesh(shoulderGeo, m.armorMat);
  sL.position.set(-0.5, 1.15, 0);
  sR.position.set(0.5, 1.15, 0);
  g.add(sL, sR);

  const armGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.85, 8);
  const armL = new THREE.Mesh(armGeo, m.armorMat);
  const armR = new THREE.Mesh(armGeo, m.armorMat);
  armL.position.set(-0.55, 0.6, 0);
  armR.position.set(0.55, 0.6, 0);
  g.add(armL, armR);

  const handGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const handL = new THREE.Mesh(handGeo, m.skinMat);
  handL.position.set(-0.55, 0.1, 0);
  const handR = new THREE.Mesh(handGeo, m.skinMat);
  handR.position.set(0.55, 0.1, 0);
  g.add(handL, handR);

  const maceHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8),
    m.leatherMat,
  );
  maceHandle.position.set(0.7, 0.4, 0);
  g.add(maceHandle);

  const maceHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    m.goldMat,
  );
  maceHead.position.set(0.7, 0.85, 0);
  g.add(maceHead);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const flange = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.04),
      m.goldMat,
    );
    flange.position.set(0.7 + Math.cos(a) * 0.1, 0.85, Math.sin(a) * 0.1);
    flange.rotation.y = a;
    g.add(flange);
  }

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.015, 6, 32),
    m.glowMat,
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 1.85;
  halo.userData.spin = true;
  g.add(halo);

  for (let i = 0; i < 3; i++) {
    const mote = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      m.glowMat,
    );
    const a = (i / 3) * Math.PI * 2;
    mote.position.set(Math.cos(a) * 0.85, 1.0, Math.sin(a) * 0.85);
    mote.userData.orbit = true;
    mote.userData.angle = a;
    mote.userData.height = 1.0;
    mote.userData.radius = 0.85;
    g.add(mote);
  }

  const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.5), m.armorMat);
  cape.position.set(0, 0.5, -0.4);
  cape.rotation.x = -0.1;
  g.add(cape);
  g.scale.setScalar(scale);
}
