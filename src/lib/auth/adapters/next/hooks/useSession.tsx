/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
// hooks/useSession.ts
"use client";

import { useEffect, useState } from "react";
import { api } from "../../../client";
import { Prisma } from "@/generated/prisma/client";

type SessionType = {
  session: Prisma.SessionGetPayload<{
    select: {
      id: true;
      token: true;
      created_at: true;
      updated_at: true;
      user_id: true;
    };
  }>;
  user: Prisma.UserGetPayload<{
    select: {
      id: true;
      username: true;
      email: true;
      is_verified: true;
      updated_at: true;
      created_at: true;
      role: true;
    };
  }>;
};

export const createUseSession = () => {
  const [data, setData] = useState<SessionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/session");
      setData(res.data?.data.result ?? null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setData(null);
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchSession, // biar bisa manual refresh
  };
};
