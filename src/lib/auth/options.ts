import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { ensureAppUserLink } from "@/lib/auth/app-user";

function getGoogleClientId() {
  return process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "";
}

function getGoogleClientSecret() {
  return process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleClientId(),
      clientSecret: getGoogleClientSecret(),
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user?.id) {
        const link = await ensureAppUserLink({
          authUserId: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        });

        session.user.id = link.appUserId;
      }

      return session;
    },
  },
};
