package data
type ExternalEmployee struct {
    FirstName   string `json:"first_name"`
    LastName    string `json:"last_name"`
    Email       string `json:"email"`
    Phone       string `json:"phone"`
    Jobid       string `json:"jobid"`
    OtherJobExp string `json:"other_job_exp"`
    OtherJobYear int    `json:"other_job_exp_year"`
    Resumepath string    `json:"resumepath"`
}