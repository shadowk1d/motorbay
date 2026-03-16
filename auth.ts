import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {randomBytes} from "node:crypto";
import { prisma } from "@/lib/prisma";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  throw new Error("AUTH_SECRET environment variable is not set. Set it in .env");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" },
        mode: { label: "Mode", type: "text" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        const code = String(credentials?.code ?? "").trim();
        const mode = String(credentials?.mode ?? "login").trim() === "register" ? "register" : "login";
        const requestedName = String(credentials?.name ?? "").trim();

        if (!email) {
          return null;
        }

        // Password login path (kept as primary auth method).
        if (password) {
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            return null;
          }

          const passwordOk = await bcrypt.compare(password, user.passwordHash);

          if (!passwordOk) {
            return null;
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role
          };
        }

        if (!code) {
          return null;
        }

        const otp = await prisma.emailOtp.findFirst({
          where: {
            email,
            purpose: mode,
            usedAt: null,
            expiresAt: {
              gt: new Date()
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        });

        if (!otp || otp.attempts >= 5) {
          return null;
        }

        const ok = await bcrypt.compare(code, otp.codeHash);

        if (!ok) {
          await prisma.emailOtp.update({
            where: { id: otp.id },
            data: {
              attempts: {
                increment: 1
              }
            }
          });

          return null;
        }

        // Atomic update: only succeeds if OTP is still unused (prevents race condition)
        const updated = await prisma.emailOtp.updateMany({
          where: { id: otp.id, usedAt: null },
          data: { usedAt: new Date() }
        });

        if (updated.count === 0) {
          // Another concurrent request already consumed this OTP
          return null;
        }

        let user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user && mode === "register") {
          user = await prisma.user.create({
            data: {
              email,
              name: requestedName || null,
              passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10),
              role: "USER"
            }
          });
        }

        if (user && mode === "register" && requestedName && !user.name) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: requestedName }
          });
        }

        if (!user && mode === "login") {
          return null;
        }

        if (!user) {
          return null;
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }

      return session;
    },
  },
});
