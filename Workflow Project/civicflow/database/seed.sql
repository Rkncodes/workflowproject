-- ==========================================================
-- CivicFlow – Demonstration Seed Data
-- ==========================================================

USE civicflow_db;

-- Passwords are plain text or bcrypt for demo. Let's use standard bcrypt for password 'password123'
-- ($2a$10$7R3vUa65xLpTq6HwHn2UoegC0p6aD7BvM6h7vYFmYj0.eH4r/qLca or plain 'password123')
-- Backend will support BCrypt and also demo check.

INSERT INTO users (id, username, password, full_name, email, phone, role, department) VALUES
-- Administrator
(1, 'admin', '$2a$10$wK1m0jZ8h/gY7jP9Y3H7se5j7i0iUoF6M5gX2c0v1n3b4m5k6l7q', 'Admin Commissioner Sharma', 'admin@civicflow.gov.in', '+91 9876543210', 'ADMIN', 'NONE'),

-- Department Officers
(2, 'fire_officer', '$2a$10$wK1m0jZ8h/gY7jP9Y3H7se5j7i0iUoF6M5gX2c0v1n3b4m5k6l7q', 'Chief Insp. Rajesh Verma', 'fire.officer@civicflow.gov.in', '+91 9876543211', 'OFFICER', 'FIRE_SAFETY'),
(3, 'water_officer', '$2a$10$wK1m0jZ8h/gY7jP9Y3H7se5j7i0iUoF6M5gX2c0v1n3b4m5k6l7q', 'Eng. Sunita Rao', 'water.officer@civicflow.gov.in', '+91 9876543212', 'OFFICER', 'WATER'),
(4, 'zoning_officer', '$2a$10$wK1m0jZ8h/gY7jP9Y3H7se5j7i0iUoF6M5gX2c0v1n3b4m5k6l7q', 'Planner Amit Deshmukh', 'zoning.officer@civicflow.gov.in', '+91 9876543213', 'OFFICER', 'ZONING'),
(5, 'env_officer', '$2a$10$wK1m0jZ8h/gY7jP9Y3H7se5j7i0iUoF6M5gX2c0v1n3b4m5k6l7q', 'Dr. Priya Sundaram', 'env.officer@civicflow.gov.in', '+91 9876543214', 'OFFICER', 'ENVIRONMENTAL'),

