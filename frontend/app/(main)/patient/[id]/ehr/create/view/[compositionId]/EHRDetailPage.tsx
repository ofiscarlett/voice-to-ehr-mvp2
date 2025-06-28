'use client';
//this is to get the ehr detail but no time to finish
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EHRDetailPage() {
  const { id: patientId, compositionId } = useParams() as { id: string; compositionId: string };
  const [ehr, setEhr] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/ehr/entry?composition_id=${compositionId}`);
        if (!res.ok) throw new Error('Failed to fetch EHR entry');
        const data = await res.json();
        setEhr(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    if (compositionId) fetchData();
  }, [compositionId]);

  if (!ehr) return <div className="p-10 text-gray-500">{error || 'Loading...'}</div>;

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">EHR Detail</h2>
        <button
          className="text-blue-600 hover:underline text-sm"
          onClick={() => router.push(`/patient/${patientId}`)}
        >
          Back to Patient
        </button>
      </div>
      <div className="space-y-4">
        <p><strong>Doctor:</strong> Dr. {ehr.doctor_name || 'Unknown'}</p>
        <p><strong>Hospital:</strong> Oulu Lifecare Experimental Hospital</p>
        <p><strong>Date:</strong> {ehr.visit_date}</p>
        <p><strong>Symptoms:</strong> {ehr.symptoms || 'N/A'}</p>
        <p><strong>Diagnosis:</strong> {ehr.diagnosis || 'N/A'}</p>
        <p><strong>Treatment:</strong> {ehr.treatment || 'N/A'}</p>
        <p><strong>Other Notes:</strong> {ehr.OTHERS || 'N/A'}</p>
        <p><strong>Composition ID:</strong> {ehr.composition_id}</p>
      </div>
    </div>
  );
}
