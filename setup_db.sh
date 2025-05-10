#!/bin/bash

# Database variables
DB_NAME="final_brehan_bank"
DB_USER="postgres"       # Change if your DB user is different
DB_HOST="localhost"
DB_PORT="5432"

# Step 1: Create the database
echo "Creating database..."
psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;"

# Step 2: Enable uuid-ossp and create schema
echo "Setting up schema..."
psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE Employee (
    id SERIAL PRIMARY KEY,
    file_number TEXT,
    full_name TEXT,
    sex TEXT,
    employment_date DATE,
    individual_pms FLOAT,
    last_dop DATE,
    job_grade TEXT,
    new_salary FLOAT,
    job_category TEXT,
    new_position TEXT,
    branch TEXT,
    department TEXT,
    district TEXT,
    twin_branch TEXT,
    region TEXT,
    field_of_study TEXT,
    educational_level TEXT,
    cluster TEXT,
    indpms25 FLOAT,
    totalexp20 FLOAT,
    totalexp INT,
    relatedexp INT,
    expafterpromo FLOAT,
    tmdrec20 FLOAT,
    disrec20 FLOAT,
    total FLOAT
);

CREATE TABLE Job (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_name TEXT,
    job_desc TEXT,
    job_type TEXT,
    job_progress TEXT,
    rmeark TEXT,
    closetime TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE InternalEmployee (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    jobid UUID REFERENCES Job(id),
    other_bank_exp TEXT,
    employee_id INT REFERENCES Employee(id) ON DELETE CASCADE,
    resume_path TEXT
);

CREATE TABLE ExternalEmployee (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    jobid UUID REFERENCES Job(id),
    other_job_exp TEXT,
    other_job_exp_year INT,
    resume_path TEXT
);

CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Admin (
    user_id UUID PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Manager (
    user_id UUID PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE DistrictManager (
    user_id UUID PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE,
    district TEXT
);
EOF

echo "Database and tables created successfully."
