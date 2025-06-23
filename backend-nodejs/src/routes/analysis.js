const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const createAzureClient = require ('@azure-rest/ai-inference').default;
const { AzureKeyCredential } = require('@azure/core-auth');
const {createClient: createSupabaseClient } = require('@supabase/supabase-js');//newc code for supabase

dotenv.config();
const supabase = createSupabaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
//mapping the supabase client to the global scope

//const result = dotenv.config();
//console.log('[DEBUG] dotenv config result:', result);
//console.log('[DEBUG] Current AZURE_OPENAI_DEPLOYMENT =', process.env.AZURE_OPENAI_DEPLOYMENT);

//const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-2';

//const mockCases = require('./mockCases.json'); // Import mock cases from JSON file

const router = express.Router();

const client = new createAzureClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  //new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
);


//tell ai what is its job
const systemPrompt = `You are a medical text analyzer. Analyze the given medical text and extract structured information in four categories:

1. Symptoms (what the patient is experiencing)
2. Diagnosis (confirmed medical condition)
3. Treatment (prescribed medications, procedures, or recommendations)
4. OTHERS (non-critical or background information or others)

Also:
- Always include two fields: aiDiagnosis and aiTreatment.
- If the diagnosis and treatment were provided by the doctor, set:
    "aiDiagnosis": {
      "possibleConditions": ["<same as diagnosis>"],
      "confidence": 1.0,
      "source": "doctor"
    },
    "aiTreatment": {
      "suggestions": ["<same as treatment>"],
      "confidence": 1.0,
      "source": "doctor"
    }
- If the doctor did not provide diagnosis or treatment:
    - Generate reasonable guesses.
    - Set "source" to "ai" with estimated confidence between 0.7–0.95.
    - Add appropriate warning(s) such as:
        - "No treatment was provided by the doctor in the input text."
        - "AI-suggested treatment is for reference only."
        - "No diagnosis was provided by the doctor in the input text."
        - "AI-generated diagnosis is for reference only."

Format the response as valid JSON, with no markdown formatting. Do NOT use triple backticks. Example:

{
  "report": {
    "symptoms": "...",
    "diagnosis": "...",
    "treatment": "...",
    "OTHERS": "...",
    "aiDiagnosis": {
      "possibleConditions": ["..."],
      "confidence": 0.95,
      "source": "doctor" | "ai"
    },
    "aiTreatment": {
      "suggestions": ["..."],
      "confidence": 0.95,
      "source": "doctor" | "ai"
    }
  },
  "warnings": []
}

Only return raw JSON. Do not wrap your response in any markdown block or backticks.

Rules:
- Use null only for fields like symptoms/diagnosis/treatment if truly not found.
- Always include aiDiagnosis and aiTreatment — even if redundant.
- If AI guesses are used, always add a warning in the warnings array.
- If no warnings are needed, return an empty array.
- If the input text is irrelevant or incomplete, return:

{}
`;


function sanitizeJSON(jsonString) {
  let sanitized = jsonString.trim();
  if (sanitized.startsWith('```json')) sanitized = sanitized.slice(7);
  else if (sanitized.startsWith('```')) sanitized = sanitized.slice(3);
  if (sanitized.endsWith('```')) sanitized = sanitized.slice(0, -3);
  return sanitized.trim();
}

