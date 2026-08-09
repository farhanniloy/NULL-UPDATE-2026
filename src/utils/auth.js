import { PrismaAdapter } from "@auth/prisma-adapter";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./connect";
import { getServerSession } from "next-auth";
import bcrypt from 'bcryptjs';

export const authOptions = {
    debug: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        // Credentials provider for local email/password login
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                console.log('[auth] authorize called', { credentialsPresent: !!credentials });
                if (!credentials) return null;
                const { email, password } = credentials;
                console.log('[auth] looking up user', email);
                const user = await prisma.user.findUnique({ where: { email } });
                console.log('[auth] user found?', !!user);
                if (!user || !user.password) return null;
                const valid = await bcrypt.compare(password, user.password);
                console.log('[auth] password valid?', valid);
                if (!valid) return null;
                // return user object used by NextAuth, include role and username
                console.log('[auth] authorize success for', email);
                return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, username: user.username };
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        GoogleProvider({
            clientId:process.env.GOOGLE_CLIENT_ID??"",
            clientSecret:process.env.GOOGLE_CLIENT_SECRET??"",
        }),
    ],
    session: {
        // Use JWT session strategy to avoid DB session creation issues in local dev
        strategy: 'jwt'
    },
    jwt: {
        // keep defaults; NextAuth will use NEXTAUTH_SECRET
    },

    // Callbacks for additional debug visibility and to ensure session contains user info
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            try {
                console.log('[auth callback] signIn', { user: !!user, account: !!account, email: !!email });
            } catch (e) {
                console.error('[auth callback] signIn error', e);
            }
            return true;
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            // when user is returned from authorize, attach to token for session
            if (user) {
                console.log('[auth callback] jwt - attaching user to token', { user: user?.email ?? user?.id });
                token.sub = user.id;
                token.email = user.email;
                token.name = user.name;
                token.image = user.image;
                token.role = user.role;
                token.username = user.username;
            } else if (token && token.email) {
                // Always refresh role and username from DB to reflect changes immediately
                try {
                    const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.username = dbUser.username;
                        // keep other fields if present
                        token.name = dbUser.name || token.name;
                        token.image = dbUser.image || token.image;
                    }
                } catch (e) {
                    console.warn('[auth callback] jwt - could not fetch user', e);
                }
            }
            return token;
        },

        async session({ session, token }) {
            // ensure session.user exists
            if (!session.user) {
                session.user = {};
            }
            // expose token fields on the session for client
            if (token) {
                session.user.id = token.sub || token.id;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.image = token.image;
                session.user.role = token.role || 'USER';
                session.user.username = token.username;
            }
            console.log('[auth callback] session - session ready', { user: session?.user?.email ?? session?.user?.id, role: session?.user?.role });
            return session;
        }
    }
}

export const getAuthSession = () => getServerSession(authOptions);