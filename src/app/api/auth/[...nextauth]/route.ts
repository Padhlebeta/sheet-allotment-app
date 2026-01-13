import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    callbacks: {
        async signIn() {
            // Allow login, we will filter data in the dashboard based on email
            // Optional: Strict mode - Only allow if email exists in DB
            /*
            await connectToDatabase();
            const exists = await Allotment.exists({ teacherEmail: user.email });
            return !!exists;
            */
            return true;
        },
        async session({ session }) {
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "random_secret_string_change_me",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
