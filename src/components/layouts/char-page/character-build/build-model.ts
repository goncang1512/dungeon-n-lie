import { CLASSES, DnDClass } from "@/src/types/classes";
import * as THREE from "three";
import { Mats } from "../selection";

function disposeGroup(group: THREE.Group) {
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
    if ((child as THREE.Mesh).geometry)
      (child as THREE.Mesh).geometry.dispose();
    const mat = (child as THREE.Mesh).material;
    if (mat) {
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
  }
}

export function buildClassModel(
  group: THREE.Group,
  cls: DnDClass,
  scale: number = 1,
) {
  disposeGroup(group);

  const baseColor = cls.color;
  const accentColor = cls.accentColor;

  const m: Mats = {
    skinMat: new THREE.MeshStandardMaterial({
      color: 0x3a2818,
      metalness: 0.1,
      roughness: 0.95,
    }),
    armorMat: new THREE.MeshStandardMaterial({
      color: baseColor,
      metalness: 0.75,
      roughness: 0.35,
      emissive: baseColor,
      emissiveIntensity: 0.1,
    }),
    clothMat: new THREE.MeshStandardMaterial({
      color: 0x1a1208,
      metalness: 0.1,
      roughness: 0.95,
    }),
    leatherMat: new THREE.MeshStandardMaterial({
      color: 0x2a1c10,
      metalness: 0.2,
      roughness: 0.9,
    }),
    glowMat: new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 1.6,
      metalness: 0,
      roughness: 1,
    }),
    metalMat: new THREE.MeshStandardMaterial({
      color: 0x6a5a4a,
      metalness: 0.9,
      roughness: 0.3,
    }),
    goldMat: new THREE.MeshStandardMaterial({
      color: 0xd4a857,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0x402810,
      emissiveIntensity: 0.2,
    }),
  };

  const currentClass = CLASSES.find((c) => c.id === cls.id);

  currentClass?.build(group, m, scale);

  const runeRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.025, 8, 64),
    m.glowMat,
  );
  runeRing.rotation.x = Math.PI / 2;
  runeRing.position.y = -1.15;
  runeRing.userData.spin = true;
  group.add(runeRing);

  const innerRune = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.015, 6, 32),
    m.glowMat,
  );
  innerRune.rotation.x = Math.PI / 2;
  innerRune.position.y = -1.14;
  innerRune.userData.spinReverse = true;
  group.add(innerRune);
}
