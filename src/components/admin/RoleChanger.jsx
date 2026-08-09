"use client"
import { useState } from 'react';

export default function RoleChanger({ targetEmail, currentRole }){
  const [role, setRole] = useState(currentRole || 'USER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const changeRole = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed');
      setMessage('Role updated');
    } catch (e) {
      setMessage('Error: ' + (e.message || e));
    } finally { setLoading(false); }
  };

  return (
    <div style={{marginTop:12}}>
      <label style={{marginRight:8}}>Role:</label>
      <select value={role} onChange={(e)=>setRole(e.target.value)}>
        <option value="USER">USER</option>
        <option value="MODERATOR">MODERATOR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button onClick={changeRole} disabled={loading} style={{marginLeft:8}}>{loading?'Saving...':'Save'}</button>
      {message && <div style={{marginTop:8}}>{message}</div>}
    </div>
  );
}
