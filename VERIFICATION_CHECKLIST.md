# Billing Plans System - Verification Checklist

## Pre-Launch Checklist

### Database
- [ ] MySQL is installed and running
- [ ] Database `corehive_db` exists
- [ ] `billing_plans` table created
- [ ] `plan_features` table created
- [ ] Sample data inserted (optional)

### Backend (Java/Spring Boot)
- [ ] BillingPlan.java entity exists
- [ ] BillingPlanDTO.java exists
- [ ] BillingPlanRepository.java exists
- [ ] BillingPlanService.java exists
- [ ] BillingPlanController.java exists with @RestController annotation
- [ ] application.properties configured with correct database credentials
- [ ] Backend runs without errors: `mvn spring-boot:run`
- [ ] API responds to: `http://localhost:8080/api/billing-plans`

### Frontend (React)
- [ ] BillingAndPlans.jsx component created in `frontend/src/pages/admin/`
- [ ] Component uses correct API URL: `http://localhost:8080`
- [ ] All imports are available (framer-motion, lucide-react, etc.)
- [ ] DashboardLayout component exists
- [ ] Button component exists
- [ ] Card component exists
- [ ] Frontend starts without errors: `npm run dev`

### API Connectivity
- [ ] Test GET request: `curl http://localhost:8080/api/billing-plans`
- [ ] Should return empty array `[]` or sample data
- [ ] Browser Network tab shows 200 status for API calls

## Testing Scenarios

### 1. Create Plan
- [ ] Click "Add New Plan" button
- [ ] Fill all required fields
- [ ] Add at least 3 features
- [ ] Mark as popular (optional)
- [ ] Click "Create Plan"
- [ ] Plan appears in the grid
- [ ] API shows new plan in database

### 2. Edit Plan
- [ ] Click "Edit" button on any plan card
- [ ] Modal opens with existing data
- [ ] Modify some values
- [ ] Add/remove features
- [ ] Click "Update Plan"
- [ ] Changes reflected immediately

### 3. Delete Plan
- [ ] Click "Delete" button
- [ ] Confirm deletion
- [ ] Plan removed from grid
- [ ] Plan no longer in database

### 4. Popular Plan Badge
- [ ] Create or edit a plan as "Most Popular"
- [ ] Plan card shows "Most Popular" badge
- [ ] Badge has correct styling (green/teal color)
- [ ] Only one plan marked as popular (business rule optional)

### 5. Error Handling
- [ ] Try submitting empty form - shows validation error
- [ ] Try creating plan without features - shows error
- [ ] Check console for detailed error messages
- [ ] Error alerts display correctly

## Performance Checks

- [ ] Page loads within 2 seconds
- [ ] Creating plan takes < 1 second
- [ ] Grid animations are smooth (60fps)
- [ ] Modal transitions are fluid
- [ ] No memory leaks in browser DevTools

## Browser DevTools Verification

### Console
- [ ] No JavaScript errors
- [ ] Fetch requests show 200 status
- [ ] API URLs are correct in Network tab

### Network
- [ ] GET /api/billing-plans - 200 OK
- [ ] POST /api/billing-plans - 201 Created
- [ ] PUT /api/billing-plans/{id} - 200 OK
- [ ] DELETE /api/billing-plans/{id} - 204 No Content

## Responsive Design

- [ ] Desktop (1920px): 3 column grid ✓
- [ ] Tablet (768px): Should adapt properly
- [ ] Mobile (375px): Should stack vertically
- [ ] Modal responsive on all sizes
- [ ] Form inputs readable on mobile

## Database Verification

```sql
-- Run these queries to verify everything is set up correctly

-- Check table structure
DESCRIBE billing_plans;
DESCRIBE plan_features;

-- Check sample data
SELECT * FROM billing_plans;
SELECT * FROM plan_features;

-- Check data integrity
SELECT bp.id, bp.name, COUNT(pf.feature) as feature_count
FROM billing_plans bp
LEFT JOIN plan_features pf ON bp.id = pf.billing_plan_id
GROUP BY bp.id;
```

## Common Issues and Solutions

### Issue: 404 Not Found
**Solution:**
- Check backend is running on port 8080
- Verify URL in BillingAndPlans.jsx: `http://localhost:8080`
- Check controller mapping: `@RequestMapping("/api/billing-plans")`

### Issue: CORS Error
**Solution:**
- Ensure `@CrossOrigin(origins = "*")` in controller
- Check frontend is on port 3000
- Try adding credentials to fetch request if needed

### Issue: Features Not Saving
**Solution:**
- Check `features` field in DTO
- Verify `@ElementCollection` in entity
- Check plan_features table has correct foreign key

### Issue: Modal Not Opening
**Solution:**
- Check `showModal` state is toggled correctly
- Verify motion animation dependencies
- Check browser console for React errors

## Sign-Off

- [ ] All backend tests passed
- [ ] All frontend tests passed
- [ ] Database integration verified
- [ ] API endpoints responsive
- [ ] UI/UX meets requirements
- [ ] Ready for production deployment
