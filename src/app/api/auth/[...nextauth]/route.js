import { authOptions } from "@/utils/auth";
import NextAuth from "next-auth";

console.log('[nextauth route] authOptions providers:', authOptions?.providers?.map?.((p) => p?.name || p?.id || '[provider]'));

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
