# CivicFlow – Municipal Building Permit Management System
## Camunda 8 BPMN Workflow Automation Platform

CivicFlow is a municipal building permit governance portal built for academic demonstration and real-world e-governance standards. It provides automated workflow orchestration using **Camunda 8 (Zeebe BPMN 2.0)**, parallel departmental statutory approvals (Fire Safety, Water Works, Zoning, Environmental), timer-based SLA escalations, reusable Call Activities for dynamic fee calculation, automated Land Registry GIS verification, and cryptographically verified digital permit generation.

---

## 1. System Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Recharts analytics, React Router v7, Axios.
- **Backend**: Java 21, Spring Boot 3.4.3, Spring Data JPA, Hibernate, Bean Validation, Apache PDFBox 3.0.
- **Workflow Engine**: Camunda 8.8 (Zeebe Broker gRPC port 26500, Operate web console on port 8080).
- **Database**: MySQL 8.0 (`civicflow_db` on localhost:3306).
- **Security & RBAC**: Role-based access control with dedicated roles for Citizen/Architects, Department Officers, and Municipal Administrators.

---

## 2. Directory Structure

```
civicflow/
├── backend/                  # Spring Boot 3.4.3 + Camunda 8 Zeebe service
│   ├── src/main/java/com/civicflow/
│   │   ├── config/          # ZeebeConfig & Security
│   │   ├── controller/      # REST APIs (Auth, Applications, Reviews, Payments, Admin)
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── model/           # JPA Entities (Applications, Users, Reviews, Permits)
│   │   ├── repository/      # Spring Data Repositories
│   │   ├── service/         # Business Logic, PDFBox Generator, Mock Land Registry
│   │   └── workflow/        # Camunda 8 Job Workers
│   └── src/main/resources/  # BPMN models & application.properties
├── frontend/                 # React 18 + Vite + Tailwind CSS portal
│   ├── src/components/      # WorkflowTracker, DepartmentApprovalGrid, Sidebar
│   └── src/pages/           # ApplicantDashboard, OfficerDashboard, AdminDashboard, NewApplication
├── camunda/
│   └── bpmn/
│       ├── municipal_building_permit_process.bpmn    # Core orchestration workflow
│       └── municipal_fee_calculation_process.bpmn     # Reusable Call Activity
├── database/
│   ├── schema.sql           # Complete MySQL 8.0 schema
│   └── seed.sql             # 10 realistic sample applications & officer accounts
└── README.md
```

---

## 3. Demonstration Accounts & Credentials

All demo accounts use the standard password: `password123` (Admin: `admin123`).

| Role | Username | Full Name | Department / Access Scope |
| :--- | :--- | :--- | :--- |
| **Applicant / Architect** | `ar_vikram` | Ar. Vikram Mehta | Licensed Architect Portal |
| **Citizen Applicant** | `citizen_rohit` | Rohit Singhania | Individual Citizen Portal |
| **Fire Officer** | `fire_officer` | Chief Insp. Rajesh Verma | Fire Safety Department Review Desk |
| **Water Officer** | `water_officer` | Eng. Sunita Rao | Water Works Department Review Desk |
| **Zoning Officer** | `zoning_officer` | Planner Amit Deshmukh | Zoning & Urban Planning Review Desk |
| **Environmental Officer**| `env_officer` | Dr. Priya Sundaram | Environmental Protection Board Desk |
| **Municipal Admin** | `admin` | Admin Commissioner Sharma | Full System Oversight & SLA Escalation |

---

## 4. Verified Workflow Scenarios (Evaluation Matrix)

The system has been verified against the 5 project scenarios:

1. **Scenario A (Happy Path - Approval & Permit)**:
   - Application submitted (`CF-2026-6774`).
   - Document verification & GIS Land Registry verification pass.
   - All 4 departments (Fire, Water, Zoning, Environmental) approve in parallel.
   - Camunda Call Activity executes dynamic fee calculation.
   - Citizen pays via mock gateway (`TXN-MC-2026-86837`).
   - Official signed permit `PERMIT-MC-2026-1011.pdf` generated with digital SHA-256 seal.

2. **Scenario B (Departmental Rejection)**:
   - Application filed near sensitive wetlands (`CF-2026-5712`).
   - Environmental Department issues rejection with mandatory explanation.
   - Workflow transitions to `REJECTED` state and notifies applicant.

3. **Scenario C (Revision Loop)**:
   - Fire safety requests setback revisions due to truck turning radius.
   - Application placed in `REVISION_REQUIRED` state.
   - Applicant uploads corrected blueprints; system resets reviews to `PENDING` and repeats verification.

4. **Scenario D (Timer Boundary SLA Escalation)**:
   - Review pending past SLA threshold (configured as 48 hours in production or PT2M for demonstration).
   - Non-interrupting boundary timer event escalates overdue application to Municipal Administrator dashboard.

5. **Scenario E (Payment Failure & Retry)**:
   - Gateway simulates payment decline (`FAILED`).
   - Workflow keeps application in `PENDING_PAYMENT` state without terminating.
   - Applicant retries with valid method (`UPI`); transaction succeeds and permit `PERMIT-MC-2026-1014` is generated.

---

## 5. Startup & Running Instructions

### Prerequisites
- JDK 21+ (`java -version`)
- Maven 3.9+ (`mvn -version`)
- Node.js 18+ & npm (`node -v`)
- MySQL 8.0 on port 3306
- Camunda 8 Run (c8run) on port 8080 / 26500

### Step 1: Database Setup
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 2: Start Camunda 8 Run
Navigate to your Camunda 8 distribution directory:
```bash
c8run.exe start
```
Access Camunda Operate at: `http://localhost:8080/operate` (user: `demo` / `demo`).

### Step 3: Start Spring Boot Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/civicflow-backend-1.0.0.jar
```
Backend runs on `http://localhost:8081/api`.

### Step 4: Start Frontend
```bash
cd frontend
npm install
npm run dev -- --port 3000
```
Open your browser at `http://localhost:3000`.

