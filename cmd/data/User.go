package data

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	Id        uuid.UUID
	Name      string
	Password  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Admin struct {
	User User
}

type Manager struct {
	User User
}

type DistrictManager struct {
	User     User
	District string
}
