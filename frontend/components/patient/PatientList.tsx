'use client';

import { useEffect, useState } from 'react';
import PatientListItem from './PatientListItem';
import { Patient } from '@/types';
import PatientListHeader from './PatientListHeader';

async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch('/api/patients');
  //const res = await fetch('/app/api/patients/[patientId]/ehr/route.ts')
    
  if (!res.ok) {
    throw new Error('Failed to fetch patients');
  }
  return res.json();
}

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatients() {
      try {
        setIsLoading(true);
        const fetchedPatients = await fetchPatients();
        setPatients(fetchedPatients);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    loadPatients();
  }, []);

  return (
    <div className="overflow-hidden flex flex-col">
      <PatientListHeader />

      <div className="mt-4 space-y-2 max-h-[55vh] overflow-y-auto">
        {isLoading && <p className="p-4 text-center">Loading patients...</p>}
        {error && <p className="p-4 text-center text-red-500">{error}</p>}
        {!isLoading && !error && patients.map((patient) => (
          <PatientListItem key={patient.id_number} patient={patient} />
        ))}
      </div>
    </div>
  );
} 