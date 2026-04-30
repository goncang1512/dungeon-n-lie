import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth as AuthType } from "../../server";
import { $Enums } from "@repo/db";

type Action =
  | "signin"
  | "signup"
  | "signout"
  | "session"
  | "createotp"
  | "checkotp";

const methodMap: Record<Action, string[]> = {
  signin: ["POST"],
  signup: ["POST"],
  signout: ["DELETE"],
  session: ["GET"],
  createotp: ["POST"],
  checkotp: ["POST"],
};

export const nextHandler = async (
  req: NextRequest,
  auth: typeof AuthType,
  params: { slug?: string[] },
) => {
  try {
    const action = params.slug?.[0] as Action;

    if (!action || !methodMap[action]) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    if (!methodMap[action].includes(req.method)) {
      return NextResponse.json(
        { message: "Method not allowed" },
        { status: 405 },
      );
    }

    // ================= SIGN IN =================
    if (action === "signin") {
      const body = (await req.json()) as {
        email: string;
        password: string;
        remember: boolean;
      };
      const { user, token } = await auth.api.signIn(body);

      const res = NextResponse.json({ user });

      res.cookies.set("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        ...(body.remember && {
          maxAge: 60 * 60 * 24 * 7,
        }),
        path: "/",
      });

      return res;
    }

    // ================= SIGN UP =================
    if (action === "signup") {
      const body = (await req.json()) as {
        username: string;
        email: string;
        password: string;
      };
      const { user } = await auth.api.signUp(body);

      const res = NextResponse.json({ user });

      // res.cookies.set("token", token, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "strict",
      //   path: "/",
      // });

      return res;
    }

    // ================= SESSION =================
    if (action === "session") {
      const cookieStore = cookies();
      const token = (await cookieStore).get("token")?.value;

      if (!token) {
        return NextResponse.json({ data: null }, { status: 401 });
      }

      const data = await auth.api.getSession({
        headers: req.headers,
      });

      return NextResponse.json({ data: data });
    }

    // ================= SIGN OUT =================
    if (action === "signout") {
      const cookieStore = cookies();
      const token = (await cookieStore).get("token")?.value;

      if (token) {
        await auth.api.signOut(token);
      }

      const res = NextResponse.json({ message: "Logged out" });

      res.cookies.set("token", "", {
        expires: new Date(0),
        path: "/",
      });

      return res;
    }

    if (action === "createotp") {
      const body = (await req.json()) as {
        email: string;
        type: $Enums.OtpType;
      };

      const res = await auth.api.verifyEmailOTP({
        email: body.email,
        type: body.type,
      });

      return NextResponse.json({ data: res });
    }

    if (action === "checkotp") {
      const body = (await req.json()) as {
        email: string;
        type: $Enums.OtpType;
        otp: string;
      };

      await auth.api.checkVerificationOtp({
        email: body.email,
        type: body.type,
        otp: body.otp,
      });

      return NextResponse.json({
        data: {
          message: "Success verification email",
        },
      });
    }

    return NextResponse.json({ message: "Unhandled action" }, { status: 400 });
  } catch (error: any) {
    const isAuthError =
      error.message === "User not found" ||
      error.message === "Email or Password Invalid";

    return NextResponse.json(
      { message: error.message },
      { status: isAuthError ? 401 : 500 }, // ✅ fix
    );
  }
};
