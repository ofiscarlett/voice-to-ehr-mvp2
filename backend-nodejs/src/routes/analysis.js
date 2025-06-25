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
flatComposition = require('@supabase/supabase-js').flatComposition;

//const result = dotenv.config();
//console.log('[DEBUG] dotenv config result:', result);
//console.log('[DEBUG] Current AZURE_OPENAI_DEPLOYMENT =', process.env.AZURE_OPENAI_DEPLOYMENT);

//const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-2';

const mockCases = require('./mockCases.json'); // Import mock cases from JSON file

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
    }
    "aiTreatment": {
      "suggestions": ["<same as treatment>"],
      "confidence": 1.0,
      "source": "doctor"
    }
- If the doctor **did not provide** diagnosis or treatment:
    - Generate reasonable guesses.
    - Set "source" to "ai" and estimate "confidence" from 0.7 to 0.95.
    - Add a warning: "AI-generated diagnosis is for reference only." or "AI-suggested treatment is for reference only."
+ If the doctor does not provide a diagnosis or treatment:
    - Generate reasonable guesses.
    - Set "source" to "ai" with confidence (0.7–0.95).
    - Add the appropriate warning(s):
        - "No treatment was provided by the doctor in the input text."
        - "AI-suggested treatment is for reference only."
        - "No diagnosis was provided by the doctor in the input text."
        - "AI-generated diagnosis is for reference only."
Format the response as valid JSON inside a markdown code block like this:

\`\`\`json
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
  "warnings": ["..."]
}
\`\`\`

Rules:
- Use "null" only for fields like symptoms/diagnosis/treatment if they are not found.
- Always include aiDiagnosis and aiTreatment — even if redundant.
- If AI guesses are used, always add a warning in the warnings array.
- If no warnings are needed, return an empty array.
- If the text is irrelevant or incomplete, return:

\`\`\`json
{}
\`\`\`
`;

function sanitizeJSON(jsonString) {
  let sanitized = jsonString.trim();
  if (sanitized.startsWith('```json')) sanitized = sanitized.slice(7);
  else if (sanitized.startsWith('```')) sanitized = sanitized.slice(3);
  if (sanitized.endsWith('```')) sanitized = sanitized.slice(0, -3);
  return sanitized.trim();
}



router.post('/analyze', async (req, res) => {
  console.log('[ENV] AZURE_OPENAI_DEPLOYMENT =', process.env.AZURE_OPENAI_DEPLOYMENT);

  try {
    const { text, caseId } = req.body;
    const analysisText = caseId ? (mockCases[caseId]?.text || text) : text;

    if (!analysisText || analysisText.length < 30) {
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
            { role: 'user', content: analysisText }
          ],
          temperature: 0.7,
          max_tokens: 600,
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

router.post('/mock-test', async (req, res) => {
  const { caseId = 'case1' } = req.body;

  if (!mockCases[caseId]) {
    return res.status(400).json({
      error: 'Invalid caseId',
      availableCases: Object.keys(mockCases)
    });
  }

  console.log(`[TEST] Running mock case: ${caseId} - ${mockCases[caseId].description}`);
  req.body = { caseId };

  // 🔁 Use axios to call your own backend mock handler
  try {
    const response = await axios.post('http://localhost:5000/api/analysis/analyze', req.body);
    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to call /api/analyze',
      details: err.message
    });
  }
});

module.exports = router;

// Doctor does not say diagnosis or treatment as keyword, but AI should have abilaity to guess it