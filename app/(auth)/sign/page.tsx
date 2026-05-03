"use client";
import { DungeonCanvas } from "@/src/components/layouts/auth-layouts/DungeonCanvas";
import { SignInPage } from "@/src/components/layouts/auth-layouts/sign-in";
import { SignUpPage } from "@/src/components/layouts/auth-layouts/sign-up";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function SignPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}

const AuthContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: "#110d06" }}
    >
      <DungeonCanvas />

      {/* FIX: z-[1] bukan z-1 */}
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-10">
        {/* FIX: hapus opacity:0 — animate-fade-up sudah handle dari opacity 0 ke 1 */}
        <div className="text-center animate-fade-up">
          <h1
            className="font-cinzel font-bold tracking-[5px] select-none"
            style={{
              fontSize: "clamp(26px,5vw,36px)",
              color: "#e0a83a",
              textShadow:
                "0 0 40px rgba(224,168,58,0.7),0 0 80px rgba(224,168,58,0.3)",
            }}
          >
            DUNGEON n LIE
          </h1>
        </div>

        {/* FIX: hapus opacity:0 */}
        <div className="flex items-center gap-3 justify-center my-3 animate-fade-up">
          <div
            className="w-20 h-px"
            style={{
              background:
                "linear-gradient(to right,transparent,#a07828,transparent)",
            }}
          />
          <div
            className="w-2 h-2 rotate-45"
            style={{
              background: "#e0a83a",
              boxShadow: "0 0 10px rgba(224,168,58,0.8)",
            }}
          />
          <div
            className="w-20 h-px"
            style={{
              background:
                "linear-gradient(to right,transparent,#a07828,transparent)",
            }}
          />
        </div>

        {/* FIX: hapus opacity:0 */}
        <div
          key={searchParams.get("page")}
          className="animate-fade-up w-full flex justify-center"
        >
          {searchParams.get("page") === "signin" ? (
            <SignUpPage onSwitch={() => router.push("?page=signup")} />
          ) : (
            <SignInPage onSwitch={() => router.push("?page=signin")} />
          )}
        </div>

        <p
          className="mt-6 font-cinzel text-[11px] tracking-[8px] select-none animate-rune-flicker"
          style={{ color: "rgba(160,120,40,0.25)" }}
        >
          ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ
        </p>
      </div>
    </div>
  );
};
