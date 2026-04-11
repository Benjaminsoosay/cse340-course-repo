-- ========================================
-- Organization Table
-- ========================================
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);


-- ========================================
-- Insert sample data: Organizations
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');


-- ========================================
-- Service Table
-- ========================================
CREATE TABLE service_projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INT NOT NULL, 
    title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    project_date DATE NOT NULL,
    CONSTRAINT fk_organization
      FOREIGN KEY (organization_id) 
      REFERENCES organization (organization_id)
      ON DELETE CASCADE
);

-- ========================================
-- Insert sample data: Service Projects
-- ========================================
-- 5 Projects for Organization 1
INSERT INTO service_projects (organization_id, title, description, location, project_date) VALUES
(1, 'Park Cleanup', 'Trash removal', 'North Park', '2026-05-01'),
(1, 'Tree Planting', 'Planting 20 maples', 'South Hill', '2026-05-05'),
(1, 'River Scrub', 'Cleaning the bank', 'River Side', '2026-05-10'),
(1, 'Trail Repair', 'Fixing hiking paths', 'Green Ridge', '2026-05-15'),
(1, 'Garden Prep', 'Weeding community plots', 'City Garden', '2026-05-20');

-- 5 Projects for Organization 2
INSERT INTO service_projects (organization_id, title, description, location, project_date) VALUES
(2, 'Food Sorting', 'Organizing cans', 'Main Warehouse', '2026-05-02'),
(2, 'Meal Delivery', 'Dropping off lunches', 'East District', '2026-05-06'),
(2, 'Soup Kitchen', 'Serving dinner', 'Downtown Center', '2026-05-11'),
(2, 'Pantry Stocking', 'Unloading trucks', 'Main Warehouse', '2026-05-16'),
(2, 'Bread Run', 'Collecting bakery surplus', 'Local Bakeries', '2026-05-21');

-- 5 Projects for Organization 3
INSERT INTO service_projects (organization_id, title, description, location, project_date) VALUES
(3, 'Coding Workshop', 'Teaching Python', 'Library', '2026-05-03'),
(3, 'Web Design 101', 'Intro to CSS', 'Tech Hub', '2026-05-07'),
(3, 'Cyber Security', 'Safety for seniors', 'Community Center', '2026-05-12'),
(3, 'PC Repair', 'Fixing old laptops', 'Tech Hub', '2026-05-17'),
(3, 'Hardware Demo', 'Showing new tools', 'High School', '2026-05-22');


-- ========================================
-- Category Table
-- ========================================
CREATE TABLE categories (
	category_id SERIAL PRIMARY KEY,
	category_name VARCHAR(50) NOT NULL UNIQUE
);

-- ========================================
-- project_categories Table (Many-to-Many Relationship)
-- ========================================

CREATE TABLE project_categories (
	project_id INT NOT NULL,
	category_id INT NOT NULL,
	--Constraints
	PRIMARY KEY (project_id, category_id),
	FOREIGN KEY (project_id) REFERENCES
	service_projects (project_id) ON DELETE CASCADE,
	FOREIGN KEY (category_id) REFERENCES
	categories(category_id) ON DELETE CASCADE
);

-- ========================================
-- Insert sample data: Categories
-- ========================================

INSERT INTO categories (category_name) VALUES
('Environment'),
('Education'),
('Health'),
('Community Development'),
('Food Security');

-- =========================================
-- Roles Table
-- =========================================

CREATE TABLE roles (
	role_id SERIAL PRIMARY KEY,
	role_name VARCHAR (50) UNIQUE NOT NULL,
	role_description TEXT
);

-- Inserting Roles
INSERT INTO roles (role_name, role_description) VALUES 
    ('user', 'Standard user with basic access'),
    ('admin', 'Administrator with full system access');

-- Verify the data was inserted
SELECT * FROM roles;

-- ============================================
-- Users Table
-- ============================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);