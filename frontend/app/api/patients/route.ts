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

const patients: Patient[] = [
    { id: '120379-345A', name: 'Aino Saaristo' },
    { id: '230481-678B', name: 'Mikael Virtala' },
    { id: '041290-912C', name: 'Helmi Koivisto' },
    { id: '310365-127D', name: 'Eero Niemelä' },
    { id: '410278-456F', name: 'Liisa Järvinen' },
    { id: '520193-789G', name: 'Matti Koskinen' },
    { id: '630845-234H', name: 'Anna Heikkinen' },
];

export async function GET() {
  // When connected to a database, the call to fetch patients would happen here.
  // The static `patients` array above would be removed.
  return NextResponse.json(patients);
} 