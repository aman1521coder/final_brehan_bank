CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE Employee (
    id SERIAL PRIMARY KEY,
    file_number TEXT,
    full_name TEXT,
    sex TEXT,
    employment_date DATE,       -- Only this kept, properly typed
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
-- Job Table
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

-- Internal Employee Table
CREATE TABLE InternalEmployee (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    jobid UUID REFERENCES Job(id),
    other_bank_exp TEXT,
    employee_id INT REFERENCES Employee(id) ON DELETE CASCADE
);

-- External Employee Table
CREATE TABLE ExternalEmployee (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    jobid UUID REFERENCES Job(id),
    other_job_exp TEXT,
    other_job_exp_year INT
);

-- Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Table
CREATE TABLE Admin (
    user_id UUID PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE
);

-- Manager Table
CREATE TABLE Manager (
    user_id UUID PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE
);

-- District Manager Table
CREATE TABLE DistrictManager (
    user_id UUID PRIMARY KEY REFERENCES Users(id) ON DELETE CASCADE,
    district TEXT
);