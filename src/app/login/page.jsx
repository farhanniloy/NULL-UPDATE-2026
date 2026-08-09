"use client";
import { useState } from "react";
import styles from "./loginPage.module.css";
import { signIn } from "next-auth/react";

// Restored original visual design (social buttons) and added an email modal
export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use redirect-based signIn so NextAuth redirects to callbackUrl on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const callbackUrl = typeof window !== 'undefined' ? window.location.origin : '/';
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });
      setLoading(false);
      if (result?.ok) {
        window.location.href = callbackUrl;
        return;
      }
      console.error('Sign in result', result);
      setError(result?.error || 'Sign in failed');
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Sign in failed");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.socialButton} onClick={() => signIn("google", { callbackUrl: typeof window !== 'undefined' ? window.location.origin : '/' })}>
          Sign in with Google
        </div>
        <div className={styles.socialButton} onClick={() => signIn("github", { callbackUrl: typeof window !== 'undefined' ? window.location.origin : '/' })}>
          Sign in with GitHub
        </div>
        <div className={styles.socialButton} onClick={() => setShowModal(true)}>
          Sign in with email
        </div>

        {showModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>Sign in with email</h3>
              {error && <div className={styles.error}>{error}</div>}
              <form onSubmit={handleSubmit} autoComplete="off" noValidate>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondary} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.primary} disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
