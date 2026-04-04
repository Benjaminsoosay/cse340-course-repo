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
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');

-- ========================================
-- Projects Table
-- ========================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    organization_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    image_filename VARCHAR(255),
    FOREIGN KEY (organization_id) REFERENCES organization(organization_id) ON DELETE CASCADE
);

-- Insert sample projects only if projects table is empty
-- Note: Cast date strings to DATE using ::date
INSERT INTO projects (name, description, organization_id, start_date, end_date, location, image_filename)
SELECT * FROM (VALUES
    ('School Library Build', 'Constructing a library for under-resourced elementary school.', 1, '2025-06-01'::date, '2025-08-30'::date, 'Portland, OR', 'library-build.jpg'),
    ('Community Garden', 'Establishing a community garden in a food desert.', 2, '2025-04-15'::date, '2025-10-01'::date, 'Detroit, MI', 'garden.jpg'),
    ('Free Health Camp', 'Providing free checkups and health education.', 3, '2025-07-10'::date, '2025-07-12'::date, 'Austin, TX', 'health-camp.jpg')
) AS v(name, description, organization_id, start_date, end_date, location, image_filename)
WHERE NOT EXISTS (SELECT 1 FROM projects LIMIT 1);

-- ========================================
-- Categories Table
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Insert categories (safe even if already present)
INSERT INTO categories (name) VALUES
    ('Education'),
    ('Environment'),
    ('Health & Wellness')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- Junction Table: project_categories
-- ========================================
CREATE TABLE IF NOT EXISTS project_categories (
    project_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Associate projects with categories (avoid duplicates)
INSERT INTO project_categories (project_id, category_id)
SELECT p.id, c.id
FROM projects p
JOIN categories c ON
    (p.name = 'School Library Build' AND c.name = 'Education')
    OR (p.name = 'Community Garden' AND c.name = 'Environment')
    OR (p.name = 'Free Health Camp' AND c.name = 'Health & Wellness')
ON CONFLICT DO NOTHING;