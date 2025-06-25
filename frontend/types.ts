export interface Patient {
  id_number: string;
  name: string;
  ehr_id: string;
}

export interface EHR {
  id_number: string;
  date: string;
  summary: string;
  ehr_id?: string; // Optional, used when creating new EHRs 
} 