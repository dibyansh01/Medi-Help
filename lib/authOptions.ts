import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcrypt'
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

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
             * 1. Checks if email and password are provided.
             * 2. Finds user by email in the database.
             * 3. Compares provided password with stored hash.
             * 4. Returns user object if successful.
             */
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials.password) {
                        throw new Error('MISSING_CREDENTIALS')
                    }

                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    })

                    if (!user) {
                        throw new Error('USER_NOT_FOUND')
                    }

                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    if (!isValid) {
                        throw new Error('INVALID_PASSWORD')
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    }
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
