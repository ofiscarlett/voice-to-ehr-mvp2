'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PreviousEHRs from './PreviousEHRs';
import { Patient } from '@/types';

interface PatientListItemProps {
  patient: Patient;
}

export default function PatientListItem({ patient }: PatientListItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <div className={`${isOpen ? 'bg-[#EEEEEE]' : 'bg-[#FAFAFA]'}`}>
      <div 
        className="group grid grid-cols-3 px-[30px] py-4 items-center cursor-pointer transition-colors duration-200 hover:bg-stone-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-base">{patient.name}</div>
        
        <div className="text-base text-center">{patient.id}</div>

        <div className="flex justify-end items-center gap-6">
          <div className="flex items-center gap-1 text-gray-500 font-semibold text-sm select-none group-hover:text-gray-800 transition-colors duration-200">
            <span>Previous EHR's</span>
            <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : 'group-hover:rotate-90'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/patient/${patient.id}`);
            }}
            className="bg-[#D4D4D4] text-black px-5 py-3 text-[14px] font-semibold flex items-center gap-2 hover:bg-black hover:text-white group transition-colors duration-200 cursor-pointer"
          >
            <span className="transition-transform duration-300 ease-in-out group-hover:rotate-90">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </span>
            Create New EHR
          </button>
        </div>
      </div>
      {isOpen && <PreviousEHRs patientId={patient.id} />}
    </div>
  );
} 