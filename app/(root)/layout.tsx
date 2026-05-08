import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  const matchPath =
    pathname.startsWith("/waiting") || pathname.startsWith("/game");

  const { result } = await auth.api.getSession({
    headers: headerList,
  });

  if (!result?.session) {
    return redirect("/sign");
  }

  if (matchPath) {
    return <div>{children}</div>;
  }

  const match = await prisma.match.findFirst({
    where: {
      status: {
        in: ["waiting", "playing"],
      },
      matchUsers: {
        some: {
          userId: result.user.id,
        },
      },
    },
  });

  if (match) {
    if (match.status === "waiting") {
      return redirect(`/waiting/${match.room_id}`);
    }

    if (match.status === "playing") {
      return redirect(`/game/${match.room_id}`);
    }
  }

  return <div>{children}</div>;
}
