import React from 'react';
import UserManager from '@/components/admin/UserManager';

const Page = () => {
  return (
    <div style={{padding:20}}>
      <h1>Admin — Users</h1>
      <UserManager />
    </div>
  );
};

export default Page;
