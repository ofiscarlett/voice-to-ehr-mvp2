//API process to save ehr
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios'
import { json } from 'stream/consumers';
//use localstorage

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: "error",
            code: 405,
            message: "Method not allowed",
            data: null
          });
    }
 /*
    if (!structuredEhr || !structuredEhr.report) {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "No structed EHR data",
            data: null,
        });
 
    }  */ 
    try {
    const { structuredEhr } = req.body;
    const ehrId = structuredEhr?.ehrId;
    const visitDate = new Date().toISOString();
    const doctorName = structuredEhr?.report?.doctor_name || "Unknown Doctor";
    
    const flatComposition = {
      "ctx/language": "en",
      "ctx/territory": "US",
      "ctx/composer_name": doctorName,
      "ctx/start_time": visitDate,

      "ehr_data/symptoms": structuredEhr.report?.symptoms || '',
      "ehr_data/diagnosis": structuredEhr.report?.diagnosis || '',
      "ehr_data/treatment": structuredEhr.report?.treatment || '',
      "ehr_data/others": structuredEhr.report?.OTHERS || ''
    }
        //const response = await axios.post(
        const response = await axios.post(
      `http://localhost:8080/ehrbase/rest/openehr/v1/composition?ehrId=${ehrId}&templateId=voice-ehr-template&format=FLAT`,
      flatComposition,
      { headers: { 'Content-Type': 'application/json' } }
    )

        console.log('Debug save EHR data:',JSON.stringify(structuredEhr, null, 2)); // Log the received data
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
