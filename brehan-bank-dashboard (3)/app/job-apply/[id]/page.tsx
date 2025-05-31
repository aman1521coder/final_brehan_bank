import { JobApplicationPage } from "@/components/public/job-application-page";

// Define props interface
interface ApplyForJobProps {
  params: { id: string };
}

export default function ApplyForJob({ params }: ApplyForJobProps) {
  return <JobApplicationPage jobId={params.id} />;
} 
