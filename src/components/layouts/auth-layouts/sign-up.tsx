"use client";
import { useState } from "react";
import { Mail, Lock, User, ShieldCheck, Flame } from "lucide-react";
import { CardOrnament } from "./CardOrnament";
import { FieldGroup } from "./FieldGroup";
import { PasswordStrength } from "./PasswordStrength";
import { cn } from "@/src/lib/utils";
import { authClient } from "@/src/lib/auth/client";
import { useRouter } from "next/navigation";

interface Props {
  onSwitch: () => void;
}

export function SignUpPage({ onSwitch }: Props) {
  const router = useRouter();
  const [f, setF] = useState({
    username: "",
    email: "",
    pass: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  const set = (k: keyof typeof f) => (v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined as unknown as string }));
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!f.username || f.username.length < 3)
      e.username = "Name too short or already taken.";
    if (!f.email || !f.email.includes("@"))
      e.email = "A seal of this kind already exists.";
    if (!f.pass || f.pass.length < 6)
      e.pass = "The oath is too weak — forge a stronger one.";
    if (f.pass !== f.confirm) e.confirm = "The oaths do not match.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);

    await authClient.signUp({
      email: f.email,
      username: f.username,
      password: f.pass,
    });

    router.push("/sign?page=signin");
    setLoading(false);
    setOk(true);
    setTimeout(() => onSwitch(), 1600);
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
            ✦ Soul bound. Welcome, {f.username}.
          </p>
        </div>
      )}

      <p
        className="font-cinzel text-[8px] tracking-[3px] uppercase mb-5 select-none"
        style={{ color: "rgba(90,61,24,0.8)" }}
      >
        Etch your name into the stone
      </p>

      <div className="space-y-3.5">
        <FieldGroup
          id="su-u"
          label="Alias / War Name"
          icon={<User size={13} />}
          placeholder="e.g. ShadowMarker_VII"
          value={f.username}
          onChange={set("username")}
          error={errors.username}
          autoComplete="username"
        />
        <FieldGroup
          id="su-e"
          label="Electronic Seal"
          icon={<Mail size={13} />}
          type="email"
          placeholder="your.mark@realm.com"
          value={f.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
        />
        <FieldGroup
          id="su-p"
          label="Blood Oath"
          icon={<Lock size={13} />}
          type="password"
          placeholder="forge your secret oath"
          value={f.pass}
          onChange={set("pass")}
          error={errors.pass}
          autoComplete="new-password"
          extra={<PasswordStrength password={f.pass} />}
        />
        <FieldGroup
          id="su-c"
          label="Confirm Blood Oath"
          icon={<ShieldCheck size={13} />}
          type="password"
          placeholder="repeat your oath"
          value={f.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
          autoComplete="new-password"
        />
      </div>

      <div className="mt-5">
        <button
          onClick={submit}
          disabled={loading}
          className={cn(
            "dungeon-btn flex items-center justify-center gap-2.5",
            loading && "opacity-60 cursor-not-allowed",
          )}
          style={{ borderColor: "#e0a83a", color: "#e0a83a" }}
        >
          <Flame size={13} />
          {loading ? "Binding soul to vault..." : "Bind Your Soul"}
        </button>
      </div>

      <p
        className="mt-4 text-center font-crimson italic text-[12px]"
        style={{ color: "#4a3018" }}
      >
        Already marked?{" "}
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
          Enter the vault
        </button>
      </p>
    </div>
  );
}
