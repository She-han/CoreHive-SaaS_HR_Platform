# Leave and Attendance Configuration - Complete Implementation

## 🎯 සිංහල Explanation (Modern Spoken)

මේ system එකෙන් organization admin කෙනෙකුට පුළුවන්:

### 1. Leave Types Management (Leave Types Tab එකේ):
- **අලුත් leave types add කරන්න:** Sick Leave, Annual Leave, Casual Leave වගේ විවිධ වර්ග
- **Default days set කරන්න:** සෑම leave type එකක්ම default කීයක් days එකක් දෙනවද (උදා: Annual = 15 days)
- **Edit/Delete කරන්න:** ඕනෑම leave type එකක් update හෝ remove කරන්න
- **Requires Approval:** Leave request එකට approval එකක් ඕනේද නැද්ද define කරන්න

### 2. Attendance Configuration (Attendance Settings Tab එකේ):

**Time Rules Define කරන්න:**
- **Working Hours (රැකියා වේලාව):** උදෑසන 9:00 AM - සවස 5:00 PM
- **Late Threshold:** 9:30 AM ට පස්සේ check-in කරොත් "LATE" status එක
- **Evening Half Day:** 1:00 PM ට පස්සේ check-in කරොත් "HALF_DAY" (උදෑසන missed)
- **Absent Threshold:** 3:00 PM ට පස්සේ check-in කරොත් "ABSENT"
- **Morning Half Day:** 2:00 PM ට කලින් check-out කරොත් "HALF_DAY" (evening missed)
- **OT Start Time:** 6:00 PM ට පස්සේ වැඩ කරොත් Overtime
- **Leave Deduction:** වැඩියෙන් ගත්ත leaves වලට deduction amount

**Application Levels (කාට apply වෙනවද):**
- **All Employees:** Organization පුරාම එකම rule set එක
- **Department-wise:** IT, HR, Finance වගේ departments වලට වෙනස් rules
- **Designation-wise:** Manager, Senior Staff, Junior Staff වලට වෙනස් rules
- **Employee-specific:** විශේෂ employees කෙනෙක්ටම විශේෂ rules

### 3. Auto Status Determination (Automatic Processing):

**Employee check-in/out කරද්දී:**
1. System එක එයාට applicable වෙන configuration එක හොයනවා (Priority order: Employee-specific > Designation > Department > Organization)
2. Check-in time එක compare කරනවා defined thresholds එක්ක:
   - Before lateThreshold → PRESENT
   - After lateThreshold but before eveningHalfDay → LATE
   - After eveningHalfDay but before absent → HALF_DAY
   - After absent → ABSENT
3. Check-out time එක compare කරනවා:
   - Before morningHalfDay → HALF_DAY
   - After otStart → OT hours calculate කරනවා
4. Database එකේ save වෙනවා

### 4. OT Calculation (Overtime):
- Check-out time > OT Start Time නම්
- OT Hours = Check-out Time - OT Start Time
- මේක decimal format එකේ save වෙනවා (උදා: 2.5 hours)

## Backend Files Created:

### 1. AttendanceConfiguration.java (Entity)
- Working time thresholds
- Application type (ALL/DEPT/DESIGNATION/EMPLOYEE)
- Leave deduction amount
- Multi-tenant support

### 2. AttendanceConfigurationRepository.java
- Find applicable configs with priority order
- Query by organization, department, designation, employee

### 3. AttendanceConfigurationService.java
- CRUD operations
- Find most specific applicable configuration for an employee
- Priority: Employee > Designation > Department > Organization

### 4. LeaveTypeService.java (Updated)
- Create/Update/Delete leave types
- Get active leave types

### 5. Controllers:
- **LeaveTypeController:** POST, PUT, DELETE endpoints
- **AttendanceConfigurationController:** Full CRUD

### 6. Attendance.java (Updated)
- Added `otHours` field (BigDecimal)

## Frontend Files:

### 1. leaveTypeApi.js (Updated)
- createLeaveType()
- updateLeaveType()
- deleteLeaveType()

### 2. attendanceConfigApi.js (New)
- getAllConfigurations()
- createConfiguration()
- updateConfiguration()
- deleteConfiguration()

### 3. LeaveAndAttendanceConfigure.jsx (Main Component)
See complete implementation below...

---

## 🚀 How It Works:

### Scenario 1: Organization-wide Rule
```
Admin creates: "Default Rule" for ALL_EMPLOYEES
- Work: 9:00 AM - 5:00 PM
- Late after: 9:30 AM
- OT after: 6:00 PM
```
**Result:** සියලුම employees කට මේ rule apply වෙනවා

### Scenario 2: Department-specific Rule
```
Admin creates: "IT Department Rule" for DEPARTMENT_WISE (IT Dept)
- Work: 10:00 AM - 6:00 PM
- Late after: 10:30 AM
- OT after: 7:00 PM
```
**Result:** IT department එකේ employees කට වෙනස් rules, අනිත් අයට default rules

### Scenario 3: Employee-specific Override
```
Admin creates: "Manager John Rule" for EMPLOYEE_SPECIFIC (John)
- Work: 8:00 AM - 4:00 PM
- No late threshold (flexible)
```
**Result:** John ට විශේෂ rules, priority highest නිසා ඔහුගේ dept/designation rules override වෙනවා

### Check-in Processing Example:
```
Employee: Sarah (IT Department)
Check-in time: 10:45 AM
Applicable config: IT Department Rule (late threshold = 10:30 AM)

System determines:
- 10:45 AM > 10:30 AM → Status = LATE
- Saves attendance with LATE status automatically
```

### OT Calculation Example:
```
Employee: Mike
Config OT Start: 6:00 PM
Check-out: 8:30 PM

Calculation:
- 8:30 PM - 6:00 PM = 2.5 hours
- otHours = 2.50 (saved in database)
```

## Database Schema:

### attendance_configuration table:
```sql
- id
- organization_uuid
- name
- work_start_time
- work_end_time
- late_threshold
- evening_half_day_threshold
- absent_threshold
- morning_half_day_threshold
- ot_start_time
- leave_deduction_amount
- application_type (ENUM)
- department_id (nullable)
- designation (nullable)
- employee_id (nullable)
- is_active
- created_at
- updated_at
```

### attendance table (updated):
```sql
... existing fields ...
+ ot_hours (DECIMAL(5,2))
```

## Next Steps:

1. **Backend:** Restart Spring Boot application
2. **Database:** Tables will be auto-created by Hibernate
3. **Frontend:** npm run dev
4. **Test:** Navigate to Leave & Attendance Configure page
5. **Add Rules:** Create leave types and attendance configurations
6. **Test Attendance:** Mark attendance and verify auto-status determination

## මතක තියාගන්න Important Points:

1. **Priority matters:** Employee-specific configurations override department/designation rules
2. **One rule per level:** එක organization එකකට එක ALL_EMPLOYEES config එකක් විතරයි recommended
3. **Flexible targeting:** වෙනස් groups වලට වෙනස් rules දාන්න පුළුවන්
4. **Auto processing:** Manual attendance marking වලදීත් auto-status එක work කරනවා
5. **OT tracking:** Overtime hours automatically calculate වෙලා save වෙනවා payroll වලට use කරන්න

---

Full LeaveAndAttendanceConfigure.jsx component code will be created in the next file...

