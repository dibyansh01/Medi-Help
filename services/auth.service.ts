import { userRepository } from '@/repositories'
import bcrypt from 'bcrypt'

/**
 * Auth Service — handles authentication and authorization business logic.
 * Decouples auth logic from NextAuth configuration.
 */

/**
 * Validate user credentials and return user data if valid.
 * Used by NextAuth CredentialsProvider.
 */
export async function validateCredentials(email: string, password: string) {
  if (!email || !password) {
    throw new Error('MISSING_CREDENTIALS')
  }

  const user = await userRepository.findByEmail(email)

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    throw new Error('INVALID_PASSWORD')
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

/**
 * Get a user by ID (for session hydration or profile lookups).
 */
export async function getUserById(userId: string) {
  return userRepository.findById(userId)
}

/**
 * Create a new user account.
 */
export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
}) {
  const existing = await userRepository.findByEmail(data.email)
  if (existing) {
    throw new Error('EMAIL_ALREADY_EXISTS')
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  return userRepository.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
  })
}
