"use client";
import React, { useEffect, useState } from 'react';

export default function AdminModerationClient() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pending');
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setPosts(json.posts || []);
    } catch (e) {
      console.error(e);
      alert('Failed to load pending posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const doAction = async (slug, action) => {
    try {
      const path = action === 'approve' ? '/api/admin/approve' : '/api/admin/reject';
      const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) {
        const err = await res.json().catch(()=>({message:'Action failed'}));
        alert(err.message || 'Action failed');
        return;
      }
      await load();
    } catch (e) {
      console.error(e);
      alert('Action error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.length === 0 ? <div>No pending posts</div> : (
        <div>
          {posts.map((p) => (
            <div key={p.id} style={{border:'1px solid #ddd', padding:12, marginBottom:12}}>
              <h3>{p.title}</h3>
              <div>by: {p.user?.name || p.userEmail} ({p.user?.email})</div>
              <div style={{marginTop:8}}>{p.summary || (p.desc || '').replace(/<[^>]*>/g, '').slice(0,200)}</div>
              <div style={{marginTop:8}}>
                <button onClick={()=>doAction(p.slug,'approve')} style={{marginRight:8}}>Approve</button>
                <button onClick={()=>doAction(p.slug,'reject')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
