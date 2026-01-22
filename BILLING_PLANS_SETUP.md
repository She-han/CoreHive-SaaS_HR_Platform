# Billing Plans System - Setup Instructions

## Overview
The Billing Plans system is a complete CRUD application for managing billing plans with features, pricing, and popularity markers.

## Backend Files Created/Updated

### 1. **Entity** - `backend/src/main/java/com/corehive/backend/model/BillingPlan.java`
- Defines the database table structure for billing plans
- Includes features as an element collection
- Has timestamps for audit trail

### 2. **DTO** - `backend/src/main/java/com/corehive/backend/dto/BillingPlanDTO.java`
- Data Transfer Object for API communication
- Used for request/response payloads

### 3. **Repository** - `backend/src/main/java/com/corehive/backend/repository/BillingPlanRepository.java`
- Extends JpaRepository for database operations
- Custom queries for filtering active/popular plans

### 4. **Service** - `backend/src/main/java/com/corehive/backend/service/BillingPlanService.java`
- Business logic layer
- CRUD operations with validation
- Entity/DTO conversion

### 5. **Controller** - `backend/src/main/java/com/corehive/backend/controller/BillingPlanController.java`
- REST API endpoints
- Handles HTTP requests
- CORS enabled for frontend access

### 6. **Frontend Component** - `frontend/src/pages/admin/BillingAndPlans.jsx`
- Complete UI for managing billing plans
- Create, Read, Update, Delete operations
- Feature management (add/remove)
- Popular plan highlighting
- Modal form for editing/creating

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing-plans` | Get all plans |
| GET | `/api/billing-plans/active` | Get active plans only |
| GET | `/api/billing-plans/popular` | Get popular plans |
| GET | `/api/billing-plans/{id}` | Get plan by ID |
| POST | `/api/billing-plans` | Create new plan |
| PUT | `/api/billing-plans/{id}` | Update plan |
| DELETE | `/api/billing-plans/{id}` | Delete plan |
| PATCH | `/api/billing-plans/{id}/deactivate` | Deactivate plan |

## Setup Steps

### Step 1: Database Setup
```sql
-- Run the init-billing-plans.sql script in MySQL
mysql> USE corehive_db;
mysql> SOURCE init-billing-plans.sql;
```

Or manually execute the SQL to create the tables:
```sql
CREATE TABLE IF NOT EXISTS billing_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    price VARCHAR(50) NOT NULL,
    period VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    employees VARCHAR(100) NOT NULL,
    popular BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_features (
    billing_plan_id BIGINT NOT NULL,
    feature VARCHAR(255) NOT NULL,
    FOREIGN KEY (billing_plan_id) REFERENCES billing_plans(id) ON DELETE CASCADE
);

CREATE INDEX idx_billing_plans_active ON billing_plans(active);
CREATE INDEX idx_billing_plans_popular ON billing_plans(popular);
```

### Step 2: Backend Configuration
Ensure `application.properties` has correct settings:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/corehive_db
spring.datasource.username=root
spring.datasource.password=@KmAC0752953983
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

### Step 3: Start Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Step 4: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 5: Access the Application
Navigate to: `http://localhost:3000/admin/billing-plans`

## Key Features

✅ **Create Plans**
- Add new billing plans with custom pricing
- Define employee limits
- Add multiple features
- Mark as "Most Popular"

✅ **Edit Plans**
- Modify existing plan details
- Update features (add/remove)
- Change pricing and popularity status

✅ **Delete Plans**
- Remove plans with confirmation
- Soft delete option available

✅ **UI/UX**
- Responsive grid layout (3 columns on desktop)
- Animated card transitions
- Real-time form validation
- Error handling and user feedback
- Feature management with easy add/remove
- Popular plan highlighting with badge

## Testing the API

### Using cURL

**Get all plans:**
```bash
curl http://localhost:8080/api/billing-plans
```

**Create a plan:**
```bash
curl -X POST http://localhost:8080/api/billing-plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Starter",
    "price": "2,500",
    "period": "/month",
    "description": "Perfect for small teams",
    "employees": "Up to 25 employees",
    "features": ["Feature 1", "Feature 2"],
    "popular": false,
    "active": true
  }'
```

**Update a plan:**
```bash
curl -X PUT http://localhost:8080/api/billing-plans/1 \
  -H "Content-Type: application/json" \
  -d '{...updated data...}'
```

**Delete a plan:**
```bash
curl -X DELETE http://localhost:8080/api/billing-plans/1
```

## Troubleshooting

### 404 Error on API Calls
- Ensure backend is running on `http://localhost:8080`
- Check CORS configuration in `BillingPlanController`
- Verify the controller mapping is correct

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `application.properties`
- Ensure `corehive_db` database exists

### Frontend Not Fetching Data
- Check browser console for error messages
- Verify backend API URL is correct (`http://localhost:8080`)
- Ensure CORS is enabled on the backend controller

### Modal Not Showing Features
- Check that features are being added correctly
- Verify `featureInput` state is being cleared after adding
- Check browser console for React errors

## Database Schema

### billing_plans Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| price | VARCHAR(50) | NOT NULL |
| period | VARCHAR(50) | NOT NULL |
| description | TEXT | NOT NULL |
| employees | VARCHAR(100) | NOT NULL |
| popular | BOOLEAN | DEFAULT false |
| active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | AUTO_UPDATE |

### plan_features Table
| Column | Type | Constraints |
|--------|------|-------------|
| billing_plan_id | BIGINT | FOREIGN KEY (billing_plans.id) |
| feature | VARCHAR(255) | NOT NULL |

## Future Enhancements

- [ ] Search and filter functionality
- [ ] Bulk operations (upload/download plans)
- [ ] Plan templates/cloning
- [ ] Advanced analytics on plan usage
- [ ] Pricing history tracking
- [ ] Plan version management
- [ ] Integration with subscription management

## Support

For issues or questions, refer to:
- Backend logs: Check Spring Boot console output
- Frontend logs: Check browser DevTools console
- Database: Run `SELECT * FROM billing_plans;` to verify data
