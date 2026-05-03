import Pusher from "pusher";

export const pusher = new Pusher({
  appId: "2149652",
  key: process.env.NEXT_PUBLIC_KEY_PUSHER!,
  secret: process.env.NEXT_PUBLIC_SECRET_PUSHER!,
  cluster: "ap1",
  useTLS: true,
});
