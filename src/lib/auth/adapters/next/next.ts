import { NextRequest, NextResponse } from "next/server";
import { nextHandler } from "./next-handler";
import { auth as AuthType } from "../../server";

type RouteHandler = (
  req: NextRequest,
  ctx: { params: Promise<{ slug: string[] }> },
) => Promise<NextResponse>;

export const createNextHandler = (auth: typeof AuthType) => {
  const handler: RouteHandler = async (
    req: NextRequest,
    ctx: { params: Promise<{ slug: string[] }> },
  ) => {
    const params = await ctx.params;
    return nextHandler(req, auth, params);
  };

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    DELETE: handler,
  };
};
