'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const UserManagementPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to civilians page by default
    router.replace('/dashboard/superadmin/users/civilian');
  }, [router]);

  return null;
};

export default UserManagementPage;
