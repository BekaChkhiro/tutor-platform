import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import type { UserRole, TutorStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      tutorStatus: TutorStatus | null;
      profileComplete: boolean;
    } & Omit<import('next-auth').DefaultSession['user'], 'id'>;
  }

  interface User {
    role: UserRole;
    suspended: boolean;
    tutorStatus: TutorStatus | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: { strategy: 'database' },

  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },

  providers: [
    // T1.2.7 — Google OAuth provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    // T1.2.8 — Credentials provider with bcrypt password verify
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      // T1.2.9 — Lookup user, verify password, enforce emailVerified
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = typeof credentials.email === 'string' ? credentials.email : '';
        const password = typeof credentials.password === 'string' ? credentials.password : '';

        const user = await prisma.user.findUnique({
          where: { email },
          include: { tutor: { select: { status: true } } },
        });

        if (!user || !user.passwordHash) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null,
          image: user.image,
          role: user.role,
          suspended: user.suspended,
          tutorStatus: user.tutor?.status ?? null,
        };
      },
    }),
  ],

  callbacks: {
    // T1.2.10 — Reject suspended users on any provider
    async signIn({ user }) {
      if (user.suspended) return false;
      return true;
    },

    // T1.2.11 — Enrich session with role + tutorStatus
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { tutor: { select: { status: true } } },
      });

      session.user.id = user.id;
      session.user.role = dbUser?.role ?? 'USER';
      session.user.tutorStatus = dbUser?.tutor?.status ?? null;
      session.user.profileComplete = !!(dbUser?.phone && dbUser?.dob);

      if (dbUser?.suspended) {
        throw new Error('Account suspended');
      }

      return session;
    },
  },
});
