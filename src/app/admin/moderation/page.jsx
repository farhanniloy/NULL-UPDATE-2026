import React from 'react';
import styles from './moderation.module.css';
import AdminModerationClient from '@/components/admin/AdminModerationClient';

const Page = async () => {
  // server component renders a placeholder; actual listing and actions happen client-side
  return (
    <div className={styles.container}>
      <h1>Moderation</h1>
      <p>Approve or reject pending posts.</p>
      <AdminModerationClient />
    </div>
  );
};

export default Page;