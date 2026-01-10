# 🚀 Quick Start Guide - Organization Extended Modules

## Overview
This guide will help you quickly set up and test the new organization extended modules system.

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Run Database Schema
```bash
# Navigate to backend folder
cd backend

# Run the SQL script (MySQL)
mysql -u root -p corehive_db < database_schema_extended_modules.sql

# Or manually copy and execute the SQL from the file
```

**What this does:**
- Creates `extended_modules` table
- Creates `organization_modules` junction table
- Seeds 8 initial modules (4 active, 4 inactive)

### Step 2: Verify Backend Compilation
```bash
# Still in backend folder
mvn clean install

# Should compile without errors
```

### Step 3: Start Backend Server
```bash
mvn spring-boot:run

# Server should start on http://localhost:8080
```

### Step 4: Start Frontend
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies (if not done already)
npm install

# Start dev server
npm run dev

# Frontend should start on http://localhost:5173
```

---

## 🧪 Testing Workflow

### As System Administrator (SYS_ADMIN)

#### 1. Access Modules Management
```
URL: http://localhost:5173/sys_admin/modules
Login: Use your SYS_ADMIN credentials
```

#### 2. View Seeded Modules
You should see 8 modules:
- ✅ **Active (4)**: QR Attendance, Face Recognition, Employee Feedback, Hiring Management
- ❌ **Inactive (4)**: Performance Reviews, Leave Management Pro, Payroll Integration, Training & Development

#### 3. Test Module Operations

**Create New Module:**
1. Click "Add New Module" button
2. Fill in:
   - Name: "Custom Module Test"
   - Description: "Testing custom module"
   - Module Key: "moduleCustomTest"
   - Icon: "Package"
   - Category: "Testing"
   - Price: 99.99
   - Active: ✅ Yes
3. Click "Create Module"
4. Verify it appears in the list

**Edit Module:**
1. Click "Edit" on any module
2. Change description or price
3. Click "Update Module"
4. Verify changes are saved

**Toggle Status:**
1. Click "Toggle Status" on any active module
2. Confirm the action
3. Module should move to inactive state
4. Toggle again to reactivate

**Delete Module:**
1. Click "Delete" on the test module you created
2. Confirm deletion
3. Module should be removed from list

#### 4. Test Search & Filters

**Search:**
- Type "QR" in search box
- Should show QR Code Attendance Marking

**Filter by Category:**
- Select "Attendance" from category dropdown
- Should show only attendance-related modules

**Filter by Status:**
- Select "Active" from status dropdown
- Should show only active modules

---

### As Organization Administrator (ORG_ADMIN)

#### 1. Access Module Configuration
```
URL: http://localhost:5173/dashboard (then navigate to Module Configuration)
Login: Use your ORG_ADMIN credentials
```

#### 2. Configure Modules
1. You should see only **active modules** (not inactive ones)
2. Toggle modules on/off:
   - ✅ Enable QR Attendance
   - ✅ Enable Employee Feedback
   - ❌ Disable Face Recognition
   - ❌ Disable Hiring Management
3. Click "Save Configuration"
4. Success message should appear

#### 3. Verify Database Sync

**Open MySQL and run:**
```sql
-- Check Organization table boolean flags
SELECT 
    name,
    module_qr_attendance_marking,
    module_employee_feedback,
    module_face_recognition_attendance_marking,
    module_hiring_management
FROM organizations
WHERE organization_uuid = 'YOUR_ORG_UUID';

-- Check organization_modules junction table
SELECT 
    om.id,
    em.name AS module_name,
    om.is_enabled,
    om.subscribed_at
FROM organization_modules om
JOIN extended_modules em ON om.module_id = em.module_id
WHERE om.organization_id = (
    SELECT id FROM organizations WHERE organization_uuid = 'YOUR_ORG_UUID'
);
```

**Expected Result:**
- Both tables should show matching enabled/disabled states
- QR Attendance: ✅ enabled in both tables
- Employee Feedback: ✅ enabled in both tables
- Face Recognition: ❌ disabled in both tables
- Hiring Management: ❌ disabled in both tables

---

## 🔍 API Testing with Postman/cURL

### 1. Get Active Modules (ORG_ADMIN)
```bash
curl -X GET http://localhost:8080/api/modules/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Active modules retrieved successfully",
  "data": [
    {
      "moduleId": 1,
      "name": "QR Code Attendance Marking",
      "moduleKey": "moduleQrAttendanceMarking",
      "description": "...",
      "icon": "QrCode",
      "category": "Attendance",
      "price": 199.99,
      "active": true
    },
    // ... more active modules
  ]
}
```

### 2. Get All Modules (SYS_ADMIN Only)
```bash
curl -X GET http://localhost:8080/api/sys_admin/modules \
  -H "Authorization: Bearer YOUR_SYSADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Create New Module (SYS_ADMIN Only)
