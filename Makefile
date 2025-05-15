.PHONY: init-db check-db run-frontend run-backend init-pg check-pg

# Initialize SQLite database (legacy)
init-db:
	go run scripts/init_db.go

# Check SQLite database (legacy)
check-db:
	go run scripts/check_db.go

# Initialize PostgreSQL database
init-pg:
	go run scripts/init_pg_db.go

# Check PostgreSQL database
check-pg:
	go run scripts/check_pg_db.go

# Run frontend
run-frontend:
	cd frontend && npm run dev

# Run backend
run-backend:
	go run cmd/api/main.go cmd/api/auth_handler.go cmd/api/employee.go cmd/api/internal_employee.go cmd/api/external_employee.go cmd/api/job_handler.go cmd/api/routes.go cmd/api/helpers.go

# Run both frontend and backend
run-all: run-backend run-frontend 