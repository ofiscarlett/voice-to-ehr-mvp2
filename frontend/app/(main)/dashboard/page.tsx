'use client';

import { useRouter } from 'next/navigation';
import PatientList from '@/components/patient/PatientList';
import { useAuth } from '@/components/auth/AuthContext';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
    const { doctor } = useAuth();

  useEffect(() => {
    console.log('[DEBUG] doctor from context:', doctor);
  }, [doctor]);


  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-[1280px] w-full mx-auto px-10 pt-[104px]">
        <PatientList />
      </div>
      <div className="w-full flex justify-center" style={{ position: 'absolute', bottom: '5vh', left: 0 }}>
        <div className="text-[#737373] font-['Open_Sans'] text-[13px] text-center">
          This dashboard displays fictional, hardcoded data and is not linked to any real database or patients.
        </div>
      </div>
    </div>
  );
} 