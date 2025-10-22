import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      firstName?: string | null
      lastName?: string | null
      phone?: string | null
      role?: string
      image?: string | null
    }
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    role?: string
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
  }
}