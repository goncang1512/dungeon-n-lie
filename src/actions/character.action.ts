"use server";

import { $Enums } from "@/generated/prisma/client";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export const selectCharacter = async (
  charClass: $Enums.CharUser,
  user_id: string,
) => {
  const result = await prisma.user.update({
    where: {
      id: user_id,
    },
    data: {
      character: charClass,
    },
  });

  revalidatePath("/");
  revalidatePath("/character");
  return result;
};
