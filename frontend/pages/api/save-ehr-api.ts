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
      "ctx/start_time": visitDate,

      "ehr_data/symptoms": structuredEhr.report?.symptoms || '',
      "ehr_data/diagnosis": structuredEhr.report?.diagnosis || '',
      "ehr_data/treatment": structuredEhr.report?.treatment || '',
      "ehr_data/others": structuredEhr.report?.OTHERS || ''
    }
        //const response = await axios.post(
        const response = await axios.post(
      `http://localhost:8080/ehrbase/rest/openehr/v1/composition?ehr_id=${ehr_id}&templateId=voice-ehr-template&format=FLAT`,
      flatComposition,
      { headers: { 'Content-Type': 'application/json' } }
    )
    const compositionId = response.data?.uid?.value ;
    await supabase.from('medical_report').insert({
      ehr_id,
      composition_id: compositionId,
      doctor_name,
      symptoms: flatComposition['ehr_data/symptoms'],
      diagnosis: flatComposition['ehr_data/diagnosis'],
      treatment: flatComposition['ehr_data/treatment'],
      others: flatComposition['ehr_data/others'],
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
