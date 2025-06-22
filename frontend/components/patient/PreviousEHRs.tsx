'use client';

import { useEffect, useState } from 'react';
import { EHR } from '@/types';

async function fetchPreviousEHRs(patientId: string): Promise<EHR[]> {
  const res = await fetch(`/api/patients/${patientId}/ehrs`);
  if (!res.ok) {
    throw new Error('Failed to fetch EHRs');
  }
  return res.json();
}

export default function PreviousEHRs({ patientId }: { patientId: string }) {
  const [ehrs, setEhrs] = useState<EHR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEHRs() {
      try {
        setIsLoading(true);
        const fetchedEHRs = await fetchPreviousEHRs(patientId);
        setEhrs(fetchedEHRs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    loadEHRs();
  }, [patientId]);

  if (isLoading) {
    return <div className="p-4 text-center bg-[#EEEEEE]">Loading EHRs...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500 bg-[#EEEEEE]">{error}</div>;
  }

  return (
    <div className="bg-[#EEEEEE] px-6 pb-4">
      <div className="space-y-2">
        {ehrs.length > 0 ? (
          ehrs.map(ehr => (
            <div key={ehr.id} className="bg-white p-4 flex justify-between items-center transition-colors duration-200 hover:bg-stone-100">
              <div>
                <p className="font-bold text-gray-800">{ehr.date}</p>
                <p className="text-sm text-gray-600 mt-1">{ehr.summary}</p>
              </div>
              <button className="bg-[#D4D4D4] text-black px-4 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
                View and Modify
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 px-3">No previous EHRs found.</p>
        )}
      </div>
    </div>
  );
} 