router.post('/analyze', async (req, res) => {
  //console.log('[ENV] AZURE_OPENAI_DEPLOYMENT =', process.env.AZURE_OPENAI_DEPLOYMENT);
  console.log('[DEBUG] Incoming request body:', req.body);

  try {
    const { text, ehr_id, doctor_name="unknow Doctor" } = req.body;
    //const analysisText = caseId ? (mockCases[caseId]?.text || text) : text;

    if (!text || text.length < 10) {
      //return res.status(400).json({ error: 'Text is required' });
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Text is required or too short",
        data: null,
        error: true
      });
    }
    console.log('[AZURE DEPLOYMENT]', deploymentName);
    //console.log('[AZURE ENDPOINT]', process.env.AZURE_OPENAI_ENDPOINT);
  
  
    const result = await client
      //.path('/deployments/{deployment}/chat/completions', process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4')
      .path(`/deployments/${deploymentName}/chat/completions`) // <-- FIXED: interpolate the deployment
      .post({
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 400,
         //response_format: 'json'
          //response_format: { type: 'json_object' }
        },
        queryParameters: {
          api_version: '2024-04-01-preview'
        }
      });

    //const rawText = await result.body;
    const rawText = result.body;
    console.log('Received raw text:', req.body.text);
    console.log('[AI RAW JSON]', JSON.stringify(rawText, null, 2));

    const aiResponse = JSON.parse(sanitizeJSON(rawText.choices?.[0]?.message?.content || '{}'));
    aiResponse.warnings = aiResponse.warnings || [];

      
      //console.log("Patient Details:", aiResponse.report?.patientDetails || 'N/A');

      if (!aiResponse.report?.diagnosis) {
        aiResponse.warnings.push("No diagnosis was provided by the doctor in the input text.");
      }
      if (!aiResponse.report?.treatment) {
        aiResponse.warnings.push("No treatment or diagnosis was provided by the doctor in the input text.");
      }

      if (aiResponse.report?.aiDiagnosis?.source === 'ai') {
        aiResponse.warnings.push("AI-generated diagnosis is for reference only.");
        console.log(`AI Diagnosis (source: ${aiResponse.report.aiDiagnosis.source}):`, aiResponse.report.aiDiagnosis.possibleConditions);
      }
      if (aiResponse.report?.aiTreatment?.source === 'ai') {
        aiResponse.warnings.push("AI-suggested treatment is for reference only.");
        
    }
    console.log('\n[AI STRUCTURED RESPONSE]');
    console.log("Symptoms:", aiResponse.report?.symptoms || 'N/A');
    //console.log("Diagnosis:", aiResponse.report?.diagnosis || 'N/A');
    //console.log("Treatment:", aiResponse.report?.treatment || 'N/A');
    //console.log("OTHERS:", aiResponse.report?.OTHERS || 'N/A');
    //console.log("AI Diagnosis:", JSON.stringify(aiResponse.report?.aiDiagnosis, null, 2) || 'N/A');
    //console.log("AI Treatment:", JSON.stringify(aiResponse.report?.aiTreatment, null, 2) || 'N/A');

    //console.log("Warnings:", aiResponse.warnings || 'N/A');
    console.log("End of AI response\n");
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
  "voice_ehr_template.v0/problem_diagnosis/problem_diagnosis_name": aiResponse.report?.diagnosis || '',
  "voice_ehr_template.v0/problem_diagnosis/comment": aiResponse.report?.OTHERS || '',
  "voice_ehr_template.v0/problem_diagnosis/subject|name": "patient",
  "voice_ehr_template.v0/symptom_sign_screening_questionnaire/any_event:0/description": aiResponse.report?.symptoms || '',
  "voice_ehr_template.v0/symptom_sign_screening_questionnaire/any_event:0/time": visitDate,
  "voice_ehr_template.v0/assisted_reproduction_treatment_cycle_summary/comment": "",
  "voice_ehr_template.v0/assisted_reproduction_treatment_cycle_summary/last_updated": visitDate,
  //"voice_ehr_template.v0/treatment_plan/description": aiResponse.report?.treatment || ''
  "voice_ehr_template.v0/assisted_reproduction_treatment_cycle_summary/comment":aiResponse.report?.treatment || '',
};

    const ehrResponse = await axios.post(
      `http://localhost:8080/ehrbase/rest/openehr/v1/ehr/${ehr_id}/composition?templateId=voice_ehr_template.v0&format=FLAT`,
    //`http://localhost:8080/ehrbase/rest/openehr/v1/composition?ehrId=${ehr_id}&templateId=voice_ehr_template.v0&format=FLAT`,
    //`http://localhost:8080/ehrbase/rest/openehr/v1/composition?ehrId=${ehr_id}&templateId=voice_ehr_template.v0&format=FLAT`,
    //`http://localhost:8080/rest/ecis/v1/composition?ehrId=${ehr_id}&templateId=voice_ehr_template.v0&format=FLAT`,
    //`http://localhost:8080/rest/openehr/v1/composition?ehrId=${ehr_id}&templateId=voice_ehr_template.v0&format=FLAT`,
      flatComposition,
      { headers: { 
        "Content-Type": 'application/json',
        //'Content-Type': 'application/openehr.wt.flat+json',
        'Prefer': 'return=representation',
        'Accept': 'application/json'
       } }
    );
   

    //const compositionId = ehrResponse.data?.uid?.value;
    let compositionId =  ehrResponse.data?.uid?.value || ehrResponse.data?.["voice_ehr_template.v0/_uid"];
    if (!compositionId) {
       console.warn('[WARNING] Composition UID not found in response:', ehrResponse.data);
    }
    console.log('EHRbase composition ID:', compositionId);
    //write to supabase
    await supabase.from("medical_reports").insert({
      ehr_id,
      composition_id: compositionId,
      doctor_name,
      symptoms: aiResponse.report?.symptoms,
      diagnosis: aiResponse.report?.diagnosis,
      treatment: aiResponse.report?.treatment,
      others: aiResponse.report?.OTHERS || aiResponse.report?.others, 
      //symptoms: flatComposition['ehr_data/symptoms'],
      //diagnosis: flatComposition['ehr_data/diagnosis'],
      //treatment: flatComposition['ehr_data/treatment'],
      //others: flatComposition['ehr_data/others'],
      ai_diagnosis: aiResponse.report?.aiDiagnosis || null,
      ai_treatment: aiResponse.report?.aiTreatment || null,
      warnings: JSON.stringify(aiResponse.warnings),
      create_at: visitDate,
      patient_details: aiResponse.report?.patientDetails || null
           });

    return res.status(200).json({
      status: "success",
      code: 200,
      message: 'Analysis completed successfully',
      data: aiResponse,
      error: false
    });

  } catch (err) {
      if (err.statusCode === 429) {
    console.warn('[RETRY] Hit rate limit. Retrying in 30s...');
    await new Promise(res => setTimeout(res, 30000));
    // call Azure API again
  }
    console.error('Analysis error:', err);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal error during analysis",
      data: null,
      error: true
    });
  }
});



module.exports = router;

// Doctor does not say diagnosis or treatment as keyword, but AI should have abilaity to guess it