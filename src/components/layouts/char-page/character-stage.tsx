"use client";
import { DnDClass } from "@/src/types/classes";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildClassModel } from "./character-build/build-model";

interface StageProps {
  selectedClass: DnDClass;
}

const FOV = 45;
const FRAME_PADDING = 1.35; // sedikit lebih lega karena ada environment
const MIN_DISTANCE = 4.5; // jaga agar tidak terlalu dekat sampai pillar terlihat aneh
const MAX_DISTANCE = 9.0; // jaga agar tidak terlalu jauh

export function CharacterStage({ selectedClass }: StageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const torchLightRef = useRef<THREE.PointLight | null>(null);
  const auraDiscRef = useRef<THREE.Mesh | null>(null);

  // Auto-frame: hitung jarak kamera dari bounding box karakter
  const frameCharacter = (
    camera: THREE.PerspectiveCamera,
    group: THREE.Group,
    aura: THREE.Mesh | null,
    aspect: number,
  ) => {
    const box = new THREE.Box3().setFromObject(group);
    if (box.isEmpty()) return;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const charHeight = size.y * FRAME_PADDING;
    const charWidth = size.x * FRAME_PADDING;

    const fovRad = (FOV * Math.PI) / 180;
    const distForHeight = charHeight / 2 / Math.tan(fovRad / 2);
    const distForWidth = charWidth / 2 / Math.tan(fovRad / 2) / aspect;

    const rawDistance = Math.max(distForHeight, distForWidth);
    // Clamp agar tetap proporsional dengan environment
    const distance = Math.min(
      MAX_DISTANCE,
      Math.max(MIN_DISTANCE, rawDistance),
    );

    camera.position.set(0, center.y, distance);
    camera.lookAt(0, center.y, 0);

    if (aura) {
      aura.position.y = box.min.y + 0.02;
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

    const floorGeo = new THREE.PlaneGeometry(30, 30, 32, 32);
    const positions = floorGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, Math.random() * 0.06);
    }
    positions.needsUpdate = true;
    floorGeo.computeVertexNormals();
    const floor = new THREE.Mesh(
      floorGeo,
      new THREE.MeshStandardMaterial({
        color: 0x1a1410,
        roughness: 0.95,
        metalness: 0.1,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    scene.add(floor);

    for (let i = 0; i < 6; i++) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 6, 8),
        new THREE.MeshStandardMaterial({
          color: 0x15100c,
          roughness: 1,
          metalness: 0,
        }),
      );
      const a = (i / 6) * Math.PI * 2;
      pillar.position.set(Math.cos(a) * 5.5, 1.8, Math.sin(a) * 5.5);
      scene.add(pillar);
    }

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
      if (w === 0 || h === 0) return;

      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

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

    // Pantau perubahan ukuran container (parent layout, sidebar, dll)
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

    buildClassModel(characterGroupRef.current, selectedClass);

    // Re-frame setelah model di-build
    const aspect = container.clientWidth / container.clientHeight;
    frameCharacter(
      cameraRef.current,
      characterGroupRef.current,
      auraDiscRef.current,
      aspect,
    );

    if (auraDiscRef.current) {
      (auraDiscRef.current.material as THREE.MeshBasicMaterial).color.setHex(
        selectedClass.accentColor,
      );
    }
    if (sceneRef.current) {
      sceneRef.current.fog = new THREE.FogExp2(0x0a0604, 0.07);
    }
    if (torchLightRef.current) {
      torchLightRef.current.color.setHex(0xff8a3c);
    }
  }, [selectedClass]);

  return <div ref={containerRef} className="stage-canvas" />;
}
