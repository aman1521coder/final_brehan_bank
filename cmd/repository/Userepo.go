package repository

import (
	"database/sql"

	"github.com/brehan/bank/cmd/data"
)

type Repository struct {
	DB *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{DB: db}
}


func (repo *Repository) CreateUser(user data.User) error {
	query := `INSERT INTO users (name, password) VALUES ($1, $2)`
	_, err := repo.DB.Exec(query, user.Name, user.Password)
	return err
}


func (repo *Repository) CreateAdmin(admin data.Admin) error {

	err := repo.CreateUser(admin.User)
	if err != nil {
		return err
	}


	query := `INSERT INTO admin (user_id) VALUES ($1)`
	_, err = repo.DB.Exec(query, admin.User.Id)
	return err
}


func (repo *Repository) CreateManager(manager data.Manager) error {

	err := repo.CreateUser(manager.User)
	if err != nil {
		return err
	}

	// Insert manager role by referencing the User ID
	query := `INSERT INTO manager (user_id) VALUES ($1)`
	_, err = repo.DB.Exec(query, manager.User.Id)
	return err
}


func (repo *Repository) CreateDistrictManager(districtManager data.DistrictManager) error {
	// Ensure the district manager is inserted into the Users table first
	err := repo.CreateUser(districtManager.User)
	if err != nil {
		return err
	}


	query := `INSERT INTO district_manager (user_id, district) VALUES ($1, $2)`
	_, err = repo.DB.Exec(query, districtManager.User.Id, districtManager.District)
	return err
}
func (repo *Repository) GetUserById(id string) (data.User, error) {
	var user data.User
	query := `SELECT * FROM users WHERE id = $1`
	err := repo.DB.QueryRow(query, id).Scan(&user.Id, &user.Name, &user.Password, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return user, err
	}
	return user, nil
}
