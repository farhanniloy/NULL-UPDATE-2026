import React from 'react';
import prisma from '@/utils/connect';
import { getAuthSession } from '@/utils/auth';
import styles from './profile.module.css';
import Link from 'next/link';
import RoleChanger from '@/components/admin/RoleChanger';
import UsernameEditor from '@/components/profile/UsernameEditor';

const Page = async () => {
  const session = await getAuthSession();
  if (!session || !session.user?.email) {
    return (
      <div style={{padding:20}}>
        <h2>Not signed in</h2>
        <p>Please <Link href="/login">sign in</Link> to view your profile.</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const posts = await prisma.post.findMany({ where: { userEmail: session.user.email }, orderBy: { createdAt: 'desc' } });

  const isAdmin = session.user?.role === 'ADMIN';

  // moderation history visible to owner and admin
  let history = [];
  if (isAdmin || session.user?.email === user.email) {
    history = await prisma.moderationHistory.findMany({ where: { targetUserEmail: user.email }, orderBy: { createdAt: 'desc' } });
  }

  const rawUsername = user?.username || (user?.email ? user.email.split('@')[0] : null);
  const displayUsername = rawUsername ? (rawUsername.startsWith('@') ? rawUsername : `@${rawUsername}`) : (user?.name || user?.email);

  return (
    <div className={styles.container}>
      <p className={styles.welcome}>Welcome {displayUsername}</p>
      <p style={{marginTop:8}}>Role: {user?.role}</p>

      {isAdmin && (
        <div>
          <h3>Admin controls</h3>
          <RoleChanger targetEmail={user.email} currentRole={user.role} />
        </div>
      )}

      {/* allow owner to edit username */}
      {session.user?.email === user.email && (
        <div>
          <h3>Profile settings</h3>
          <UsernameEditor currentUsername={user.username} />
        </div>
      )}

      <h2>Your posts</h2>
      {posts.length === 0 ? (
        <div>No posts yet</div>
      ) : (
        <ul>
          {posts.map(p => (
            <li key={p.id} style={{marginBottom:8}}>
              <Link href={`/posts/${p.slug}`}>{p.title}</Link> — {p.approved ? 'Approved' : 'Pending'} — {new Date(p.createdAt).toISOString().substring(0,10)}
            </li>
          ))}
        </ul>
      )}

      {(isAdmin || session.user?.email === user.email) && (
        <div style={{marginTop:20}}>
          <h3>Moderation history</h3>
          {history.length === 0 ? <div>No moderation records</div> : (
            <ul>
              {history.map(h => (
                <li key={h.id} style={{marginBottom:6}}>
                  {new Date(h.createdAt).toISOString().substring(0,10)} — {h.action} — {h.details}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
