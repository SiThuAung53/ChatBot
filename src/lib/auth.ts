import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // Get team membership
        const membership = await prisma.teamMember.findFirst({
          where: { userId: user.id },
          include: { team: true },
        });

        if (membership) {
          session.user.teamId = membership.teamId;
          session.user.teamRole = membership.role;
        }
      }
      return session;
    },
    async signIn({ user }) {
      // Auto-create a team for new users
      const existingMembership = await prisma.teamMember.findFirst({
        where: { userId: user.id },
      });

      if (!existingMembership) {
        await prisma.team.create({
          data: {
            name: `${user.name || 'My'}'s Team`,
            members: {
              create: {
                userId: user.id,
                role: 'OWNER',
              },
            },
          },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
