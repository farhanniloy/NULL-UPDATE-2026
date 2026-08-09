"use client"
import {SessionProvider, useSession, signOut} from "next-auth/react";
import {useEffect} from "react";

function SessionVerifier(){
    // Verifies the session on the server-side (maps to a real DB user).
    // If verification fails, force sign out to prevent "auto-login" from stale tokens.
    const {status} = useSession();

    useEffect(() => {
        let mounted = true;
        if (status === 'authenticated') {
            (async () => {
                try {
                    const res = await fetch('/api/auth/me');
                    if (!res.ok && mounted) {
                        // sign out without redirect then reload to clear client state
                        await signOut({ redirect: false });
                        window.location.reload();
                    }
                } catch (e) {
                    if (mounted) {
                        await signOut({ redirect: false });
                        window.location.reload();
                    }
                }
            })();
        }
        return () => { mounted = false; };
    }, [status]);

    return null;
}

const AuthProvider = ({children}) => {
    // Add polling to ensure client picks up session changes quickly after redirect
    return(
        <SessionProvider refetchInterval={5} refetchOnWindowFocus={true}>
            <SessionVerifier />
            {children}
        </SessionProvider>
    )
}

export default AuthProvider