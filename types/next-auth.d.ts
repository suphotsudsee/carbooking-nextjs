import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      fullName: string;
      role: "admin" | "approver" | "user";
      department?: string | null;
      position?: string | null;
    } & DefaultSession["user"];
  }
}
