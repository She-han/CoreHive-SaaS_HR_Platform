# Billing Plans System - Troubleshooting Guide

## Common Errors and Solutions

---

## 🔴 Error 1: "Failed to fetch plans: 404 Not Found"

### Symptoms
```
Error fetching plans: SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
:3000/api/billing-plans:1 Failed to load resource: the server responded with a status of 404
```

### Root Cause
The frontend is trying to fetch from a non-existent API endpoint. This happens because:
1. Backend is not running on port 8080
2. URL is incorrect (relative instead of absolute)
3. Controller is not properly mapped

### Solution

**Step 1: Verify Backend is Running**
```bash
# Check if backend is running
curl http://localhost:8080/api/billing-plans

# Should return:
# [] or
# [{"id":1,"name":"Starter",...}]
```

**Step 2: Check Frontend URL**
Open `frontend/src/pages/admin/BillingAndPlans.jsx`

Line 33 should be:
```javascript
const API_BASE_URL = 'http://localhost:8080';
```

NOT:
```javascript
const API_BASE_URL = 'http://localhost:3000';  // ❌ WRONG
// or
// const response = await fetch('/api/billing-plans');  // ❌ WRONG
```

**Step 3: Restart Backend**
```bash
# Terminal where backend is running
Ctrl + C  # Stop backend
mvn spring-boot:run  # Start again
```

Wait for: `Started Application in X seconds`

**Step 4: Refresh Browser**
- Press `Ctrl + R` or `Cmd + R`
- Check Network tab (F12)
- Should see request to `http://localhost:8080/api/billing-plans`

---

## 🔴 Error 2: "CORS policy: No 'Access-Control-Allow-Origin' header"

