import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { generateId } from "./lib/generate-id";
import { ApiResponse, SessionType, user_session_select } from "./types";
import { prisma } from "../prisma";
import { $Enums } from "@/generated/prisma/client";

const JWT_SECRET = process.env.NEXT_PUBLIC_MYSUPLAI_SECRET_KEY!;

export const api = {
  signUp: async ({
    email,
    password,
    username,
  }: {
    email: string;
    password: string;
    username: string;
  }) => {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: generateId(),
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    await prisma.session.create({
      data: {
        id: generateId(),
        user_id: user.id,
        token,
      },
    });

    return { user, token };
  },

  signIn: async ({ email, password }: { email: string; password: string }) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Email or Password Invalid");

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    await prisma.session.deleteMany({
      where: {
        user_id: user.id,
      },
    });

    await prisma.session.create({
      data: {
        id: generateId(),
        user_id: user.id,
        token,
      },
    });

    return { user, token };
  },

  getSession: async ({
    headers,
  }: {
    headers: Headers;
  }): Promise<ApiResponse<SessionType | null>> => {
    const cookieHeader = headers.get("cookie");

    if (!cookieHeader) {
      return {
        status: false,
        status_code: 403,
        message: "Invalid Credentials",
        result: null,
      };
    }

    // parse cookie manual
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, ...v] = c.split("=");
        return [key, v.join("=")];
      }),
    );

    const token = cookies["token"];

    if (!token) {
      return {
        status: false,
        status_code: 403,
        message: "Unauthorized: No token",
        result: null,
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const sessionData = await prisma.session.findUnique({
      where: { token },
    });

    if (!sessionData)
      return {
        status: false,
        status_code: 403,
        message: "Invalid Credentials",
        result: null,
      };

    const userData = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        ...user_session_select,
        sessions: {
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!userData) {
      throw new Error("User not found");
    }

    const { sessions, ...user } = userData;

    return {
      status: true,
      status_code: 200,
      message: "Success get credentials",
      result: {
        user,
        session: sessions[0],
      },
    };
  },

  signOut: async (token: string) => {
    await prisma.session.deleteMany({
      where: { token },
    });
  },

  emailOTP: async ({
    email,
    type,
    length = 6,
    sendVerificationOTP,
  }: {
    email: string;
    type: $Enums.OtpType;
    length?: number;
    sendVerificationOTP?: (params: {
      email: string;
      otp: string;
      type: $Enums.OtpType;
    }) => Promise<void> | void;
  }) => {
    // generate OTP (secure)
    const otp = randomInt(10 ** (length - 1), 10 ** length).toString();

    // simpan ke backend
    const data = await prisma.otpVerification.create({
      data: {
        id: generateId(),
        identifier: email,
        type,
        otpCode: otp,
        expiresAt: new Date(Date.now() + 60 * 1000),
      },
    });

    if (sendVerificationOTP)
      // callback (kaya plugin style)
      await sendVerificationOTP({
        email,
        otp,
        type,
      });

    return { identifier: data.id };
  },
};
