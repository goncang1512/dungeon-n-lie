import { $Enums, prisma } from "@repo/db";
import { api } from "./api";
import { sendEmail } from "@repo/mail";
import { renderVerificationHTML } from "@repo/mail/template";

export const auth = {
  api: {
    ...api,
    verifyEmailOTP: async ({
      email,
      type,
    }: {
      email: string;
      type: $Enums.OtpType;
    }) => {
      return await api.emailOTP({
        email,
        type,
        sendVerificationOTP: async ({ email, otp, type }) => {
          if (type === "sign_in") {
            await sendEmail({
              to: email,
              subject: "Email Verification",
              html: await renderVerificationHTML({
                userName: email,
                verificationCode: otp,
              }),
            });
          } else if (type === "email_verification") {
            const user = await prisma.user.findFirst({
              where: {
                email,
              },
              select: {
                username: true,
              },
            });
            await sendEmail({
              to: email,
              subject: "Email Verification",
              html: await renderVerificationHTML({
                userName: user?.username,
                verificationCode: otp,
              }),
            });
          } else {
            console.log("Reset Password OTP:", { otp, email });
          }
        },
      });
    },

    checkVerificationOtp: async ({
      email,
      type,
      otp,
    }: {
      email: string;
      type: $Enums.OtpType;
      otp: string;
    }) => {
      const data = await prisma.otpVerification.findFirst({
        where: {
          identifier: email,
          type,
        },
        select: {
          otpCode: true,
          id: true,
          expiresAt: true,
        },
      });

      if (!data) {
        throw new Error("OTP not found");
      }

      if (data.expiresAt < new Date()) {
        await prisma.otpVerification.delete({
          where: {
            id: data.id,
          },
        });
        throw new Error("OTP sudah expired");
      }

      if (data.otpCode !== otp) {
        throw new Error("Code OTP Invalid");
      }

      await prisma.otpVerification.delete({
        where: {
          id: data.id,
        },
      });

      await prisma.user.update({
        where: {
          email,
        },
        data: {
          is_verified: true,
        },
      });
    },
  },
};
