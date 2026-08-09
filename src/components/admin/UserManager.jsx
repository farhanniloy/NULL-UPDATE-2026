"use client"
import { useEffect, useState } from 'react';

export default function UserManager(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchUsers = async ()=>{
    setLoading(true);
    try{
      const res = await fetch('/api/admin/users');
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed');
      setUsers(j.users || []);
    }catch(e){ setMessage('Error fetching users: '+e.message); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchUsers(); }, []);

  const changeRole = async (email, role) => {
    try{
      const res = await fetch('/api/admin/change-role', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, role }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed');
      setMessage('Role updated');
      fetchUsers();
    }catch(e){ setMessage('Error: '+e.message); }
  };

  const changeUsername = async (email, username) => {
    try{
      const res = await fetch('/api/admin/change-username', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, username }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed');
      setMessage('Username updated');
      fetchUsers();
    }catch(e){ setMessage('Error: '+e.message); }
  };

  return (
    <div>
      <h2>Users</h2>
      {message && <div style={{marginBottom:12}}>{message}</div>}
      {loading ? <div>Loading...</div> : (
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr><th>Email</th><th>Name</th><th>Username</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email} style={{borderTop:'1px solid #222'}}>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>
                  <input defaultValue={u.username || ''} id={`username-${u.email}`} />
                  <button onClick={()=>changeUsername(u.email, document.getElementById(`username-${u.email}`).value)}>Save</button>
                </td>
                <td>
                  <select defaultValue={u.role} onChange={(e)=>changeRole(u.email, e.target.value)}>
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
