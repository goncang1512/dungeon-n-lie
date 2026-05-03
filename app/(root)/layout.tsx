import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { result } = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session) {
    return redirect("/sign");
  }

  return <div>{children}</div>;
}
