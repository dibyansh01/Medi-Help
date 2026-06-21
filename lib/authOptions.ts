import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validateCredentials } from '@/services/auth.service'
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

/**
 * NextAuth configuration — uses AuthService for credential validation
 * instead of direct Prisma queries. This keeps the auth config thin
 * and delegates business logic to the service layer.
 */
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            /**
             * Authorizes the user based on provided credentials.
             * Delegates to AuthService.validateCredentials for actual validation.
             */
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials.password) {
                        throw new Error('MISSING_CREDENTIALS')
                    }

                    return await validateCredentials(
                        credentials.email,
                        credentials.password
                    )
                } catch (err) {
                    console.error('AUTH ERROR:', err)
                    throw err // IMPORTANT: rethrow so NextAuth can pass error
                }
            }

        }),
    ],
    session: {
        strategy: 'jwt',

    },
    callbacks: {
        // Adds user ID and Role to the JWT token
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        // Adds user ID and Role to the session object
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id
                session.user.role = token.role
            }
            return session
        },
    },
    pages: {
        signIn: '/login', // Custom login page
    },
}
