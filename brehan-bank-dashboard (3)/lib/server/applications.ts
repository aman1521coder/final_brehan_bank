import { db } from './db';

interface ApplicationData {
  job_id: number;
  full_name: string;
  email: string;
  phone: string;
  current_position?: string;
  current_department?: string;
  experience_years: string;
  education_level: string;
  field_of_study: string;
  resume_url?: string;
  cover_letter: string;
  type: 'internal' | 'external';
  status: string;
  created_at: string;
}

export async function createApplication(data: ApplicationData) {
  try {
    const result = await db.query(
      `INSERT INTO applications (
        job_id, 
        full_name, 
        email, 
        phone, 
        current_position, 
        current_department, 
        experience_years, 
        education_level, 
        field_of_study, 
        resume_url, 
        cover_letter, 
        type, 
        status, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        data.job_id,
        data.full_name,
        data.email,
        data.phone,
        data.current_position || null,
        data.current_department || null,
        data.experience_years,
        data.education_level,
        data.field_of_study,
        data.resume_url || null,
        data.cover_letter,
        data.type,
        data.status,
        data.created_at
      ]
    );

    return { id: result[0].id };
  } catch (error) {
    console.error('Database error creating application:', error);
    throw new Error('Failed to create application in database');
  }
}

export async function getApplicationsByJobId(jobId: number) {
  try {
    const applications = await db.query(
      `SELECT * FROM applications WHERE job_id = ? ORDER BY created_at DESC`,
      [jobId]
    );
    
    return applications;
  } catch (error) {
    console.error('Database error fetching applications:', error);
    throw new Error('Failed to fetch applications');
  }
} 