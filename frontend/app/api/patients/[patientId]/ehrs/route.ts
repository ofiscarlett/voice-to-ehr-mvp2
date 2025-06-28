import { NextRequest, NextResponse } from 'next/server';
import { EHR } from '@/types';
import { createClient } from '@supabase/supabase-js';
//import 'dotenv/config';

///get data from supabase
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}


console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(
  request: NextRequest,
   { params}: { params: { patientId: string } }
) {
   const supabase = getSupabaseClient(); 

  const id_number  = params.patientId;
  const { data: patientData, error: patientIdError} = await supabase
  .from("patients")
  .select("ehr_id")
  .eq("id_number", id_number)
  .single();
  if (patientIdError || !patientData?.ehr_id) {
    return NextResponse.json(
      { error: 'Patient ID not found' }, 
      { status: 404 });
  }
  const ehr_id =  patientData.ehr_id;
  const { data: reports, error: erportError } = await supabase
  .from('medical_reports')
  .select('composition_id, visit_date, symptoms, treatment')
  .eq('ehr_id', ehr_id)
  .order('visit_date', { ascending: false });
  if (erportError) {
    console.error('Error fetching medical reports:', erportError);
    return NextResponse.json({ error: 'Failed to fetch medical reports' }, { status: 500 });
  }
const formattedReports = reports.map((report) => ({
  compositionId: report.composition_id,
  //composition_id: report.composition_id,
  date: report.visit_date,
  summary: `Symptoms: ${report.symptoms}, Treatment: ${report.treatment}` || '(No summary)',
}));

  return NextResponse.json(formattedReports, { status: 200 });

}

export async function POST(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
   const supabase = getSupabaseClient();
  const id_number = params.patientId;
  const newEHR = await request.json();
  

  const { data: patientData, error: patientError } = await supabase
    .from("patients")
    .select("ehr_id")
    .eq("id_number", id_number)
    .single();

  if (patientError || !patientData?.ehr_id) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  const ehr_id = patientData.ehr_id;

  const { error: insertError } = await supabase
    .from("medical_reports")
    .insert({
      ehr_id,
      composition_id: newEHR.compositionId,
      visit_date: newEHR.date,
      symptoms: newEHR.symptoms,
      treatment: newEHR.treatment
    });

  if (insertError) {
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
console.log('Incoming patientId:', params.patientId);
console.log('Request URL:', request.url);
  return NextResponse.json({ success: true }, { status: 201 });
  console.log('Incoming patientId:', params.patientId);
}
