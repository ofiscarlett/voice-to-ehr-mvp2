import { NextResponse } from 'next/server';
import { Patient } from '@/types';

// ====================================================================================
// DATABASE INTEGRATION POINT
// ====================================================================================
// This is a mock data source. In a real application, this data would come from your
// database. You would replace this static array with a call to your database client.
//
// Example using a hypothetical database client:
// import { db } from '@/lib/db';
// const patients = await db.patient.findMany();
// ====================================================================================
/*
const patients: Patient[] = [
    { id: '120379-345A', name: 'Aino Saaristo' },
    { id: '230481-678B', name: 'Mikael Virtala' },
    { id: '041290-912C', name: 'Helmi Koivisto' },
    { id: '310365-127D', name: 'Eero Niemelä' },
    { id: '410278-456F', name: 'Liisa Järvinen' },
    { id: '520193-789G', name: 'Matti Koskinen' },
    { id: '630845-234H', name: 'Anna Heikkinen' },
];
*/
const patients: Patient[] = [
    { id_number: '120379-345A', name: 'Aino Saaristo',  "ehr_id": "a4f11899-8231-4995-bdc2-09fd2559282a" },
    { id_number: '230481-678B', name: 'Mikael Virtala', "ehr_id": "350a9ea1-1d4d-4a27-8c9c-c4d9379a4e6c" },
    { id_number: '041290-912C', name: 'Helmi Koivisto', "ehr_id": "b23bf41e-1f95-40e4-a74f-626c1df3ca01" },
    { id_number: '310365-127D', name: 'Eero Niemelä', "ehr_id": "14ba68ee-157b-4bda-bca9-00692f8e971a" },
    { id_number: '410278-456F', name: 'Liisa Järvinen', "ehr_id":"6fda8c9f-22e1-4374-b1f9-a89169e90dcf" },
    { id_number: '520193-789G', name: 'Matti Koskinen', "ehr_id":"0cbac3dd-361b-48d7-b73c-5e168cc0e8b0" },
    { id_number: '630845-234H', name: 'Anna Heikkinen', "ehr_id":	"1ed814fb-14a8-4fc1-a570-6f47698c4400" },
    ];

export async function GET() {
  // When connected to a database, the call to fetch patients would happen here.
  // The static `patients` array above would be removed.
  return NextResponse.json(patients);
} 