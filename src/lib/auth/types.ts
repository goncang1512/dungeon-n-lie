import { Prisma } from "@repo/db";

export type UserType = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    email: true;
    created_at: true;
    updated_at: true;
    is_verified: true;
    role: true;
  };
}>;

export type SessionInterface = Prisma.SessionGetPayload<{
  select: {
    id: true;
    created_at: true;
    updated_at: true;
    token: true;
    user_id: true;
  };
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
