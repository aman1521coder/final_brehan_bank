package repository
import(
	"github.com/brehan/bank/cmd/data"
)
func (repo *Repository)AddJob(job data.Job) error{
	

	query := `INSERT INTO Job (job_name, job_desc, job_type, job_progress, rmeark, closetime, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_,err:=repo.DB.Exec(query, job.JobName, job.JobDesc, job.JobType, job.JobProgress, job.Rmark, job.Closetime, job.CreatedAt, job.UpdatedAt)
	return err
}
func (repo *Repository)GetJobById(id int)(data.Job,error){
	var job data.Job
	query := `SELECT * FROM Job WHERE id = $1`	
	err := repo.DB.QueryRow(query, id).Scan(&job.JobName, &job.JobDesc, &job.JobType, &job.JobProgress, &job.Rmark, &job.Closetime)
	if err != nil {
		return job, err
	}
	return job, nil
}
func (repo *Repository)GetJobByName(name string)(data.Job,error){
	var job data.Job
	query := `SELECT * FROM Job WHERE job_name = $1`	
	err := repo.DB.QueryRow(query, name).Scan(&job.JobName, &job.JobDesc, &job.JobType, &job.JobProgress, &job.Rmark, &job.Closetime)
	if err != nil {
		return job, err
	}
	return job, nil
}
func (repo *Repository)GetJobByType(jobtype string)(data.Job,error){
	// this one return if the job is external or internal
	
	var job data.Job
	query := `SELECT * FROM Job WHERE job_type = $1`	
	err := repo.DB.QueryRow(query, jobtype).Scan(&job.JobName, &job.JobDesc, &job.JobType, &job.JobProgress, &job.Rmark, &job.Closetime)
	if err != nil {
		return job, err
	}
	return job, nil
}