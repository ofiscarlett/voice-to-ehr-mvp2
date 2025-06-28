// backend/routes/saveToEhr.js
const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router(); 

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post('/', async (req, res) => {  
  const { ehr_id, structuredEhr, doctor_name = 'unknown',hospital_name = 'Oulu Lifecare Experimental Hospital' } = req.body;
  console.log('[BACKEND] Receving Body:', req.body);
  if (!ehr_id || !structuredEhr) {
    return res.status(400).json({ message: 'Missing ehr_id or structuredEhr' });
  }

  const visitDate = new Date().toISOString();

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
    "voice_ehr_template.v0/assisted_reproduction_treatment_cycle_summary/last_updated": visitDate,
  };

  try {
    const ehrResponse = await axios.post(
      `http://localhost:8080/ehrbase/rest/openehr/v1/ehr/${ehr_id}/composition?templateId=voice_ehr_template.v0&format=FLAT`,
      flatComposition,
      {
        headers: {
          "Content-Type": "application/json",
          "Prefer": "return=representation",
          "Accept": "application/json"
        }
      }
    );

    //const compositionId = ehrResponse.data?.uid?.value;
   // let compositionId = ehrResponse.data?.uid?.value || ehrResponse.data?.compositionUid;
   let compositionId = 
  ehrResponse.data?.uid?.value ||
  ehrResponse.data?.compositionUid ||
  ehrResponse.data?.["voice_ehr_template.v0/_uid"];

  console.log('[DEBUG] EHRbase response:', ehrResponse.data);
  console.log('[DEBUG] compositionId:', compositionId);
  console.log('[SAVE-EHR] EHRbase response body:', ehrResponse.data);
    if (!compositionId) {
      console.warn('[WARNING] No composition ID found');
    }

    const { data, error:insertError } = 
    await supabase.from("medical_reports").insert({
      ehr_id,
      composition_id: compositionId,
      doctor_name,
      hospital_name,
      symptoms: structuredEhr.report?.symptoms,
      diagnosis: structuredEhr.report?.diagnosis,
      treatment: structuredEhr.report?.treatment,
      others: structuredEhr.report?.OTHERS,
      ai_diagnosis: structuredEhr.report?.aiDiagnosis,
      ai_treatment: structuredEhr.report?.aiTreatment,
      warnings: JSON.stringify(structuredEhr.warnings || []),
      visit_date: visitDate,
      //patient_details: structuredEhr.report?.patientDetails || null
    });
    if (insertError) {
      console.error('[supabase] failed insert to supabase:', insertError);
      return res.status(500).json({ 
        message: 'Failed to save to Supabase', 
        error: insertError.message,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Saved to EHRbase and Supabase',
      composition_id: compositionId
    });
  } catch (error) {
    console.error('[SAVE-EHR] Error:', error);
    return res.status(500).json({ message: 'Failed to save EHR data' });
  }
});

module.exports = router; 