```bash
curl -X POST http://localhost:8080/api/sys_admin/modules \
  -H "Authorization: Bearer YOUR_SYSADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Module",
    "moduleKey": "moduleApiTest",
    "description": "Created via API",
    "icon": "TestTube",
    "category": "Testing",
    "price": 49.99,
    "isActive": true
  }'
```

### 4. Get Organization Modules
```bash
curl -X GET http://localhost:8080/api/organization-modules/{organizationUuid}/enabled \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 5. Sync Organization Modules
```bash
curl -X POST http://localhost:8080/api/organization-modules/{organizationUuid}/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🐛 Troubleshooting

### Issue: Tables don't exist
**Solution:**
```sql
-- Check if tables exist
SHOW TABLES LIKE '%modules%';

-- If not, run the schema SQL script again
```

### Issue: No modules showing for ORG_ADMIN
**Possible Causes:**
1. All modules are inactive (`isActive = false`)
2. API endpoint not returning data

**Solution:**
```sql
-- Check if any active modules exist
SELECT * FROM extended_modules WHERE is_active = TRUE;

-- If none, activate at least one module
UPDATE extended_modules 
SET is_active = TRUE 
WHERE module_key = 'moduleQrAttendanceMarking';
```

### Issue: Module configuration not syncing to organization_modules
**Check:**
```sql
-- Verify OrganizationModuleService is being called
-- Check backend logs for:
-- "Syncing modules for organization: {uuid}"

-- Manually trigger sync via API
curl -X POST http://localhost:8080/api/organization-modules/{orgUuid}/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: Backend compilation errors
**Common fixes:**
```bash
# Clean and rebuild
mvn clean
mvn install -DskipTests

# If still failing, check:
# 1. Java version (should be 17+)
java -version

# 2. Maven version
mvn -version

# 3. Dependencies
mvn dependency:tree
```

### Issue: Frontend not showing modules page
**Check:**
1. Route is defined in App.jsx
```javascript
// Should exist
<Route path="/sys_admin/modules" element={<Modules />} />
```

2. Import is correct
```javascript
import Modules from './pages/sys_admin/Modules';
```

3. Navigation link exists in admin dashboard

---

## 📊 Verify Everything is Working

### Backend Health Check
```bash
# Check if server is running
curl http://localhost:8080/actuator/health

# Check if extended modules endpoint works
curl http://localhost:8080/api/modules/active
```

### Database Verification
```sql
-- Should return 8 rows
SELECT COUNT(*) FROM extended_modules;

-- Should return 4 rows
SELECT COUNT(*) FROM extended_modules WHERE is_active = TRUE;

-- Check junction table structure
DESCRIBE organization_modules;
```

### Frontend Verification
1. Open browser: http://localhost:5173
2. Login as SYS_ADMIN
3. Navigate to Modules page
4. Should see statistics and module cards

---

## ✅ Success Criteria

You've successfully set up the system if:
- ✅ Backend compiles without errors
- ✅ Database tables are created and seeded
- ✅ SYS_ADMIN can view/create/edit/delete modules
- ✅ ORG_ADMIN sees only active modules in configuration
- ✅ Module configuration saves to both Organization table and organization_modules table
- ✅ API endpoints return expected data

---

## 🎯 Next Steps

### For Development:
1. Add new modules via UI or SQL
2. Implement billing based on module prices
3. Add module usage analytics
4. Create module dependency system

### For Testing:
1. Test with multiple organizations
2. Test module activation/deactivation
3. Test cascade deletes
4. Load test with many modules

### For Production:
1. Backup database before deployment
2. Run migrations on production database
3. Test with production data
4. Monitor logs for sync operations

---

## 📞 Need Help?

### Check Logs:
```bash
# Backend logs
tail -f backend/logs/spring.log

# Frontend browser console
F12 → Console tab
```

### Common Log Messages:
- ✅ `"Organization modules synced successfully"` - Sync worked
- ❌ `"Failed to sync organization modules"` - Check database connection
- ✅ `"Module created successfully"` - Module creation worked
- ❌ `"Module name already exists"` - Duplicate name

### Database Queries for Debugging:
```sql
-- See all modules
SELECT * FROM extended_modules;

-- See all org-module relationships
SELECT * FROM organization_modules;

-- See sync status
-- (Use the query from MODULE_KEY_MAPPING_REFERENCE.sql)
```

---

**Happy Testing! 🚀**

For detailed documentation, see: `ORGANIZATION_MODULES_IMPLEMENTATION.md`
