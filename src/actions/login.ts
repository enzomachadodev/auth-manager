"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { getUserByEmail } from "@/data/user";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/lib/tokens";
import { sendTwoFactorEmail, sendVerificationEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { prisma } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

export const login = async (
  data: z.infer<typeof loginSchema>,
  callbackUrl: string | null,
) => {
  const validatedFields = loginSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const user = await getUserByEmail(email);

  if (!user || !user.email || !user.passwordHash) {
    return { error: "Invalid credentials!" };
  }

  if (!user.emailVerified) {
    const verificationToken = await generateVerificationToken(user.email);

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return { success: "Confirmation email sent" };
  }

  if (user.isTwoFactorEnabled && user.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(user.email);

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      if (new Date(twoFactorToken.expires) < new Date()) {
        return { error: "Code expired!" };
      }

      await prisma.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        user.id,
      );

      if (existingConfirmation) {
        await prisma.twoFactorConfirmation.delete({
          where: {
            id: existingConfirmation.id,
          },
        });
      }

      await prisma.twoFactorConfirmation.create({
        data: { userId: user.id },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(user.email);

      await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
};
