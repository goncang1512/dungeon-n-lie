import { Prisma } from "@/generated/prisma/client";

export const user_session_select = {
  id: true,
  username: true,
  email: true,
  created_at: true,
  updated_at: true,
  is_verified: true,
  character: true,
} satisfies Prisma.UserSelect;

export const session_selection = {
  id: true,
  created_at: true,
  updated_at: true,
  token: true,
  user_id: true,
} satisfies Prisma.SessionSelect;

export type UserType = Prisma.UserGetPayload<{
  select: typeof user_session_select;
}>;

export type SessionInterface = Prisma.SessionGetPayload<{
  select: typeof session_selection;
}>;

export type SessionType = {
  user: UserType;
  session: SessionInterface;
};

export type ApiResponse<T> = {
  status: boolean;
  status_code: number;
  message: string;
  result: T;
};
