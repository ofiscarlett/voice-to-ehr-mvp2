import { NextResponse } from 'next/server';
import { EHR } from '@/types';

// ====================================================================================
// DATABASE INTEGRATION POINT
// ====================================================================================
// This is a mock data source. In a real application, this data would come from your
// database. The functions below would interact with your database client (e.g., Prisma).
// ====================================================================================

const dummyEHRs: EHR[] = [
  {
    id_number: '120379-345A',
    ehr_id: 'a4f11899-8231-4995-bdc2-09fd2559282a',
    date: '2023-03-15',
    summary: 'Follow-up consultation for seasonal allergies.',
  },
  {
    id_number: '120379-345A',
    ehr_id: 'a4f11899-8231-4995-bdc2-09fd2559282a',
    date: '2023-01-20',
    summary: 'Annual physical examination. All vitals normal.',
  },
  {
    id_number: '120379-345A',
    ehr_id: 'ehr-3',
    date: '2022-11-02',
    summary: 'Prescribed medication for back pain.',
  },

  //{ ehr_id: 'ehr-1', date: '2023-03-15', summary: 'Follow-up consultation for seasonal allergies.' },
  //{ ehr_id: 'ehr-2', date: '2023-01-20', summary: 'Annual physical examination. All vitals normal.' },
  //{ ehr_id: 'ehr-3', date: '2022-11-02', summary: 'Prescribed medication for back pain.' },
];
/*
export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  const patientId = params.patientId;
*/
export async function GET(
  request: Request,
  context: { params: { patientId: string } }
) {
  const patientId = context.params.patientId;

  console.log('Fetching EHRs for:', patientId);

  return new Response(JSON.stringify({ message: `EHRs for ${patientId}` }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
 // Extract ehr_id from the URL if needed
  
  // ====================================================================================
  // DATABASE INTEGRATION: FETCH EHRs
  // ====================================================================================
  // Replace the mock data below with a database query.
  // Example using a hypothetical database client (like Prisma):
  // const ehrs = await db.ehr.findMany({ where: { patientId: patientId } });
  // return NextResponse.json(ehrs);
  // ====================================================================================

  console.log(`Fetching EHRs for patient ${patientId}`);
  // We return the same dummy data for all patients for demonstration purposes.
  return NextResponse.json(dummyEHRs);
}

export async function POST(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  const patientId = params.patientId;
  const newEHR = await request.json();
  
  // ====================================================================================
  // DATABASE INTEGRATION: CREATE EHR
  // ====================================================================================
  // Replace the console log and in-memory push with a database creation call.
  // Example using a hypothetical database client (like Prisma):
  // const createdEHR = await db.ehr.create({
  //   data: {
  //     ...newEHR,
  //     patientId: patientId,
  //   },
  // });
  // return NextResponse.json({ success: true, ehr: createdEHR }, { status: 201 });
  // ====================================================================================
  
  console.log(`Saving new EHR for patient ${patientId}:`, newEHR);
  
  // This is temporary for the mock API. Remove when using a real database.
  //dummyEHRs.unshift({ ...newEHR, id: `ehr-${Date.now()}` });
  dummyEHRs.unshift({
    ...newEHR,
    id_number: patientId, // Assuming newEHR has an id_number field
    ehr_id: `ehr-${Date.now()}`, // Generate a unique ehr_id
    date: new Date().toISOString(), // Set the current date as the EHR date
    summary: newEHR.summary || 'No summary provided', // Ensure summary is set
  });

  


  return NextResponse.json({ success: true, ehr: newEHR }, { status: 201 });
} 