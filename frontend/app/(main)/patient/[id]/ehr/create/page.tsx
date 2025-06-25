'use client';
/* Notice
####
this page is same to patient/[id]/page.tsx. due to old code
cant fetch the patient id from origial design.
*/
import { useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VoiceRecorder from '@/components/ehr/VoiceRecorder';
import PatientHeader from '@/components/patient/PatientHeader';
import BackButton from '@/components/common/BackButton';
import EHRActions from '@/components/ehr/EHRActions';
import Image from 'next/image';
import { patientMap } from '@/components/libs/patientMap';


export default function PatientPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [structuredEhr, setStructuredEhr] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const ehrId = patientMap[patientId];
  
  if (!ehrId) {
  setError('Cannot find EHR ID for this patient.');
  return;
}

  const handleTranscriptionComplete = useCallback((text: string) => {
    console.log('Received transcription:', text);
    setTranscribedText(text);
    setStructuredEhr(null);
  }, []);

  const startRecording = async () => {
    try {
      if (isPaused) {
        // Resume recording
        mediaRecorder.current?.resume();
        setIsPaused(false);
        return;
      }

      // Start new recording
      audioChunks.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError('');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Error accessing microphone. Please make sure you have granted microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      setIsPaused(true);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') return;

    setIsTranscribing(true);
    mediaRecorder.current.stop();
    setIsRecording(false);
    setIsPaused(false);

    try {
      await new Promise<void>((resolve) => {
        if (!mediaRecorder.current) return resolve();
        mediaRecorder.current.onstop = () => resolve();
      });

      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      
      const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      if (!apiKey) throw new Error('Deepgram API key not found');

      const response = await fetch('https://api.deepgram.com/v1/listen?model=general&language=en-US', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/webm'
        },
        body: audioBlob
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deepgram API error: ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

      if (!transcript) throw new Error('No transcription received');

      handleTranscriptionComplete(transcript);
    } catch (error: any) {
      console.error('Transcription error:', error);
      setError(error.message || 'Error during transcription. Please try again.');
    } finally {
      setIsTranscribing(false);
      mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setStructuredEhr({
      ...structuredEhr,
      report: {
        ...structuredEhr.report,
        [field]: value
      }
    });
  };

  const handleStartEHR = async () => {
    if (!transcribedText) {
      setError('Please record some audio first.');
      return;
    }

    if (transcribedText.length < 30) {
      setError('The recorded text is too short. Please provide a more detailed description (at least 30 characters).');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: transcribedText, 
          ehr_id: ehrId,  }),
      });

      if (!response.ok) {
        throw new Error('Failed to process EHR');
      }

      const result = await response.json();
      
      if (result.error || !result.data) {
        throw new Error(result.message || 'Failed to process EHR');
      }

      setStructuredEhr(result.data);
    } catch (error: any) {
      console.error('Error processing EHR:', error);
      setError(error.message || 'Failed to process EHR');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-[calc(100vw-80px)] mx-auto px-10">
      <div className="w-full mx-auto flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0">
          <div className="bg-[#FAFAFA] pt-[32px] pb-[22px] px-[34px] mt-[60px] mb-[40px] h-[80vh]">
            <div className="grid grid-cols-[39%_59%] gap-[30px] h-full">
              {/* Left Section */}
              <div className="flex flex-col h-full col-span-1">
                <div className="space-y-2 mb-[100px]">
                  <PatientHeader patientId={patientId} />
                </div>
                <div className="flex-1 min-h-0 overflow-auto">
                  <div className="grid grid-cols-2 gap-2 mb-0">
                    <div className="flex flex-col items-center w-full">
                      <button
                        onClick={isRecording ? pauseRecording : startRecording}
                        disabled={isTranscribing}
                        className={`w-full p-4 ${isRecording ? 'bg-[#16A34A] text-white' : 'bg-[#E6E6E6]'} hover:bg-[#16A34A] hover:text-white flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors duration-200 ease-in-out group cursor-pointer`}
                      >
                        {isPaused ? 'Continue' : isRecording ? 'Pause' : 'Record'}
                        <Image 
                          src="/icons/mic.svg" 
                          alt="mic" 
                          width={16} 
                          height={16} 
                          className={`transition-colors duration-200 ease-in-out ${isRecording ? 'filter brightness-0 invert' : ''} ${isRecording && !isPaused ? 'animate-bounce' : ''} group-hover:filter group-hover:brightness-0 group-hover:invert`}
                        />
                      </button>
                      <div className="text-[12px] text-gray-600 mt-2 text-center w-full">
                        {isRecording ? (isPaused ? 'Recording paused' : 'Recording in progress...') : 'This will record your voice'}
                      </div>
                    </div>
                    <div className="flex flex-col items-center w-full">
                      <button
                        onClick={stopRecording}
                        disabled={!isRecording || isTranscribing}
                        className={`w-full p-4 flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors duration-200 ease-in-out group cursor-pointer
                          ${isTranscribing ? 'bg-[#16A34A] text-white' : 'bg-[#E6E6E6] text-black hover:bg-[#16A34A] hover:text-white'}
                        `}
                      >
                        Transcript
                        <Image 
                          src="/icons/pencil.svg" 
                          alt="pencil" 
                          width={16} 
                          height={16} 
                          className={`transition-colors duration-200 ease-in-out group-hover:filter group-hover:brightness-0 group-hover:invert ${isTranscribing ? 'animate-bounce -rotate-12 filter brightness-0 invert' : ''}`}
                        />
                      </button>
                      <div className="text-[12px] text-gray-600 mt-2 text-center w-full">
                        This will turn your voice to text
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-full mb-8">
                    <button
                      onClick={handleStartEHR}
                      disabled={!transcribedText || isProcessing}
                      className={`w-full p-4 flex items-center justify-center gap-2 text-[14px] font-semibold mt-[40px] transition-colors duration-200 ease-in-out group cursor-pointer
                        ${isProcessing ? 'bg-[#16A34A] text-white' : 'bg-black text-white hover:bg-[#16A34A]'}
                      `}
                    >
                      {isProcessing ? 'EHR on Progress' : 'Start EHR'}
                      <Image 
                        src="/icons/ehr.svg" 
                        alt="ehr" 
                        width={16} 
                        height={16} 
                        className={`filter invert brightness-0 transition-colors duration-200 ease-in-out ${isProcessing ? 'animate-pulse' : ''}`}
                      />
                    </button>
                    <div className="text-[12px] text-gray-600 mt-2 text-center w-full">
                      This will turn your transcripted voice into an EHR
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full p-4 bg-[#E6E6E6] hover:bg-[#DDDDDD] text-center flex items-center justify-center gap-2 text-[14px] cursor-pointer group"
                  >
                    <Image src="/icons/arrow.svg" alt="arrow" width={17} height={17} className="-ml-[2px] transition-transform duration-200 ease-in-out group-hover:-translate-x-1" />
                    Patient's Dashboard
                  </button>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex flex-col min-h-0 h-full col-span-1">
                <div className="flex items-center justify-between">
                  <div className="text-[16px] text-[#171717] font-semibold">Check and modify EHR</div>
                  {/* Status icons and info text */}
                  {structuredEhr ? (
                    <div className="flex items-center gap-1">
                      <span className="text-green-600 text-xs">✔</span>
                      <span className="text-green-600 text-xs font-medium tracking-wide">· EHR Ready ·</span>
                      <span className="text-green-600 text-xs">✔</span>
                    </div>
                  ) : transcribedText ? (
                    <div className="flex items-center gap-1">
                      <span className="text-green-600 text-xs">✔</span>
                      <span className="text-green-600 text-xs font-medium tracking-wide">· Transcription Ready ·</span>
                      <span className="text-green-600 text-xs">✔</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex-1 bg-white p-[30px] mt-[20px] mb-[20px] overflow-y-auto">
                  {structuredEhr ? (
                    <div className="space-y-6">
                      <div className="space-y-4 font-mono text-sm">
                        <div>
                          <div className="font-semibold mb-2">Symptoms</div>
                          <div className="p-2 bg-white">
                            <textarea
                              value={structuredEhr.report?.symptoms || ''}
                              onChange={(e) => handleFieldChange('symptoms', e.target.value)}
                              className="w-full p-2 border min-h-[80px] focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                              placeholder="Enter symptoms..."
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold mb-2">Diagnosis</div>
                          <div className="p-2 bg-white">
                            <textarea
                              value={structuredEhr.report?.diagnosis || ''}
                              onChange={(e) => handleFieldChange('diagnosis', e.target.value)}
                              className="w-full p-2 border min-h-[80px] focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                              placeholder="Enter diagnosis..."
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold mb-2">Treatment</div>
                          <div className="p-2 bg-white">
                            <textarea
                              value={structuredEhr.report?.treatment || ''}
                              onChange={(e) => handleFieldChange('treatment', e.target.value)}
                              className="w-full p-2 border min-h-[80px] focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                              placeholder="Enter treatment..."
                            />
                          </div>
                        </div>
                        {structuredEhr.report?.OTHERS && (
                          <div>
                            <div className="font-semibold mb-2">Additional Notes</div>
                            <div className="p-2 bg-white">
                              <textarea
                                value={structuredEhr.report?.OTHERS || ''}
                                onChange={(e) => handleFieldChange('OTHERS', e.target.value)}
                                className="w-full p-2 border min-h-[80px] focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                placeholder="Enter additional notes..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {structuredEhr.warnings && structuredEhr.warnings.length > 0 && (
                        <div className="mt-6 p-2 bg-yellow-50 border border-yellow-200">
                          <strong>AI Suggestions:</strong>
                          <ul className="mt-1 list-disc list-inside text-yellow-700">
                            {structuredEhr.warnings.map((warning: string, index: number) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="font-['Inter'] text-[14px] text-gray-400 whitespace-pre-wrap">
                      {transcribedText || 'Transcribed text will be here'}
                    </div>
                  )}
                </div>
                <div>
                  <EHRActions structuredEhr={structuredEhr} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 