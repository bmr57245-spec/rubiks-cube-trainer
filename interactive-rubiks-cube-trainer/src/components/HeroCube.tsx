"use client";

import { useEffect } from "react";
import { Cube3D } from "./Cube3D";
import { useCube } from "@/hooks/useCube";

const POOL = ["R", "U", "R'", "U'", "F", "L", "D", "B'", "U2", "R2", "F'", "L'"];

export function HeroCube({ size = 300 }: { size?: number }) {
  const { cube, anim, move } = useCube();
  useEffect(() => {
    const id = setInterval(() => {
      move(POOL[Math.floor(Math.random() * POOL.length)], 420);
    }, 1100);
    return () => clearInterval(id);
  }, [move]);
  return (
    <div className="floaty relative flex justify-center">
      <div className="absolute inset-0 -z-10 m-auto h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl" />
      <Cube3D cube={cube} anim={anim} size={size} autoRotate interactive={false} />
    </div>
  );
}