-- Applicants / Architects
(6, 'ar_vikram', '$2a$10$wK1m0jZ8h/gY7jP9Y3H7se5j7i0iUoF6M5gX2c0v1n3b4m5k6l7q', 'Ar. Vikram Mehta', 'vikram.mehta@studioarch.com', '+91 9123456780', 'APPLICANT', 'NONE'),
(7, 'citizen_rohit', '$2a$10$wK1m0jZ8h/gY7jP9Y3H7se5j7i0iUoF6M5gX2c0v1n3b4m5k6l7q', 'Rohit Singhania', 'rohit.singhania@gmail.com', '+91 9123456781', 'APPLICANT', 'NONE'),
(8, 'ananya_design', '$2a$10$wK1m0jZ8h/gY7jP9Y3H7se5j7i0iUoF6M5gX2c0v1n3b4m5k6l7q', 'Ananya Roy (Urban Infra LLP)', 'info@urbaninfrallp.com', '+91 9123456782', 'APPLICANT', 'NONE')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 10 Demonstration Applications across all stages
INSERT INTO applications (
    id, application_number, applicant_id, project_name, applicant_type, property_address, city, pin_code,
    survey_number, plot_area, building_type, number_of_floors, proposed_building_area, status, current_stage,
    revision_count, max_revisions, land_verification_status, calculated_fee, permit_number, is_overdue, overdue_departments
) VALUES
(1, 'CF-2026-0001', 6, 'Emerald Heights Residency', 'ARCHITECT', 'Plot 45, Sector 12, Tech Park Road', 'Metro City', '560001', 'SURVEY-101-A', 1200.0, 'RESIDENTIAL', 5, 2800.0, 'PERMIT_ISSUED', 'Permit Issuance', 0, 3, 'VALID', 56000.0, 'PERMIT-MC-2026-7891', FALSE, ''),
(2, 'CF-2026-0002', 7, 'Singhania Villa', 'INDIVIDUAL', 'House 14, Lotus Enclave, Lake View', 'Metro City', '560015', 'SURVEY-202-B', 450.0, 'RESIDENTIAL', 2, 380.0, 'PAYMENT_COMPLETED', 'Permit Issuance', 0, 3, 'VALID', 15200.0, 'PERMIT-MC-2026-8902', FALSE, ''),
(3, 'CF-2026-0003', 8, 'Apex Business Square', 'COMPANY', 'Plot 88, Commercial Belt, Ring Road', 'Metro City', '560034', 'SURVEY-303-C', 3500.0, 'COMMERCIAL', 8, 12500.0, 'PENDING_PAYMENT', 'Payment', 1, 3, 'VALID', 250000.0, NULL, FALSE, ''),
(4, 'CF-2026-0004', 6, 'Zenith IT Tower B', 'ARCHITECT', 'Survey 78/2, Cyber City Hub', 'Metro City', '560048', 'SURVEY-404-D', 5000.0, 'COMMERCIAL', 12, 22000.0, 'DEPARTMENTAL_REVIEW', 'Departmental Review', 0, 3, 'VALID', 0.0, NULL, FALSE, ''),
(5, 'CF-2026-0005', 7, 'Green Meadows Duplex', 'INDIVIDUAL', 'Site 10, Green Meadows Phase 2', 'Metro City', '560067', 'SURVEY-505-E', 300.0, 'RESIDENTIAL', 2, 240.0, 'REVISION_REQUIRED', 'Revision', 1, 3, 'VALID', 0.0, NULL, FALSE, ''),
(6, 'CF-2026-0006', 8, 'Phoenix Warehousing Facility', 'COMPANY', 'Plot 12, Industrial Area Phase 1', 'Metro City', '560099', 'SURVEY-606-F', 8000.0, 'INDUSTRIAL', 2, 6500.0, 'REJECTED', 'Environmental Rejection', 0, 3, 'VALID', 0.0, NULL, FALSE, ''),
(7, 'CF-2026-0007', 6, 'Silver Oak Apartments', 'ARCHITECT', 'Plot 22, Hill View Colony', 'Metro City', '560076', 'SURVEY-707-G', 1800.0, 'RESIDENTIAL', 4, 3200.0, 'DEPARTMENTAL_REVIEW', 'Departmental Review', 0, 3, 'VALID', 0.0, NULL, TRUE, 'FIRE_SAFETY'),
(8, 'CF-2026-0008', 7, 'Heritage Home Extension', 'INDIVIDUAL', 'Old Town Heritage Quarter, Lane 4', 'Metro City', '560002', 'SURVEY-808-H', 250.0, 'RESIDENTIAL', 1, 120.0, 'UNDER_VERIFICATION', 'Land Registry Verification', 0, 3, 'PENDING', 0.0, NULL, FALSE, ''),
(9, 'CF-2026-0009', 8, 'Nova Logistics Terminal', 'COMPANY', 'Expressway Corridor KM 14', 'Metro City', '560102', 'SURVEY-909-I', 15000.0, 'INDUSTRIAL', 1, 9500.0, 'SUBMITTED', 'Document Verification', 0, 3, 'PENDING', 0.0, NULL, FALSE, ''),
(10, 'CF-2026-0010', 6, 'Skyline Panorama Residences', 'ARCHITECT', 'Plot 104, Skyline Enclave', 'Metro City', '560088', 'SURVEY-110-J', 4200.0, 'RESIDENTIAL', 14, 18000.0, 'DEPARTMENTAL_REVIEW', 'Departmental Review', 0, 3, 'VALID', 0.0, NULL, TRUE, 'ZONING, WATER')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Department reviews for pending / active applications
INSERT INTO department_reviews (application_id, department, officer_name, status, comments, is_overdue) VALUES
-- CF-2026-0001 (All approved)
(1, 'FIRE_SAFETY', 'Chief Insp. Rajesh Verma', 'APPROVED', 'Fire hydrants, emergency staircase, and sprinklers meet NBC guidelines.', FALSE),
(1, 'WATER', 'Eng. Sunita Rao', 'APPROVED', 'Rainwater harvesting and 100mm main inlet connection approved.', FALSE),
(1, 'ZONING', 'Planner Amit Deshmukh', 'APPROVED', 'Setback of 6m compliant with master plan 2035.', FALSE),
(1, 'ENVIRONMENTAL', 'Dr. Priya Sundaram', 'APPROVED', 'STP design approved. Green cover is 22%.', FALSE),

-- CF-2026-0004 (Active in review)
(4, 'FIRE_SAFETY', 'Chief Insp. Rajesh Verma', 'APPROVED', 'Adequate dual egress staircases provided.', FALSE),
(4, 'WATER', NULL, 'PENDING', NULL, FALSE),
(4, 'ZONING', NULL, 'PENDING', NULL, FALSE),
(4, 'ENVIRONMENTAL', NULL, 'PENDING', NULL, FALSE),

