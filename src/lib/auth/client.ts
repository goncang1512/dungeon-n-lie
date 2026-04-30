// lib/axios.ts
import { $Enums } from "@repo/db";
import axios from "axios";
import { createUseSession } from "./adapters/next/hooks/useSession";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // penting buat cookie (token)
});

type SignInPayload = {
  email: string;
  password: string;
  remember: boolean;
};

type SignUpPayload = {
  username: string;
  email: string;
  password: string;
};

export const authClient = {
  // ================= SIGN IN =================
  signIn: async (payload: SignInPayload) => {
    const res = await api.post("/auth/signin", payload);
    return res.data; // { user }
  },

  // ================= SIGN UP =================
  signUp: async (payload: SignUpPayload) => {
    const res = await api.post("/auth/signup", payload);
    return res.data; // { user }
  },

  // ================= SESSION =================
  useSession: createUseSession,

  // ================= SIGN OUT =================
  signOut: async (options?: {
    onRequest?: (data: any) => void;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  }) => {
    options?.onRequest?.(null);

    try {
      const res = await api.delete("/auth/signout");

      // callback success
      options?.onSuccess?.(res.data);

      return res.data;
    } catch (error) {
      // callback error
      options?.onError?.(error);

      throw error;
    }
  },

  // ================= SEND VERIFICATION OTP =================
  sendVerificationOtp: async (
    body: { email: string; type: $Enums.OtpType },
    options?: {
      onRequest?: (data: any) => void;
      onSuccess?: (data: any) => void;
      onError?: (error: any) => void;
    },
  ) => {
    options?.onRequest?.(null);

    try {
      const res = await api.post("/auth/createotp", {
        email: body.email,
        type: body.type,
      });

      // callback success
      options?.onSuccess?.(res.data);

      return res.data;
    } catch (error) {
      // callback error
      options?.onError?.(error);

      throw error;
    }
  },

  // ================= CHECK OTP =================
  checkOTP: async (
    body: {
      email: string;
      type: $Enums.OtpType;
      otp: string;
    },
    options?: {
      onRequest?: (data: any) => void;
      onSuccess?: (data: any) => void;
      onError?: (error: any) => void;
    },
  ) => {
    options?.onRequest?.(null);

    try {
      const res = await api.post("/auth/checkotp", {
        email: body.email,
        type: body.type,
        otp: body.otp,
      });

      // callback success
      options?.onSuccess?.(res.data);

      return res.data;
    } catch (error) {
      // callback error
      options?.onError?.(error);

      throw error;
    }
  },
};
