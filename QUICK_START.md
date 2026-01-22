# 🚀 Billing Plans System - Quick Start Guide

## What Was Created/Updated

### ✅ Backend (Java Spring Boot)
All backend files already exist and are properly configured:
- **Entity**: `BillingPlan.java` - Database model
- **DTO**: `BillingPlanDTO.java` - API communication object
- **Repository**: `BillingPlanRepository.java` - Database access layer
- **Service**: `BillingPlanService.java` - Business logic
- **Controller**: `BillingPlanController.java` - REST API endpoints

### ✅ Frontend (React)
- **Component**: `BillingAndPlans.jsx` - Complete UI with CRUD operations

### ✅ Supporting Files
- `init-billing-plans.sql` - Database initialization script
- `BILLING_PLANS_SETUP.md` - Detailed setup guide
- `VERIFICATION_CHECKLIST.md` - Testing checklist

---

## 🎯 Quick Start (5 Steps)

### Step 1: Setup Database
```bash
# Open MySQL and run:
mysql -u root -p
```
```sql
USE corehive_db;
SOURCE /path/to/init-billing-plans.sql;
```

### Step 2: Start Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
✅ Should show: `Started Application in X seconds`

### Step 3: Verify Backend
Open in browser: `http://localhost:8080/api/billing-plans`
Should see: `[]` or array of plans

### Step 4: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
✅ Should show: `Local: http://localhost:3000`

### Step 5: Access Application
Navigate to: `http://localhost:3000/admin/billing-plans`

---

## 📝 What the System Does

### Features
✅ **Create** - Add new billing plans with features
✅ **Read** - View all plans in a beautiful grid
✅ **Update** - Edit existing plans
✅ **Delete** - Remove plans (with confirmation)
✅ **Features** - Add/remove features dynamically
✅ **Popular** - Mark plans as "Most Popular"

### Plan Attributes
- **Name**: Plan name (e.g., "Starter")
- **Price**: LKR amount or "Custom"
- **Period**: Billing period (e.g., "/month")
- **Description**: Plan description
- **Employees**: Maximum employee count
- **Features**: List of included features
- **Popular**: Boolean flag for highlighting

---

## 🔧 Configuration Files

### Backend: `application.properties`
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/corehive_db
spring.datasource.username=root
spring.datasource.password=@KmAC0752953983
spring.jpa.hibernate.ddl-auto=update
```

### Frontend: `BillingAndPlans.jsx`
```javascript
const API_BASE_URL = 'http://localhost:8080';
```

---

## 🧪 Testing

### Quick API Test
```bash
# Get all plans
curl http://localhost:8080/api/billing-plans

# Create plan
curl -X POST http://localhost:8080/api/billing-plans \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":"1000","period":"/month","description":"Test plan","employees":"10","features":["F1","F2"]}'

# Update plan
curl -X PUT http://localhost:8080/api/billing-plans/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","price":"2000",...}'

# Delete plan
curl -X DELETE http://localhost:8080/api/billing-plans/1
```

### UI Testing
1. Click "Add New Plan" - Opens modal
2. Fill form and add features
3. Click "Create Plan" - Plan appears in grid
4. Click "Edit" - Modal opens with existing data
5. Click "Delete" - Shows confirmation, then removes plan

---

## ❌ Troubleshooting

### Problem: 404 Error
```
Failed to fetch plans: 404 Not Found
```
**Solution:**
- Check backend is running: `http://localhost:8080/api/billing-plans`
- Verify URL in BillingAndPlans.jsx line 33
- Restart backend server

### Problem: Database Connection Error
```
Access denied for user 'root'@'localhost'
```
**Solution:**
- Verify MySQL is running
- Check password in application.properties
- Ensure corehive_db database exists

### Problem: CORS Error in Browser Console
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Backend has `@CrossOrigin(origins = "*")`
- Ensure frontend is on different port than backend
- Clear browser cache and restart

### Problem: Features Not Saving
**Solution:**
- Check `features` array in form data
- Verify plan_features table exists
- Check browser console for specific errors

---

## 📚 API Reference

### Base URL
```
http://localhost:8080
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/billing-plans` | Get all plans |
| GET | `/api/billing-plans/active` | Get active plans |
| GET | `/api/billing-plans/popular` | Get popular plans |
| GET | `/api/billing-plans/{id}` | Get plan by ID |
| POST | `/api/billing-plans` | Create plan |
| PUT | `/api/billing-plans/{id}` | Update plan |
| DELETE | `/api/billing-plans/{id}` | Delete plan |

### Request Body (POST/PUT)
```json
{
  "name": "Starter",
  "price": "2,500",
  "period": "/month",
  "description": "Perfect for small teams",
  "employees": "Up to 25 employees",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "popular": false,
  "active": true
}
```

### Response (GET)
```json
[
  {
    "id": 1,
    "name": "Starter",
    "price": "2,500",
    "period": "/month",
    "description": "Perfect for small teams",
    "employees": "Up to 25 employees",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "popular": false,
    "active": true
  }
]
```

---

## 🎨 UI Features

✨ **Responsive Design**
- 3-column grid on desktop
- Adapts to tablets and mobile

✨ **Animations**
- Smooth card transitions
- Modal animations
- Feature list animations

✨ **Popular Plan Highlighting**
- Green badge "Most Popular"
- Gradient background
- Ring border

✨ **Error Handling**
- Red alert boxes with icons
- Detailed error messages
- Form validation

✨ **Loading States**
- Skeleton loading animation
- Loading spinner
- Disabled buttons during submission

---

## 📊 Database Schema

### billing_plans
```sql
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
```

### plan_features
```sql
CREATE TABLE plan_features (
  billing_plan_id BIGINT NOT NULL,
  feature VARCHAR(255) NOT NULL,
  FOREIGN KEY (billing_plan_id) REFERENCES billing_plans(id) ON DELETE CASCADE
);
```

---

## 🚀 Next Steps

After verifying everything works:

1. **Add Navigation** - Link from main admin panel
2. **Add Permissions** - Restrict to admin users only
3. **Add Logging** - Log all plan changes
4. **Add Notifications** - Notify on plan updates
5. **Add Analytics** - Track plan popularity

---

## 📞 Support

If you encounter issues:
1. Check the **VERIFICATION_CHECKLIST.md**
2. Review browser console (F12 → Console tab)
3. Check backend logs (terminal where mvn was run)
4. Verify database tables exist: `SHOW TABLES;`

---

**Everything is ready to go! 🎉**
