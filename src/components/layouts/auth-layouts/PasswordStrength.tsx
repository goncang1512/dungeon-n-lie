import { cn } from "@/src/lib/utils";
import { useMemo } from "react";

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = useMemo(() => {
    if (!password) return { score: 0, label: "" };
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    const labels = [
      "",
      "Fragile oath",
      "Adequate oath",
      "Sturdy oath",
      "Unbreakable oath",
    ];
    return { score: s, label: labels[s] ?? "" };
  }, [password]);
  if (!password) return null;
  const colors = [
    "",
    "bg-[#c03030]",
    "bg-yellow-700",
    "bg-yellow-500",
    "bg-[#3a8840]",
  ];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-0.75">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-sm transition-all duration-300",
              i <= score ? colors[score] : "bg-dungeon-stone",
            )}
          />
        ))}
      </div>
      {label && (
        <p className="text-[10px] font-crimson italic text-[#8a6030]">
          {label}
        </p>
      )}
    </div>
  );
}
