import { useDungeonScene } from "@/src/hooks/useDungeonScene";
import { useRef } from "react";

export function DungeonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useDungeonScene(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
