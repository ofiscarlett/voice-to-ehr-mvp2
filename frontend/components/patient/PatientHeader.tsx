'use client';

interface Patient {
  id_number: string;
  name: string;
}

const patients: Patient[] = [
  { id_number: '120379-345A', name: 'Aino Saaristo' },
  { id_number: '230481-678B', name: 'Mikael Virtala' },
  { id_number: '041290-912C', name: 'Helmi Koivisto' },
  { id_number: '310365-127D', name: 'Eero Niemelä' },
];

interface PatientHeaderProps {
  patientId: string;
}

export default function PatientHeader({ patientId }: PatientHeaderProps) {
  const patient = patients.find(p => p.id_number === patientId);

  if (!patient) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Patient not found</h2>
        <p className="text-gray-600">ID: {patientId}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        <div>
          <span className="text-[16px] text-[#171717]">Patient Name: </span>
          <span className="text-[16px] text-[#171717]">{patient.name}</span>
        </div>
        <div>
          <span className="text-[16px] text-[#171717]">Patient ID: </span>
          <span className="text-[16px] text-[#171717]">{patient.id_number}</span>
        </div>
      </div>
    </div>
  );
} 