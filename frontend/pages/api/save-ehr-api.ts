//API process to save ehr
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios'
import { json } from 'stream/consumers';
import { createClient } from '@supabase/supabase-js';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { ehr_id, doctor_name, structuredEhr } = req.body;

    if (!ehr_id || !structuredEhr) {
      return res.status(400).json({ message: 'Missing required fields: ehr_id or structuredEhr' });
    }

    const backendResponse = await fetch('http://localhost:5001/api/saveToEhr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ehr_id, doctor_name, structuredEhr }),
    });

    const data = await backendResponse.json();
    return res.status(backendResponse.status).json(data);
  } catch (error) {
    console.error('[save-ehr-api] Error:', error);
    return res.status(500).json({ message: 'Internal server error while saving EHR' });
  }
}
