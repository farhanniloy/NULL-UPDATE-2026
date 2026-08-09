"use client";
import React, { useState } from 'react';
import styles from './adminControls.module.css';
import { useRouter } from 'next/navigation';

export default function AdminPostControls({ slug, canManage }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!canManage) return null;

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(()=>({message:'Failed'}));
        alert(err.message || 'Delete failed');
      } else {
        alert('Deleted');
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.controls}>
      <a href={`/write?slug=${encodeURIComponent(slug)}`} className={styles.edit}>Edit</a>
      <button className={styles.delete} onClick={handleDelete} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
    </div>
  );
}
