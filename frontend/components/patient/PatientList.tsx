'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Patient {
  id_number: string;
  name: string;
  ehr_id?: string; // Optional EHR ID for patients with EHR data
  // You can add more fields as needed
}

const patients: Patient[] = [
  { id_number: '120379-345A', name: 'Aino Saaristo',  "ehr_id": "a4f11899-8231-4995-bdc2-09fd2559282a" },
  { id_number: '230481-678B', name: 'Mikael Virtala', "ehr_id": "350a9ea1-1d4d-4a27-8c9c-c4d9379a4e6c" },
  { id_number: '041290-912C', name: 'Helmi Koivisto', "ehr_id": "b23bf41e-1f95-40e4-a74f-626c1df3ca01" },
  { id_number: '310365-127D', name: 'Eero Niemelä', "ehr_id": "14ba68ee-157b-4bda-bca9-00692f8e971a" },
];

export default function PatientList() {
  const router = useRouter();

  return (
    <div className="overflow-hidden flex flex-col">
      <div className="grid grid-cols-2 bg-black text-white px-[30px] py-7">
        <div className="text-base">Patient name</div>
        <div className="text-base">Identity Number</div>
      </div>

      <div className="mt-4 space-y-2">
        {patients.map((patient) => (
          <div 
            key={patient.id_number} 
            className="grid grid-cols-2 px-[30px] py-6 items-center bg-[#FAFAFA] hover:bg-[#EEEEEE]"
          >
            <div className="text-base">{patient.name}</div>
            <div className="flex justify-between items-center">
              <span className="text-base">{patient.id_number}</span>
              <button
                onClick={() => router.push(`/patient/${patient.id_number}`)}
                className="bg-[#D4D4D4] text-black px-5 py-3 text-[14px] font-semibold flex items-center gap-2 hover:bg-black hover:text-white group transition-colors duration-200 cursor-pointer"
              >
                <span className="transition-transform duration-300 ease-in-out group-hover:rotate-[80deg] group-hover:filter group-hover:brightness-0 group-hover:invert">
                  <Image 
                    src="/icons/search-icon.svg" 
                    alt="Search" 
                    width={16} 
                    height={16} 
                  />
                </span>
                View on EHR station
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 