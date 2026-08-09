"use client"
import { useState } from 'react';

export default function UsernameEditor({ currentUsername }){
  const [username, setUsername] = useState(currentUsername ? (currentUsername.startsWith('@') ? currentUsername.slice(1) : currentUsername) : '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [available, setAvailable] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const checkAvailable = (val) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(async () => {
      if (!val) {
        setAvailable(null);
        return;
      }
      try {
        const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(val)}`);
        const j = await res.json();
        setAvailable(j.available === true);
      } catch (e) {
        setAvailable(null);
      }
    }, 400));
  };

  const save = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (!available) {
        setMessage('Username is not available');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/user/change-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed');
      setMessage('Saved');
      // reload to reflect server-side session and profile
      window.location.reload();
    } catch (e) {
      setMessage('Error: ' + (e.message || e));
    } finally { setLoading(false); }
  };

  return (
    <div style={{marginTop:12}}>
      <label style={{marginRight:8}}>Username:</label>
      <input value={username} onChange={(e)=>{ setUsername(e.target.value); checkAvailable(e.target.value); }} placeholder="username (no @)" />
      <button onClick={save} disabled={loading || available === false} style={{marginLeft:8}}>{loading ? 'Saving...' : 'Save'}</button>
      <div style={{marginTop:8}}>
        {available === true && <span style={{color:'green'}}>Available</span>}
        {available === false && <span style={{color:'red'}}>Taken</span>}
        {available === null && <span style={{color:'#aaa'}}>Enter a username</span>}
      </div>
      {message && <div style={{marginTop:8}}>{message}</div>}
    </div>
  );
}
