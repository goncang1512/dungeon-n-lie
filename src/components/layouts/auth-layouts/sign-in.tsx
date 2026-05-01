"use client";
import { useState } from "react";
import { Mail, Lock, Swords } from "lucide-react";
import { CardOrnament } from "./CardOrnament";
import { FieldGroup } from "./FieldGroup";
import { cn } from "@/src/lib/utils";
import { authClient } from "@/src/lib/auth/client";
import { useRouter } from "next/navigation";

interface Props {
  onSwitch: () => void;
}

export function SignInPage({ onSwitch }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errors, setErrors] = useState<{ email?: string; pass?: string }>({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  const submit = async () => {
    const e: typeof errors = {};
    if (!email || !email.includes("@")) e.email = "The seal is unrecognized.";
    if (!pass || pass.length < 4) e.pass = "The blood oath is incorrect.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);

    try {
      await authClient.signIn({
        email: email,
        password: pass,
        remember: true,
      });

      router.push("/");
      setOk(true);
    } catch (error) {
      console.log({ error });
    }
    setLoading(false);
  };

  return (
    <div className="dungeon-card p-7 w-full max-w-97.5 animate-fade-up">
      <CardOrnament />

      {ok && (
        <div
          className="mb-5 px-3 py-2.5 rounded-sm animate-fade-up"
          style={{
            border: "1px solid rgba(58,136,64,0.5)",
            background: "rgba(58,136,64,0.1)",
          }}
        >
          <p
            className="font-cinzel text-[9px] tracking-[2px] text-center"
            style={{ color: "#4ade80" }}
          >
            ✦ Identity confirmed. Entering the facility...
          </p>
        </div>
      )}

      <p
        className="font-cinzel text-[8px] tracking-[3px] uppercase mb-5 select-none"
        style={{ color: "rgba(90,61,24,0.8)" }}
      >
        Identify yourself, wanderer
      </p>

      <div className="space-y-4">
        <FieldGroup
          id="si-e"
          label="Electronic Seal"
          icon={<Mail size={13} />}
          type="email"
          placeholder="your.mark@realm.com"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setErrors((p) => ({ ...p, email: undefined }));
          }}
          error={errors.email}
          autoComplete="email"
        />
        <FieldGroup
          id="si-p"
          label="Blood Oath"
          icon={<Lock size={13} />}
          type="password"
          placeholder="speak your secret word"
          value={pass}
          onChange={(v) => {
            setPass(v);
            setErrors((p) => ({ ...p, pass: undefined }));
          }}
          error={errors.pass}
          autoComplete="current-password"
        />
      </div>

      <div className="flex justify-end mt-1.5 mb-5">
        <button
          onClick={() => alert("A raven flies to your sealed address.")}
          className="font-crimson italic text-[11px] transition-colors"
          style={{ color: "#4a3018" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#8a6030")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4a3018")}
        >
          Forgotten your oath?
        </button>
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className={cn(
          "dungeon-btn flex items-center justify-center gap-2.5",
          loading && "opacity-60 cursor-not-allowed",
        )}
        style={{ borderColor: "#e0a83a", color: "#e0a83a" }}
      >
        <Swords size={13} />
        {loading ? "Verifying identity..." : "Enter the Vault"}
      </button>

      <p
        className="mt-4 text-center font-crimson italic text-[12px]"
        style={{ color: "#4a3018" }}
      >
        No identity yet?{" "}
        <button
          onClick={onSwitch}
          className="font-crimson italic transition-colors cursor-pointer"
          style={{ color: "#8a6030", borderBottom: "1px solid #3a2810" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#d4a04a";
            e.currentTarget.style.borderBottomColor = "#a07828";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#8a6030";
            e.currentTarget.style.borderBottomColor = "#3a2810";
          }}
        >
          Register your mark
        </button>
      </p>
    </div>
  );
}
