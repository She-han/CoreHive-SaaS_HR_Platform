# Billing Plans System - Visual Setup Guide

## 🎬 Getting Started (Step by Step with Screenshots/Actions)

### Step 1: Start MySQL Database
```
Windows:
- Open Services (services.msc)
- Find "MySQL80" or "MySQL Server"
- Ensure it's running (status: Started)

macOS:
brew services start mysql

Linux:
sudo systemctl start mysql
```

---

### Step 2: Create Database & Tables
```bash
# Open MySQL prompt
mysql -u root -p

# Run this SQL
USE corehive_db;

# Copy & paste the content from:
# BILLING_PLANS_DATABASE_SETUP.sql
```

Or run directly:
```bash
mysql -u root -p corehive_db < BILLING_PLANS_DATABASE_SETUP.sql
```

**Verify:**
```sql
SHOW TABLES;
SELECT * FROM billing_plans;
SELECT * FROM plan_features;
```

---

### Step 3: Start Backend Server

**Terminal 1:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Expected Output:**
```
[INFO] Started Application in 5.123 seconds (JVM running for 5.234)
[INFO] Tomcat started on port(s): 8080 with context path ''
```

**Verify in Browser:**
```
http://localhost:8080/api/billing-plans
```

Should show: `[]` or JSON array

---

### Step 4: Start Frontend

**Terminal 2:**
```bash
cd frontend
npm install  # Only first time
npm run dev
```

**Expected Output:**
```
VITE v4.x.x  ready in XXX ms

➜  Local:   http://localhost:3000/
```

---

### Step 5: Access Application

**Open Browser:**
```
http://localhost:3000/admin/billing-plans
```

**Should See:**
- Page title: "Billing & Plans Management"
- "Add New Plan" button
- Grid with 3 plans (Starter, Professional, Enterprise)
- Each plan card with features, price, and action buttons

---

## 🖼️ UI Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                   BillingAndPlans Page                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Billing & Plans Management    [Add New Plan]   │        │
│  │  Manage and configure your pricing plans        │        │
│  └─────────────────────────────────────────────────┘        │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  │
│  │  STARTER         │  │  PROFESSIONAL ⭐ │  │ ENTERPRISE│  │
│  │  Plan Card       │  │  Plan Card       │  │ Plan Card │  │
│  │  ────────────    │  │  ────────────    │  │ ──────────│  │
│  │  Price: 2,500    │  │  Price: 5,500    │  │  Price: - │  │
│  │  Period: /month  │  │  Period: /month  │  │ Period: - │  │
│  │  ────────────    │  │  ────────────    │  │ ──────────│  │
│  │  ✓ Feature 1     │  │  ✓ Feature 1     │  │ ✓Feature1 │  │
│  │  ✓ Feature 2     │  │  ✓ Feature 2     │  │ ✓Feature2 │  │
│  │  ✓ Feature 3     │  │  ✓ Feature 3     │  │ ✓Feature3 │  │
│  │  ...             │  │  ...             │  │ ...       │  │
│  │  ────────────    │  │  ────────────    │  │ ──────────│  │
│  │  [Edit] [Delete] │  │  [Edit] [Delete] │  │[Edit][Del]│  │
│  └──────────────────┘  └──────────────────┘  └───────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flow

### Create Plan Flow
```
User clicks "Add New Plan"
        ↓
Modal opens with empty form
        ↓
User fills:
  - Plan Name
  - Price
  - Period
  - Description
  - Employee Limit
  - Features (add multiple)
        ↓
User checks "Mark as Most Popular" (optional)
        ↓
User clicks "Create Plan"
        ↓
Frontend validates form
        ↓
Frontend sends POST to /api/billing-plans
        ↓
Backend creates in database
        ↓
Frontend refreshes plans list
        ↓
New plan appears in grid
```

### Edit Plan Flow
```
User clicks "Edit" on plan card
        ↓
Modal opens with existing data
        ↓
User modifies fields
        ↓
User adds/removes features
        ↓
User clicks "Update Plan"
        ↓
Frontend sends PUT to /api/billing-plans/{id}
        ↓
Backend updates in database
        ↓
Frontend refreshes plans list
        ↓
Changes visible immediately
```

### Delete Plan Flow
```
User clicks "Delete" on plan card
        ↓
Confirmation dialog appears
        ↓
User confirms deletion
        ↓
Frontend sends DELETE to /api/billing-plans/{id}
        ↓
Backend deletes from database
        ↓
Frontend refreshes plans list
        ↓
Plan removed from grid
```

---

