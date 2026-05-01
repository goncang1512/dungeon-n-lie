"use client";
import { type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface FieldGroupProps {
  id: string;
  label: string;
  icon: ReactNode;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  extra?: ReactNode;
  autoComplete?: string;
}

export function FieldGroup({
  id,
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  extra,
  autoComplete,
}: FieldGroupProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-cinzel text-[8px] tracking-[2.5px] uppercase"
        style={{ color: "#a07828" }}
      >
        {label}
      </label>

      <div className="relative flex items-center">
        <span
          className="absolute left-2.5 pointer-events-none flex items-center"
          style={{ color: "rgba(224,168,58,0.4)" }}
        >
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={cn(
            "dungeon-input",
            error && "border-[rgba(192,48,48,0.5)]!",
          )}
        />
      </div>

      {error && (
        <p
          className="text-[11px] font-crimson italic"
          style={{ color: "rgba(192,48,48,0.9)" }}
        >
          {error}
        </p>
      )}
      {extra}
    </div>
  );
}
