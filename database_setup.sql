-- SQL to create the vw_applications_list view in Supabase
-- Run this in your Supabase SQL editor

CREATE OR REPLACE VIEW vw_applications_list AS
SELECT 
    id,
    applicant_name,
    business_name,
    business_type,
    status,
    submitted_at,
    assignee_name,
    EXTRACT(DAYS FROM (NOW() - submitted_at))::INTEGER as aging_days
FROM applications
ORDER BY submitted_at DESC;

-- If you don't have an applications table yet, here's a basic structure:
/*
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    applicant_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT NOW(),
    assignee_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert some sample data for testing
INSERT INTO applications (applicant_name, business_name, business_type, status, assignee_name) VALUES
('John Doe', 'ABC Corp', 'Technology', 'pending', 'Admin User'),
('Jane Smith', 'XYZ Ltd', 'Retail', 'in-review', 'Manager'),
('Bob Johnson', 'Quick Services', 'Services', 'approved', 'Admin User');
*/
