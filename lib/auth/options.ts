import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/db/client";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (!user || user.status !== "active") return null;

        const ok = await compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: String(user.id),
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
          position: user.position,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as {
          id: string;
          fullName: string;
          role: "admin" | "approver" | "user";
          department?: string | null;
          position?: string | null;
        };
        token.id = Number(typedUser.id);
        token.fullName = typedUser.fullName;
        token.role = typedUser.role;
        token.department = typedUser.department;
        token.position = typedUser.position;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...(session.user || {}),
        id: token.id as number,
        fullName: (token.fullName as string) || session.user?.name || "",
        role: (token.role as "admin" | "approver" | "user") || "user",
        department: (token.department as string | null | undefined) ?? null,
        position: (token.position as string | null | undefined) ?? null,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