-- CF-2026-0005 (Revision requested by Fire)
(5, 'FIRE_SAFETY', 'Chief Insp. Rajesh Verma', 'REVISION_REQUESTED', 'Side setbacks are less than 3 meters. Fire truck turning radius insufficient. Submit revised architectural blueprint.', FALSE),
(5, 'WATER', 'Eng. Sunita Rao', 'APPROVED', 'Domestic water connection capacity verified.', FALSE),
(5, 'ZONING', 'Planner Amit Deshmukh', 'APPROVED', 'Land use conforms to low-density residential.', FALSE),
(5, 'ENVIRONMENTAL', 'Dr. Priya Sundaram', 'APPROVED', 'No environmental hazard detected.', FALSE),

-- CF-2026-0006 (Rejected by Environmental)
(6, 'FIRE_SAFETY', 'Chief Insp. Rajesh Verma', 'APPROVED', 'Industrial fire suppression scheme accepted.', FALSE),
(6, 'WATER', 'Eng. Sunita Rao', 'APPROVED', 'Industrial effluent discharge connection verified.', FALSE),
(6, 'ZONING', 'Planner Amit Deshmukh', 'APPROVED', 'Located in designated heavy industrial belt.', FALSE),
(6, 'ENVIRONMENTAL', 'Dr. Priya Sundaram', 'REJECTED', 'Site directly overlaps with designated eco-sensitive catchment wetland boundary. Clearance rejected permanently.', FALSE),

-- CF-2026-0007 (Overdue Fire Safety)
(7, 'FIRE_SAFETY', NULL, 'PENDING', 'Overdue for > 48 hours. Escalated to Municipal Administrator.', TRUE),
(7, 'WATER', 'Eng. Sunita Rao', 'APPROVED', 'Water supply pressure adequate.', FALSE),
(7, 'ZONING', 'Planner Amit Deshmukh', 'APPROVED', 'Zoning checks passed.', FALSE),
(7, 'ENVIRONMENTAL', 'Dr. Priya Sundaram', 'APPROVED', 'Environmental clearance granted.', FALSE);

-- Payment records for CF-2026-0001 and CF-2026-0002
INSERT INTO payments (application_id, transaction_id, amount, payment_method, payment_status, payment_date, receipt_number) VALUES
(1, 'TXN-MC-2026-09281', 56000.0, 'NET_BANKING', 'SUCCESS', CURRENT_TIMESTAMP, 'REC-CF-0001-A'),
(2, 'TXN-MC-2026-09282', 15200.0, 'UPI', 'SUCCESS', CURRENT_TIMESTAMP, 'REC-CF-0002-B');

-- Permit record for CF-2026-0001
INSERT INTO permits (application_id, permit_number, issue_date, valid_until, digital_signature, pdf_file_path, qr_code_token) VALUES
(1, 'PERMIT-MC-2026-7891', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 YEAR), 'SHA256:8f4c8e71b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9', '/permits/PERMIT-MC-2026-7891.pdf', 'QR-PERMIT-7891-METRO-GOV');

-- Audit Logs
INSERT INTO audit_logs (application_id, action, performed_by, user_role, details) VALUES
(1, 'APPLICATION_SUBMITTED', 'Ar. Vikram Mehta', 'APPLICANT', 'Application created with initial blueprints and structural certificates.'),
(1, 'DOCUMENT_VERIFIED', 'System Service Worker', 'SYSTEM', 'Automated document checklist passed successfully.'),
(1, 'LAND_REGISTRY_VERIFIED', 'GIS Land Registry Service', 'SYSTEM', 'Survey number SURVEY-101-A verified with Metro Land Registry.'),
(1, 'DEPARTMENTAL_APPROVAL', 'Chief Insp. Rajesh Verma', 'OFFICER', 'Fire Safety approved application CF-2026-0001.'),
(1, 'DEPARTMENTAL_APPROVAL', 'Eng. Sunita Rao', 'OFFICER', 'Water Department approved application CF-2026-0001.'),
(1, 'DEPARTMENTAL_APPROVAL', 'Planner Amit Deshmukh', 'OFFICER', 'Zoning Department approved application CF-2026-0001.'),
(1, 'DEPARTMENTAL_APPROVAL', 'Dr. Priya Sundaram', 'OFFICER', 'Environmental Department approved application CF-2026-0001.'),
(1, 'FEE_CALCULATED', 'Municipal Fee Calculation Process', 'SYSTEM', 'Fee calculated as INR 56,000 based on Residential (2800 sq.m, 5 floors).'),
(1, 'PAYMENT_PROCESSED', 'Citizen Portal Mock Gateway', 'APPLICANT', 'Successful payment of INR 56,000 recorded under TXN-MC-2026-09281.'),
(1, 'PERMIT_ISSUED', 'Municipal Commissioner', 'ADMIN', 'Official building permit PERMIT-MC-2026-7891 generated and signed digitally.');

