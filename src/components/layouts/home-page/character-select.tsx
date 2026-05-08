"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildClassModel } from "../char-page/character-build/build-model";
import { $Enums } from "@/generated/prisma/client";
import { CLASSES, DnDClass } from "@/src/types/classes";

const CHAR_SCALE = 1.5;
const FOV = 45;
const FRAME_PADDING = 1.25; // 1.0 = pas, >1 = ada ruang di atas/bawah

export default function CharacterSelect({
  selectedClass,
}: {
  selectedClass: $Enums.CharUser;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const torchLightRef = useRef<THREE.PointLight | null>(null);
  const auraDiscRef = useRef<THREE.Mesh | null>(null);

  // Hitung jarak kamera supaya seluruh tinggi karakter masuk frame
  const frameCharacter = (
    camera: THREE.PerspectiveCamera,
    group: THREE.Group,
    aura: THREE.Mesh | null,
    aspect: number,
  ) => {
    // Bounding box seluruh karakter
    const box = new THREE.Box3().setFromObject(group);
    if (box.isEmpty()) return;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const charHeight = size.y * FRAME_PADDING;
    const charWidth = size.x * FRAME_PADDING;

    // Jarak yang dibutuhkan agar tinggi muat secara vertikal
    const fovRad = (FOV * Math.PI) / 180;
    const distForHeight = charHeight / 2 / Math.tan(fovRad / 2);

    // Jarak yang dibutuhkan agar lebar muat secara horizontal
    // (penting untuk container sempit / portrait)
    const distForWidth = charWidth / 2 / Math.tan(fovRad / 2) / aspect;

    const distance = Math.max(distForHeight, distForWidth);

    camera.position.set(0, center.y, distance);
    camera.lookAt(0, center.y, 0);

    // Tempelkan aura disc ke kaki karakter
    if (aura) {
      aura.position.y = box.min.y + 0.02; // sedikit di atas titik terbawah
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0604, 0.07);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      FOV,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    cameraRef.current = camera;

    const ambient = new THREE.AmbientLight(0x2a1810, 0.45);
    scene.add(ambient);

    const torchLight = new THREE.PointLight(0xff8a3c, 2.2, 12);
    torchLight.position.set(2.5, 2.5, 2);
    scene.add(torchLight);
    torchLightRef.current = torchLight;

    const moonLight = new THREE.PointLight(0x4a6fa8, 0.6, 10);
    moonLight.position.set(-3, 3, -2);
    scene.add(moonLight);

    const topFill = new THREE.DirectionalLight(0xfff0d0, 0.12);
    topFill.position.set(0, 6, 2);
    scene.add(topFill);

    const auraDisc = new THREE.Mesh(
      new THREE.RingGeometry(1.0, 1.1, 64),
      new THREE.MeshBasicMaterial({
        color: 0xff8a3c,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      }),
    );
    auraDisc.rotation.x = -Math.PI / 2;
    auraDisc.position.y = -1.18;
    scene.add(auraDisc);
    auraDiscRef.current = auraDisc;

    const pCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 1] = Math.random() * 5 - 1;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0xffaa66,
        size: 0.025,
        transparent: true,
        opacity: 0.4,
      }),
    );
    scene.add(particles);

    const charGroup = new THREE.Group();
    scene.add(charGroup);
    characterGroupRef.current = charGroup;

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // Re-frame setiap kali ukuran berubah
      if (characterGroupRef.current) {
        frameCharacter(
          camera,
          characterGroupRef.current,
          auraDiscRef.current,
          w / h,
        );
      }
    };
    window.addEventListener("resize", handleResize);

    // Observer untuk perubahan ukuran container (bukan cuma window)
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      charGroup.rotation.y = Math.sin(t * 0.3) * 0.4;
      charGroup.position.y = Math.sin(t * 1.2) * 0.04;

      charGroup.children.forEach((child) => {
        const ud = child.userData;
        if (ud.spin) child.rotation.z = t * 0.5;
        if (ud.spinReverse) child.rotation.z = -t * 0.7;
        if (ud.float) {
          if (ud.baseY === undefined) ud.baseY = child.position.y;
          child.position.y = ud.baseY + Math.sin(t * 2) * 0.08;
        }
        if (ud.flicker) {
          const s = 1 + Math.sin(t * 15) * 0.15 + Math.random() * 0.05;
          child.scale.set(s, s, s);
        }
        if (ud.orbit) {
          const a = ud.angle + t * 0.6;
          const r = ud.radius ?? 0.95;
          child.position.x = Math.cos(a) * r;
          child.position.z = Math.sin(a) * r;
          child.position.y = ud.height + Math.sin(t * 2 + ud.angle) * 0.15;
          child.rotation.x = t * 1.2;
          child.rotation.y = t * 0.9;
        }
      });

      if (torchLightRef.current) {
        torchLightRef.current.intensity =
          2.0 + Math.sin(t * 12) * 0.3 + Math.random() * 0.4;
      }

      particles.rotation.y = t * 0.03;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!characterGroupRef.current || !cameraRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const currentClass = CLASSES.find(
      (item) => item.id === selectedClass,
    ) as DnDClass;

    buildClassModel(characterGroupRef.current, currentClass, CHAR_SCALE);

    // Frame ulang setelah model baru di-build
    const aspect = container.clientWidth / container.clientHeight;
    frameCharacter(
      cameraRef.current,
      characterGroupRef.current,
      auraDiscRef.current,
      aspect,
    );

    if (auraDiscRef.current) {
      (auraDiscRef.current.material as THREE.MeshBasicMaterial).color.setHex(
        currentClass.accentColor,
      );
    }
    if (sceneRef.current) {
      sceneRef.current.fog = new THREE.FogExp2(0x0a0604, 0.07);
    }
    if (torchLightRef.current) {
      torchLightRef.current.color.setHex(0xff8a3c);
    }
  }, [selectedClass]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0 top-1/2 -translate-y-1/2"
    />
  );
}
