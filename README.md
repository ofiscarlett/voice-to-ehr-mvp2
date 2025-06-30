# Voice-to-EHR

A fullstack application that converts doctor's voice recordings into structured Electronic Health Records (EHR).

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, toast
- **Backend**: JavaScript, Linux, Java
- **Voice Processing**: Web Audio API, SpeechRecognition
- **Database**: Cloud database supabase, local prostgral 
- **Data Format**: JSON

## Features

- According to Figma / ER / MVP Plan

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv/Scripts/activate

# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the backend server:
```bash
python wsgi.py
```

The backend will run on http://localhost:5000
