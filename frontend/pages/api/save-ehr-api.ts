//API process to save ehr
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios'
import { json } from 'stream/consumers';
import { createClient } from '@supabase/supabase-js';
//use localstorage
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: "error",
            code: 405,
            message: "Method not allowed",
            data: null
          });
    }
    try {
    const { structuredEhr } = req.body;
    const ehr_id = structuredEhr?.ehr_id;
    const visitDate = new Date().toISOString();
    const doctor_name = structuredEhr?.report?.doctor_name || "Unknown Doctor";
    
    const flatComposition = {
      "ctx/language": "en",
      "ctx/territory": "FI",
      "ctx/composer_name": doctor_name,
      "voice_ehr_template.v0/category|value": "event",
      "voice_ehr_template.v0/category|code": "433",
      "voice_ehr_template.v0/category|terminology": "openehr",
      "voice_ehr_template.v0/context/start_time": visitDate,
      "voice_ehr_template.v0/context/setting|value": "home",
      "voice_ehr_template.v0/context/setting|code": "225",
      "voice_ehr_template.v0/context/setting|terminology": "openehr",
      "voice_ehr_template.v0/problem_diagnosis/problem_diagnosis_name": structuredEhr.report?.diagnosis || '',
      "voice_ehr_template.v0/problem_diagnosis/comment": structuredEhr.report?.OTHERS || '',
      "voice_ehr_template.v0/problem_diagnosis/subject|name": "patient",
      "voice_ehr_template.v0/symptom_sign_screening_questionnaire/any_event:0/description": structuredEhr.report?.symptoms || '',
      "voice_ehr_template.v0/symptom_sign_screening_questionnaire/any_event:0/time": visitDate,
      "voice_ehr_template.v0/assisted_reproduction_treatment_cycle_summary/comment": structuredEhr.report?.treatment || '',
      "voice_ehr_template.v0/assisted_reproduction_treatment_cycle_summary/last_updated": visitDate
    }
        //const response = await axios.post(
        const response = await axios.post(
      `http://localhost:8080/ehrbase/rest/openehr/v1/ehr/${ehr_id}/composition?templateId=voice_ehr_template.v0&format=FLAT`,
      flatComposition,
      { headers: {           
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Prefer': 'return=representation' } }
    )
    const compositionId = response.data?.uid?.value ;
    await supabase.from('medical_report').insert({
      ehr_id,
      composition_id: compositionId,
      doctor_name,
      symptoms: structuredEhr.report?.symptoms,
      diagnosis: structuredEhr.report?.diagnosis,
      treatment: structuredEhr.report?.treatment,
      others: structuredEhr.report?.OTHERS,
      ai_diagnosis: structuredEhr.report?.aiDiagnosis || null,
      ai_treatment: structuredEhr.report?.aiTreatment || null,
      warnings: JSON.stringify(structuredEhr.warnings || []),
      created_at: visitDate
    });

        console.log('Debug:',JSON.stringify(structuredEhr, null, 2)); // Log the received data
        return res.status(200).json({
            status: "success",
            code: 200,
            message: "Structured EHR data saved successfully",
            data: structuredEhr
          });
    } catch (error) {
        console.error('Error saving EHR data:', error);
        return res.status(500).json({
            status: "error",
            code: 500,
            message: "Internal server error",
            data: null,
        });
    }}
