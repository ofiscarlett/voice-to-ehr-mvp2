'use client';

interface Patient {
  id_number: string;
  name: string;
  ehr_id: string;
}

const patients: Patient[] = [
  { id_number: '120379-345A', name: 'Aino Saaristo',  ehr_id: "a4f11899-8231-4995-bdc2-09fd2559282a" },
  { id_number: '230481-678B', name: 'Mikael Virtala', ehr_id: "350a9ea1-1d4d-4a27-8c9c-c4d9379a4e6c" },
  { id_number: '041290-912C', name: 'Helmi Koivisto', ehr_id: "b23bf41e-1f95-40e4-a74f-626c1df3ca01" },
  { id_number: '310365-127D', name: 'Eero Niemelä', ehr_id: "14ba68ee-157b-4bda-bca9-00692f8e971a" },
  { id_number: '410278-456F', name: 'Liisa Järvinen', ehr_id:"6fda8c9f-22e1-4374-b1f9-a89169e90dcf" },
  { id_number: '520193-789G', name: 'Matti Koskinen', ehr_id:"0cbac3dd-361b-48d7-b73c-5e168cc0e8b0" },
  { id_number: '630845-234H', name: 'Anna Heikkinen', ehr_id:	"1ed814fb-14a8-4fc1-a570-6f47698c4400" },
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