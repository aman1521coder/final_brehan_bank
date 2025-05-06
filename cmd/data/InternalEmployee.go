
package data 
type InternalEmployee struct {
    FirstName    string `json:"first_name"`
    LastName     string `json:"last_name"`
    OtherBankExp string `json:"other_bank_exp"` // Clarify: duration, description?
    Jobid        string `json:"jobid"`
    Resumepath string `json:"resumepath"`
}