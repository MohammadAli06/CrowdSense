import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.BACKEND_URL ?? "http://localhost:8000"}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email:    credentials?.email,
                password: credentials?.password,
              }),
            }
          );

          const data = await res.json();

          if (res.ok && data.token) {
            return {
              id:    data.admin.email,
              name:  data.admin.name,
              email: data.admin.email,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...(data.admin as any),
              token: data.token,
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.backendToken = user.token;
        token.role         = user.role;
        token.name         = user.name;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      session.backendToken    = token.backendToken;
      session.role            = token.role;
      session.user            = session.user ?? {};
      session.user.name       = token.name;
      return session;
    },
  },

  pages: {
    signIn: "/",          // redirect unauthenticated users to login (root)
  },

  session: {
    strategy: "jwt",
    maxAge:   24 * 60 * 60, // 24 h
  },

  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-prod",
});

export { handler as GET, handler as POST };
