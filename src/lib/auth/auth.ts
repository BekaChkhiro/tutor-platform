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
      suspended: boolean;
      onboardingComplete: boolean;
    } & Omit<NonNullable<import('next-auth').DefaultSession['user']>, 'id'>;
  }

  interface User {
    role: UserRole;
    suspended: boolean;
    tutorStatus: TutorStatus | null;
  }
}

interface AppJWT {
  id?: string;
  role?: UserRole;
  tutorStatus?: TutorStatus | null;
  profileComplete?: boolean;
  suspended?: boolean;
  onboardingComplete?: boolean;
}

// JWT strategy is required because Credentials provider is incompatible
// with database sessions in Auth.js v5.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: { strategy: 'jwt' },

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
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') {
        return !user.suspended;
      }

      if (!user.email) return true;

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { suspended: true },
      });

      return !dbUser?.suspended;
    },

    // T1.2.11 — Enrich JWT with the user id at sign-in, then refresh role /
    // status / suspended on every request so DB changes (suspensions,
    // tutor approvals, profile completion) take effect without re-login.
    async jwt({ token, user }) {
      const t = token as AppJWT;

      if (user?.id) {
        t.id = user.id;
      }

      if (t.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: t.id },
          include: { tutor: { select: { status: true, onboardingComplete: true } } },
        });

        if (dbUser) {
          t.role = dbUser.role;
          t.tutorStatus = dbUser.tutor?.status ?? null;
          t.profileComplete = !!(dbUser.phone && dbUser.dob);
          t.suspended = dbUser.suspended;
          t.onboardingComplete = dbUser.tutor?.onboardingComplete ?? false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      const t = token as AppJWT;

      if (t.id) session.user.id = t.id;
      session.user.role = t.role ?? 'USER';
      session.user.tutorStatus = t.tutorStatus ?? null;
      session.user.profileComplete = t.profileComplete ?? false;
      session.user.suspended = t.suspended ?? false;
      session.user.onboardingComplete = t.onboardingComplete ?? false;

      return session;
    },
  },
});
