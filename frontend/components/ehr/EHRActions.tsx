'use client';

import { useState } from 'react';
//get doctor name from auth hardcode and save to ehr
import { useContext } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
//get ehr id from patientmap
import { useParams } from 'next/navigation';
import { patientMap } from '@/components/libs/patientMap';


interface EHRActionsProps {
  onSave?: () => void;
  ehrId?: string; // Optional, used when creating new EHRs
  patientId?: string; // Optional, used when creating new EHRs
  disabled?: boolean;
  structuredEhr?: any;
}

export default function EHRActions({ onSave, disabled = false, structuredEhr }: EHRActionsProps) {
  const { doctor } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const params = useParams();
  const patientId = params?.id as string;
  const ehrId = patientMap[patientId];

  const handleSave = async () => {
    if (!structuredEhr) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/save-ehr-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //body: JSON.stringify({ structuredEhr }),
          body: JSON.stringify({
          ehr_id: patientMap[patientId], // or from API
          doctor_name: doctor?.name || 'unknown',
          structuredEhr,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save EHR');
      }

      if (onSave) {
        onSave();
      }
      setShowModal(true);
    } catch (error) {
      console.error('Error saving EHR:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className=" flex justify-end">
        <button
          onClick={handleSave}
          disabled={disabled || !structuredEhr || isSaving}
          className={`w-full bg-black text-white p-4 flex items-center justify-center gap-2 text-[14px] transition-colors duration-200 ease-in-out
            ${!(disabled || !structuredEhr || isSaving) ? 'hover:bg-[#525252] cursor-pointer' : 'cursor-not-allowed'}`}
        >
          {isSaving ? 'Saving...' : 'Save EHR'}
          <Image src="/icons/save.svg" alt="save" width={16} height={16} style={{ filter: 'invert(100%)' }} />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-200/60 backdrop-blur-sm"></div>
          <div className="relative bg-white shadow-2xl w-[1024px] h-[600px] px-[172px] pt-[120px] pb-[50px] z-10 flex flex-col items-center justify-start">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-[20px] right-[20px] transition-transform duration-200 ease-in-out cursor-pointer group"
              style={{padding: 0}}
            >
              <img
                src="/icons/close.svg"
                alt="Close"
                width={28}
                height={28}
                className="group-hover:rotate-90 transition-transform duration-200 ease-in-out"
              />
            </button>
            <div className="flex items-center w-full mb-0" style={{gap: '10px'}}>
              <img src="/icons/checkbox.svg" alt="checkbox" width={32} height={32} />
              <span className="text-[24px] font-semibold text-left">EHR saved successfully</span>
            </div>
            <div className="flex flex-col items-start w-full mt-[60px] mb-0" style={{gap: '24px'}}>
              <span className="text-[16px] text-[#757575] text-left">• Close this modal window to continue modifying from where you left.</span>
              <span className="text-[16px] text-[#757575] text-left">• Go back to Patient's dashboard for starting new EHR.</span>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-black text-white text-[16px] font-semibold p-4 flex items-center justify-center group transition-colors duration-200 ease-in-out hover:bg-[#222] mx-auto w-[340px] cursor-pointer"
              style={{position: 'absolute', left: 0, right: 0, bottom: '50px'}}
            >
              <img src="/icons/arrow.svg" alt="arrow" width={18} height={18} className="filter brightness-0 invert transition-transform duration-200 ease-in-out mr-[10px] group-hover:-translate-x-1" />
              Patient's dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
} 