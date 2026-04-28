// src/lib/auth.ts
import { type NextAuthOptions, type DefaultSession } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubToken?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
      params: {
        scope: 'read:user user:email repo',
    },
  },
}),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        
        // Fetch github token from Account table (OAuth tokens stored here)
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: 'github',
          },
        });
        
        if (account?.access_token) {
          session.user.githubToken = account.access_token;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};