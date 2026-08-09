import React from 'react';
import prisma from '@/utils/connect';
import { getAuthSession } from '@/utils/auth';
import Link from 'next/link';
import RoleChanger from '@/components/admin/RoleChanger';
import UsernameEditor from '@/components/profile/UsernameEditor';
import styles from '../../profile/profile.module.css';

const Page = async ({ params }) => {
  const { username } = params;
  // normalize param: accept 'nil', '@nil', or even 'areyouokaynil@gmail.com'
  const withoutAt = username.startsWith('@') ? username.slice(1) : username;
  const withAt = username.startsWith('@') ? username : `@${username}`;

  // Build search conditions: match username variants, exact email, or email local part
  const conditions = [
    { username: username },
    { username: withoutAt },
    { username: withAt },
    { email: username },
    { email: withoutAt + '@' + '%' } // placeholder, replaced below since Prisma doesn't accept SQL wildcards here
  ];

  // Prisma doesn't support LIKE with % in the simple object; instead use startsWith for email local part
  const user = await prisma.user.findFirst({ where: {
    OR: [
      { username: username },
      { username: withoutAt },
      { username: withAt },
      { email: username },
      { email: { startsWith: `${withoutAt}@` } }
    ]
  } });
  if (!user) return (
    <div style={{padding:20}}>
      <h2>User not found</h2>
    </div>
  );

  const session = await getAuthSession();
  const viewerEmail = session?.user?.email;
  const isAdmin = session?.user?.role === 'ADMIN';
  const isOwner = viewerEmail === user.email;

  const postsWhere = { userEmail: user.email };
  if (!isAdmin && !isOwner) postsWhere.approved = true;

  const posts = await prisma.post.findMany({ where: postsWhere, orderBy: { createdAt: 'desc' } });

  // moderation history visible only to admin or owner
  let history = [];
  if (isAdmin || isOwner) {
    history = await prisma.moderationHistory.findMany({ where: { targetUserEmail: user.email }, orderBy: { createdAt: 'desc' } });
  }

  const rawUsername = user?.username || (user?.email ? user.email.split('@')[0] : null);
  const displayUsername = rawUsername ? (rawUsername.startsWith('@') ? rawUsername : `@${rawUsername}`) : (user?.name || user?.email);

  return (
    <div className={styles.container}>
      {isOwner && <p className={styles.welcome}>Welcome {displayUsername}</p>}
      <p style={{marginTop:8}}>Role: {user.role}</p>

      {isAdmin && (
        <div>
          <h3>Admin controls</h3>
          <RoleChanger targetEmail={user.email} currentRole={user.role} />
        </div>
      )}

      {/* allow owner to edit username on their public profile too */}
      {isOwner && (
        <div>
          <h3>Profile settings</h3>
          <UsernameEditor currentUsername={user.username} />
        </div>
      )}

      <h2>Posts</h2>
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

      {(isAdmin || isOwner) && (
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
