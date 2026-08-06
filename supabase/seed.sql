-- Sample data for local development / demos.
-- Run schema.sql first. Then replace the owner_id values below with a real
-- auth user id (create one employer account via /signup, then copy its
-- id from Supabase > Authentication > Users) before running this file.

-- Example (uncomment and fill in a real employer profile id):
-- insert into companies (owner_id, name, slug, location, website, description) values
--   ('00000000-0000-0000-0000-000000000000', 'Cotiviti Nepal', 'cotiviti-nepal', 'Kathmandu', 'https://example.com', 'A leading healthcare technology company operating in Nepal.'),
--   ('00000000-0000-0000-0000-000000000000', 'F1Soft International', 'f1soft-international', 'Lalitpur', 'https://example.com', 'Fintech company behind eSewa, building digital payment products for Nepal.'),
--   ('00000000-0000-0000-0000-000000000000', 'Himalayan Java Coffee', 'himalayan-java-coffee', 'Kathmandu', 'https://example.com', 'Nepal''s home-grown coffee chain.');

-- insert into jobs (company_id, title, slug, category, job_type, location, salary_min, salary_max, description, requirements, deadline) values
--   ((select id from companies where slug = 'f1soft-international'), 'Frontend Developer (React)', 'frontend-developer-react-f1soft', 'IT & Software', 'full-time', 'Lalitpur', 40000, 70000, 'Build and maintain customer-facing React applications for our digital payments platform.', '2+ years React experience, familiarity with TypeScript and REST APIs.', current_date + interval '30 days'),
--   ((select id from companies where slug = 'cotiviti-nepal'), 'QA Engineer', 'qa-engineer-cotiviti', 'IT & Software', 'full-time', 'Kathmandu', 35000, 55000, 'Own manual and automated testing for our healthcare data platform.', 'Experience with Selenium or Cypress, strong attention to detail.', current_date + interval '21 days'),
--   ((select id from companies where slug = 'himalayan-java-coffee'), 'Barista', 'barista-himalayan-java', 'Hospitality', 'part-time', 'Kathmandu', 15000, 20000, 'Prepare and serve coffee, provide excellent customer service at our Thamel branch.', 'Prior barista experience preferred but not required, friendly attitude.', current_date + interval '14 days');