## 🔌 API Communication Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        React Frontend                         │
│                 (http://localhost:3000)                       │
├──────────────────────────────────────────────────────────────┤
│  BillingAndPlans.jsx Component                               │
│  • State: plans[], loading, error, formData                  │
│  • Methods: fetchPlans(), handleSubmit(), handleDelete()     │
└─────────────────────┬──────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    POST            GET            DELETE
    PUT             └─────────────────────────────┐
        │                           │             │
        ▼                           ▼             ▼
┌────────────────────────────────────────────────────────────┐
│              Spring Boot Backend (port 8080)                │
├────────────────────────────────────────────────────────────┤
│  @RestController                                            │
│  @RequestMapping("/api/billing-plans")                      │
│                                                              │
│  POST   /api/billing-plans         → createPlan()           │
│  GET    /api/billing-plans         → getAllPlans()          │
│  GET    /api/billing-plans/{id}    → getPlanById()          │
│  PUT    /api/billing-plans/{id}    → updatePlan()           │
│  DELETE /api/billing-plans/{id}    → deletePlan()           │
│                                                              │
│  ↓ (calls)                                                  │
│                                                              │
│  BillingPlanService                                         │
│  • Business logic                                           │
│  • Validation                                               │
│  • Entity/DTO conversion                                    │
│                                                              │
│  ↓ (calls)                                                  │
│                                                              │
│  BillingPlanRepository (JpaRepository)                      │
│  • Database queries                                         │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │    MySQL Database          │
    │  (corehive_db)             │
    │                            │
    │ ┌──────────────────────┐  │
    │ │  billing_plans       │  │
    │ │  ──────────────────  │  │
    │ │  id (PK)             │  │
    │ │  name (UNIQUE)       │  │
    │ │  price               │  │
    │ │  period              │  │
    │ │  description         │  │
    │ │  employees           │  │
    │ │  popular (bool)      │  │
    │ │  active (bool)       │  │
    │ │  created_at (ts)     │  │
    │ │  updated_at (ts)     │  │
    │ └──────────────────────┘  │
    │                            │
    │ ┌──────────────────────┐  │
    │ │  plan_features (1:N) │  │
    │ │  ──────────────────  │  │
    │ │  billing_plan_id(FK) │  │
    │ │  feature             │  │
    │ └──────────────────────┘  │
    │                            │
    └────────────────────────────┘
```

---

## 📝 Form Validation Rules

```
┌─────────────────────────────────┐
│      Form Field Validation      │
├─────────────────────────────────┤
│                                 │
│ Name:                           │
│   • Required: Yes               │
│   • Max length: 100 chars       │
│   • Must be unique              │
│                                 │
│ Price:                          │
│   • Required: Yes               │
│   • Format: "1,000" or "Custom" │
│                                 │
│ Period:                         │
│   • Optional                    │
│   • Default: "/month"           │
│                                 │
│ Description:                    │
│   • Required: Yes               │
│   • Max length: TEXT (65k)      │
│                                 │
│ Employees:                      │
│   • Required: Yes               │
│   • Format: "Up to X employees" │
│                                 │
│ Features:                       │
│   • Required: At least 1        │
│   • Max length: 255 per feature │
│   • Add with Enter or button    │
│   • Remove with X button        │
│                                 │
│ Popular:                        │
│   • Optional checkbox           │
│   • Only one plan recommended   │
│                                 │
└─────────────────────────────────┘
```

---

## 🎨 Color Scheme

```
┌────────────────────────────────────────┐
│         Color Palette Used             │
├────────────────────────────────────────┤
│                                        │
│ Primary Green/Teal                     │
│   • #02C39A - Main accent color        │
│   • #1ED292 - Feature checkmark        │
│                                        │
│ Secondary Blue                         │
│   • #05668D - Secondary accent         │
│                                        │
│ Background                             │
│   • #F1FDF9 - Light green background   │
│   • #FFFFFF - Card/Modal white         │
│                                        │
│ Text                                   │
│   • text-primary - Dark gray (main)    │
│   • text-secondary - Medium gray       │
│                                        │
│ Status Colors                          │
│   • Green (#1ED292) - Success/Check    │
│   • Red (#EF4444) - Delete/Error       │
│   • Blue (#3B82F6) - Info              │
│                                        │
└────────────────────────────────────────┘
```

---

## 🔐 Security Considerations

```
✅ Implemented:
   • CORS enabled for allowed origins
   • Request validation on backend
   • SQL injection prevention (JPA)
   • XSS protection (React escaping)
   • CSRF prevention (Spring Security)

⚠️ To Add Later:
   • Authentication/Authorization
   • Role-based access control
   • Audit logging
   • Rate limiting
   • Encryption for sensitive data
```

---

## 📊 Response Examples

### GET /api/billing-plans (200 OK)
```json
[
  {
    "id": 1,
    "name": "Starter",
    "price": "2,500",
    "period": "/month",
    "description": "Perfect for small teams",
    "employees": "Up to 25 employees",
    "features": [
      "Employee Management",
      "Basic Payroll",
      "Leave Management"
    ],
    "popular": false,
    "active": true
  }
]
```

### POST /api/billing-plans (201 Created)
```json
{
  "id": 4,
  "name": "Starter Plus",
  "price": "3,500",
  "period": "/month",
  "description": "Enhanced Starter plan",
  "employees": "Up to 50 employees",
  "features": ["Feature1", "Feature2"],
  "popular": false,
  "active": true
}
```

### Error Response (400/404/500)
```json
{
  "error": "Plan with name 'Starter' already exists",
  "status": 400,
  "timestamp": "2024-01-01T12:00:00"
}
```

---

## ✅ Checklist for Success

**Before Testing:**
- [ ] MySQL running
- [ ] corehive_db database exists
- [ ] Tables created (billing_plans, plan_features)
- [ ] Sample data inserted
- [ ] Backend configured (application.properties)
- [ ] Frontend API URL set to http://localhost:8080

**After Starting Servers:**
- [ ] Backend shows "Started Application"
- [ ] Frontend shows Local URL
- [ ] Can access http://localhost:3000/admin/billing-plans
- [ ] Plans display in grid
- [ ] No console errors

**After Testing CRUD:**
- [ ] Can create new plan
- [ ] Can edit existing plan
- [ ] Can delete plan
- [ ] Features save correctly
- [ ] Database reflects changes
- [ ] Popular badge displays correctly

---

**You're ready to go! 🎉**
