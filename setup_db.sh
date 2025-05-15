#!/bin/bash

# Database variables
DB_NAME="final_brehan_bank"
DB_USER="postgres"       # Change if your DB user is different
DB_PASSWORD="123@#"      # Using password from init_pg_db.go
DB_HOST="localhost"
DB_PORT="5432"

# Step 1: Create the database
echo "Creating database..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "DROP DATABASE IF EXISTS $DB_NAME;"
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;"

# Step 2: Enable uuid-ossp and create schema
echo "Setting up schema..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME <<EOF
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

-- Add a test admin user
INSERT INTO Users (id, name, password) 
VALUES (uuid_generate_v4(), 'testadmin', 'testpassword');

-- Make the user an admin
INSERT INTO Admin (user_id)
SELECT id FROM Users WHERE name = 'testadmin';

-- Add some test job postings
INSERT INTO Job (job_name, job_desc, job_type, job_progress)
VALUES 
('Senior Loan Officer', 'Responsible for evaluating loan applications', 'Full-time', 'Open'),
('Bank Teller', 'Handle customer transactions', 'Full-time', 'Open'),
('Financial Analyst', 'Analyze financial data and prepare reports', 'Full-time', 'Open');

-- Add sample employees
INSERT INTO Employee (
    file_number, full_name, sex, employment_date, individual_pms, 
    last_dop, job_grade, new_salary, job_category, new_position, 
    branch, department, district, region, 
    field_of_study, educational_level, cluster, 
    indpms25, totalexp20, totalexp, relatedexp, 
    expafterpromo, tmdrec20, disrec20, total
) VALUES
('EMP001', 'John Smith', 'Male', '2018-03-15', 4.2, 
 '2022-05-01', 'Grade 5', 75000, 'Finance', 'Senior Accountant', 
 'Main Branch', 'Finance', 'North', 'Central', 
 'Accounting', 'Bachelor', 'A', 
 1.05, 4.2, 5, 2, 
 5.0, 10.0, 7.5, 27.75),
('EMP002', 'Jane Doe', 'Female', '2019-05-20', 4.5, 
 '2023-01-15', 'Grade 4', 65000, 'Customer Service', 'Service Manager', 
 'Downtown Branch', 'Customer Service', 'South', 'Central', 
 'Business Administration', 'Master', 'B', 
 1.125, 3.5, 4, 1, 
 2.5, 8.0, 6.0, 21.125),
('EMP003', 'Michael Johnson', 'Male', '2017-11-10', 3.8, 
 '2021-09-20', 'Grade 3', 55000, 'Operations', 'Operations Analyst', 
 'West Branch', 'Operations', 'West', 'Western', 
 'Business Operations', 'Bachelor', 'A', 
 0.95, 4.9, 6, 3, 
 7.5, 12.0, 9.0, 34.35),
('EMP004', 'Emily Williams', 'Female', '2020-01-05', 4.0, 
 '2022-11-30', 'Grade 3', 52000, 'IT', 'Systems Analyst', 
 'Main Branch', 'IT', 'North', 'Central', 
 'Computer Science', 'Bachelor', 'C', 
 1.0, 2.8, 3, 1, 
 2.5, 6.0, 4.5, 16.8),
('EMP005', 'Robert Brown', 'Male', '2016-07-22', 4.7, 
 '2023-04-10', 'Grade 6', 95000, 'Management', 'Branch Manager', 
 'East Branch', 'Management', 'East', 'Eastern', 
 'Business Management', 'Master', 'A', 
 1.175, 5.6, 7, 1, 
 2.5, 14.0, 10.5, 33.775);

EOF

echo "Database and tables created successfully with test data."