### Symptoms
```
Access to XMLHttpRequest at 'http://localhost:8080/api/billing-plans' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

### Root Cause
Backend is not allowing cross-origin requests from the frontend.

### Solution

**Step 1: Check Controller CORS Configuration**
File: `backend/src/main/java/com/corehive/backend/controller/BillingPlanController.java`

Line 16 should have:
```java
@CrossOrigin(origins = "*", maxAge = 3600)
// or
@CrossOrigin(origins = {"http://localhost:3000"}, maxAge = 3600)
```

**Step 2: If Missing, Add It**
```java
@RestController
@RequestMapping("/api/billing-plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)  // ← Add this line
public class BillingPlanController {
    // ... rest of code
}
```

**Step 3: Rebuild and Restart Backend**
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

**Step 4: Clear Browser Cache**
- Developer Tools (F12)
- Right-click Refresh button → "Empty cache and hard refresh"
- Or press `Ctrl + Shift + R`

---

## 🔴 Error 3: "Access denied for user 'root'@'localhost'"

### Symptoms
```
java.sql.SQLException: Access denied for user 'root'@'localhost'
```

### Root Cause
Database credentials in `application.properties` are incorrect.

### Solution

**Step 1: Check Credentials**
File: `backend/src/main/resources/application.properties`

```properties
spring.datasource.username=root
spring.datasource.password=@KmAC0752953983  # Update this if different
spring.datasource.url=jdbc:mysql://localhost:3306/corehive_db
```

**Step 2: Verify Correct Password**
```bash
# Try connecting directly
mysql -u root -p
# Enter your password when prompted
```

If you get `ERROR 1045 (28000): Access denied`, your password is wrong.

**Step 3: Update application.properties**
Replace the password with your actual MySQL password:
```properties
spring.datasource.password=YOUR_ACTUAL_PASSWORD
```

**Step 4: Restart Backend**
```bash
mvn spring-boot:run
```

---

## 🔴 Error 4: "Table 'corehive_db.billing_plans' doesn't exist"

### Symptoms
```
[ERROR] No table billing_plans in the given schema 'corehive_db'
```

### Root Cause
Database tables were not created.

### Solution

**Step 1: Verify Database Exists**
```bash
mysql -u root -p
```

```sql
SHOW DATABASES;
```

Look for `corehive_db` in the list.

**Step 2: If Database Doesn't Exist, Create It**
```sql
CREATE DATABASE corehive_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE corehive_db;
```

**Step 3: Create Tables**
Run one of these:

**Option A: Using SQL Script**
```bash
mysql -u root -p corehive_db < BILLING_PLANS_DATABASE_SETUP.sql
```

**Option B: Manual SQL**
```sql
USE corehive_db;

CREATE TABLE billing_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,
    period VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    employees VARCHAR(100) NOT NULL,
    popular BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE plan_features (
    billing_plan_id BIGINT NOT NULL,
    feature VARCHAR(255) NOT NULL,
    FOREIGN KEY (billing_plan_id) REFERENCES billing_plans(id) ON DELETE CASCADE
);
```

**Step 4: Verify Tables**
```sql
SHOW TABLES;
DESCRIBE billing_plans;
DESCRIBE plan_features;
```

**Step 5: Restart Backend**
```bash
mvn spring-boot:run
```

---

## 🔴 Error 5: "Modal not opening when clicking 'Add New Plan'"

### Symptoms
- Click button but modal doesn't appear
- No console errors
- Button seems unresponsive

### Root Cause
State management issue or React rendering problem.

### Solution

**Step 1: Check Browser Console**
Open DevTools (F12) → Console tab
Look for JavaScript errors

**Step 2: Verify Modal Code**
File: `frontend/src/pages/admin/BillingAndPlans.jsx`

Check line ~335:
```javascript
{showModal && (
  <motion.div ...>
    {/* Modal content */}
  </motion.div>
)}
```

**Step 3: Check Click Handler**
Check "Add New Plan" button (line ~115):
```javascript
<Button
  variant="primary"
  size="lg"
  icon={Plus}
  onClick={() => handleOpenModal()}  // ← Must be there
>
  Add New Plan
</Button>
```

**Step 4: Verify handleOpenModal Function**
Should exist around line ~68:
```javascript
const handleOpenModal = (plan = null) => {
  if (plan) {
    // Edit mode
  } else {
    // Create mode
  }
  setShowModal(true);  // ← Must have this
};
```

**Step 5: Check Motion Component**
Ensure framer-motion is installed:
```bash
npm list framer-motion
# Should show version, e.g., framer-motion@10.x.x
```

If missing:
```bash
npm install framer-motion
```

**Step 6: Restart Frontend**
```bash
Ctrl + C
npm run dev
```

---

## 🔴 Error 6: "Features not saving in database"

### Symptoms
- Features appear in form but don't save
- Database only shows empty features list
- No error in console

### Root Cause
`@ElementCollection` not properly configured or features list not populated.

### Solution

**Step 1: Check Entity Mapping**
File: `backend/src/main/java/com/corehive/backend/model/BillingPlan.java`

Should have:
```java
@ElementCollection(fetch = FetchType.EAGER)
@CollectionTable(name = "plan_features", 
    joinColumns = @JoinColumn(name = "billing_plan_id"))
@Column(name = "feature")
private List<String> features = new ArrayList<>();
```

**Step 2: Check DTO**
File: `backend/src/main/java/com/corehive/backend/dto/BillingPlanDTO.java`

Should have:
```java
private List<String> features = new ArrayList<>();
```

**Step 3: Check Service Conversion**
File: `backend/src/main/java/com/corehive/backend/service/BillingPlanService.java`

In `convertToEntity()` method:
```java
plan.setFeatures(dto.getFeatures());  // ← Must copy features
```

**Step 4: Verify Table Structure**
```sql
DESCRIBE plan_features;
```

Should show:
```
billing_plan_id | BIGINT | (Foreign Key)
feature        | VARCHAR(255) |
```

**Step 5: Test with Direct SQL**
```sql
INSERT INTO plan_features (billing_plan_id, feature) 
VALUES (1, 'Test Feature');

SELECT * FROM plan_features WHERE billing_plan_id = 1;
```

Should show the inserted feature.

**Step 6: Check Frontend Form Data**
In browser console, add log:
```javascript
// In handleSubmit() before fetch
console.log('Form data being sent:', formData);
```

Should show:
```javascript
{
  name: "Starter",
  price: "2,500",
  features: ["Feature 1", "Feature 2", ...],
  ...
}
```

---

## 🔴 Error 7: "Popular badge not showing"

### Symptoms
- Can mark plan as popular
- Badge doesn't appear
- Data saves but UI doesn't reflect it

### Root Cause
Conditional rendering or CSS issue.

### Solution

**Step 1: Check UI Logic**
File: `frontend/src/pages/admin/BillingAndPlans.jsx`

Line ~248 should have:
```javascript
{plan.popular && (
  <motion.div ...>
    <span className="bg-[#02C39A] ...">
      Most Popular
    </span>
  </motion.div>
)}
```

**Step 2: Verify Data**
Check Network tab (F12):
```json
{
  "id": 2,
  "name": "Professional",
  "popular": true,  // ← Must be true
  ...
}
```

**Step 3: Check Card Ring Styling**
Line ~244 should have:
```javascript
className={`relative h-full flex flex-col ${
  plan.popular
    ? 'ring-2 ring-[#02C39A] shadow-xl ...'  // ← Should apply
    : 'hover:shadow-lg'
}`}
```

**Step 4: Hard Refresh Browser**
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (macOS)
```

**Step 5: Check Database**
```sql
SELECT * FROM billing_plans WHERE popular = true;
```

Should show your popular plans.

---

## 🔴 Error 8: "Port 8080 already in use"

### Symptoms
```
Address already in use: bind
Port 8080 is already in use
```

### Root Cause
Another application is running on port 8080 or backend process didn't fully stop.

### Solution

**Step 1: Find Process Using Port 8080**

**Windows:**
```bash
netstat -ano | findstr :8080
# Example output: TCP  0.0.0.0:8080  0.0.0.0:0  LISTENING  12345

# Kill the process (12345 is the PID)
taskkill /PID 12345 /F
```

**macOS/Linux:**
```bash
lsof -i :8080
# Example output: java  12345  user  10u  IPv4  0x...

# Kill the process
kill -9 12345
```

**Step 2: Check Backend Process**
```bash
# Find all Java processes
ps aux | grep java

# Kill if needed
pkill -f spring-boot
```

**Step 3: Restart Backend**
```bash
mvn spring-boot:run
```

---

## 🔴 Error 9: "Frontend won't start - npm error"

### Symptoms
```
npm ERR! code ENOENT
npm ERR! errno -4058
npm ERR! syscall open
npm ERR! enoent: no such file or directory
```

### Root Cause
Missing dependencies or node_modules folder.

### Solution

**Step 1: Delete node_modules**
```bash
cd frontend
rm -rf node_modules package-lock.json
# On Windows:
# rmdir /s /q node_modules
# del package-lock.json
```

**Step 2: Reinstall Dependencies**
```bash
npm install
```

**Step 3: Start Frontend**
```bash
npm run dev
```

**Step 4: If Still Failing**
Check `package.json` has dependencies:
```json
{
  "dependencies": {
    "react": "^18.x",
    "framer-motion": "^10.x",
    "lucide-react": "^0.x",
    ...
  }
}
```

---

## 🔴 Error 10: "500 Internal Server Error"

### Symptoms
```
Failed to save plan: Error: Failed to save plan
Backend returns: 500 Internal Server Error
```

### Root Cause
Backend exception during request processing.

### Solution

**Step 1: Check Backend Logs**
Look at terminal where `mvn spring-boot:run` is running.

Should show error like:
```
java.sql.SQLException: ...
or
java.lang.NullPointerException: ...
```

**Step 2: Common Causes**

**Cause A: Null Request Body**
```
Error: Incoming request content-type was null
```
Solution: Ensure `Content-Type: application/json` header is sent

**Cause B: Database Constraint Violation**
```
Duplicate entry for key 'name'
```
Solution: Plan with same name already exists, use different name

**Cause C: Missing Required Fields**
```
Column 'name' cannot be null
```
Solution: Ensure all required fields are sent in request

**Step 3: Enable Debug Logging**
In `application.properties`:
```properties
logging.level.com.corehive.backend=DEBUG
logging.level.org.hibernate.SQL=DEBUG
spring.jpa.show-sql=true
```

Restart backend and check detailed logs.

**Step 4: Test API with Curl**
```bash
curl -X POST http://localhost:8080/api/billing-plans \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test",
    "price":"1000",
    "period":"/month",
    "description":"Test",
    "employees":"10",
    "features":["f1"]
  }'
```

---

## 📋 Quick Diagnostic Checklist

```
Is Backend Running?
☐ Can access http://localhost:8080/api/billing-plans
☐ Console shows "Started Application"
☐ No port conflicts (netstat -ano)

Is Frontend Running?
☐ Can access http://localhost:3000
☐ No npm errors
☐ Page loads without JavaScript errors

Is Database Connected?
☐ MySQL running
☐ corehive_db database exists
☐ billing_plans table exists
☐ Can query tables directly

Is Network Communication Working?
☐ Browser Network tab shows requests to localhost:8080
☐ Requests return 200 status
☐ No CORS errors
☐ Response is valid JSON

Is Code Configured Correctly?
☐ API_BASE_URL = 'http://localhost:8080'
☐ @CrossOrigin annotation present
☐ Database credentials correct
☐ Entity/DTO mapping correct
```

---

## 🆘 Still Not Working?

**Try These Steps in Order:**

1. **Full Restart**
   ```bash
   # Stop both servers (Ctrl+C)
   # Stop MySQL
   # Wait 10 seconds
   # Start MySQL
   # Start Backend (wait for "Started")
   # Start Frontend
   ```

2. **Clear All Caches**
   ```bash
   # Browser: Ctrl+Shift+Delete → Clear all
   # Frontend: Ctrl+Shift+R
   # Node: rm -rf frontend/node_modules && npm install
   ```

3. **Database Reset** (if safe to do)
   ```sql
   DROP TABLE plan_features;
   DROP TABLE billing_plans;
   -- Run BILLING_PLANS_DATABASE_SETUP.sql
   ```

4. **Check Logs**
   - Backend console: Look for stack traces
   - Browser DevTools: Console and Network tabs
   - MySQL log: Check connection errors

5. **Verify Versions**
   ```bash
   java -version
   mvn -version
   npm -version
   node -version
   ```

6. **Ask for Help** with:
   - Full error message (copy-paste)
   - Console screenshot
   - Backend logs
   - What you've tried

---

**If All Else Fails:** Restart everything from Step 1 of Quick Start Guide.

Good luck! 🍀
