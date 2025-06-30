# Voice-to-EHR

A application that converts doctor's voice recordings into structured Electronic Health Records (EHR) using AI, following the openEHR standard.
It combines Next.js, Node.js, Supabase, and EHRbase to create an end-to-end voice-to-EHR workflow.

## Video Demo: (https://youtu.be/NejdSlW5hR8 )

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, toast
- **Backend**: Node.js(Exoress), Linux, Java, Azure OpenAI
- **Voice Processing**: Web Audio API, SpeechRecognition, LLM
- **Database**: Supabase(Postgre SQL) 
- **Data Format**: JSON
- **EHR Engine**: EHRBase (OpenEHR)

## Features

- According to Figma / ER / MVP Plan

## Setup Instructions
# 1️⃣ Clone the Repository & Install Dependencies
```bash
git clone https://github.com/ofiscarlett/voice-to-ehr-mvp2.git
cd voice-to-ehr-mvp2

cd backend-nodejs
npm install

cd ../frontend
npm install
```
# 2️⃣ Setup Environment Variables
✅ Supabase
You need to get your own supabase account and project
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=...

```
✅ EHRbase (Backend only)
```bash
EHRBASE_URL=http://localhost:8080/ehrbase
```
Front-end run at 
#  3️⃣ Start the App (Development Mode)
```bash
npm run dev
```
# 🎤 4️⃣ Try the Voice-to-EHR Workflow

1. The frontend will run on http://localhost:3000, Go to http://localhost:3000

2. Login as a doctor (demo account or hardcoded user)

3. Select a patient → Click Create EHR

4. Record voice → Transcribe → Start EHR

5. I processes input and fills out structured fields

6. Click Save EHR – Data saved to:

📦 EHRbase (openEHR format)

☁️ Supabase (for doctor dashboard & summary view)

# 🧪 5️⃣ Others improvements
1. 💡 Missing diagnosis/treatment? AI will suggest options.
2. ⚠️ Required fields must be filled before saving.
3. 🔄 Saved records will show up under Previous EHRs.
4. 🆔 Each visit gets a unique Composition ID.

