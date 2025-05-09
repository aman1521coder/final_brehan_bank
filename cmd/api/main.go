package main

import (
    "flag"
    "fmt"
    "log"
    "os"

    "database/sql"

    _ "github.com/lib/pq"

    "github.com/brehan/bank/cmd/repository"
    "github.com/brehan/bank/cmd/service"

)

type config struct {
    port       int
    env        string
    datasource string
}

type Application struct {
    config          config
    log             *log.Logger
    repo            *repository.Repository
    authRepo        *repository.AuthRepository
    authService     *service.AuthService
    authHandler     *AuthHandler
    employeeService service.EmployeeService
}

func main() {
    var cfg config
    flag.IntVar(&cfg.port, "port", 8080, "Server port")
    flag.StringVar(&cfg.env, "env", "dev", "Environment (dev|prod)")
    flag.StringVar(&cfg.datasource, "datasource", "postgresql://postgres:123@%23@localhost:5432/final_brehan_bank", "PostgreSQL connection string")
    flag.Parse()

    // Use environment variable for datasource if not provided via flag
    if cfg.datasource == "" {
        cfg.datasource = os.Getenv("DATABASE_URL")
        if cfg.datasource == "" {
            log.Fatal("Database connection string not provided (use -datasource or DATABASE_URL)")
        }
    }

    // Initialize logger
    logger := log.New(os.Stdout, "", log.LstdFlags)

    // Connect to database
    db, err := sql.Open("postgres", cfg.datasource)
    if err != nil {
        logger.Fatal(err)
    }
    defer db.Close()

    // Initialize repositories
    repo := repository.NewRepository(db)
    authRepo := repository.NewAuthRepository(db)

    // Initialize services
    authService := service.NewAuthService(authRepo)

    // Initialize handlers
    authHandler := NewAuthHandler(authService)

    // Initialize application
    app := &Application{
        config:      cfg,
        log:         logger,
        repo:        repo,
        authRepo:    authRepo,
        authService: authService,
        authHandler: authHandler,
        // employeeService remains zero value (uninitialized) as per your code
    }

    // Start server
    app.log.Printf("Connected to database with %s", cfg.datasource)
    app.serve()
}

func (app *Application) serve() {
    router := app.routes()
    addr := fmt.Sprintf(":%d", app.config.port)
    app.log.Printf("Starting %s server on %s", app.config.env, addr)

    if err := router.Run(addr); err != nil {
        app.log.Fatal(err)
    }
}
