# Voice-to-EHR

A fullstack application that converts doctor's voice recordings into structured Electronic Health Records (EHR) using AI, following the openEHR standard.
It combines Next.js, Node.js, Supabase, and EHRbase to create an end-to-end voice-to-EHR workflow.

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, toast
- **Backend**: JavaScript, Linux, Java
- **Voice Processing**: Web Audio API, SpeechRecognition
- **Database**: Cloud database supabase, local prostgral 
- **Data Format**: JSON

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

3️⃣ Start the App (Development Mode)
```bash
npm run dev
```

The frontend will run on http://localhost:3000



The backend will run on http://localhost:5000
