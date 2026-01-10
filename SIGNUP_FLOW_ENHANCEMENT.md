# Signup Flow Enhancement - Plan Selection & Custom Modules

## 🎯 Overview
Enhanced the signup process to include a 3-step flow with billing plan selection and custom module configuration.

---

## 📝 Changes Made

### 1. **New API Client Created**
**File:** `frontend/src/api/billingPlansApi.js`

```javascript
- getAllBillingPlans() - Fetch all billing plans from database
- getBillingPlanById(planId) - Get specific plan details
```

### 2. **SignupPage.jsx - Major Updates**

#### A. New Imports
```javascript
import { getAllBillingPlans } from '../../api/billingPlansApi';
import { getActiveModules } from '../../api/extendedModulesApi';
```

#### B. Updated Form State
```javascript
const [formData, setFormData] = useState({
  organizationName: '',
  adminEmail: '',
  businessRegistrationNumber: '',
  businessRegistrationDocument: null,
  employeeCountRange: '',
  selectedPlanId: null,           // NEW
  selectedPlanName: '',           // NEW
  customModules: []               // NEW - Array of module IDs
});

// NEW state for plans and modules
const [billingPlans, setBillingPlans] = useState([]);
const [extendedModules, setExtendedModules] = useState([]);
const [isLoadingPlans, setIsLoadingPlans] = useState(false);
const [isLoadingModules, setIsLoadingModules] = useState(false);
```

#### C. New useEffect Hooks
```javascript
// Fetch billing plans when moving to step 2
useEffect(() => {
  if (currentStep === 2 && billingPlans.length === 0) {
    fetchBillingPlans();
  }
}, [currentStep]);

// Fetch extended modules when moving to step 3 (custom plan)
useEffect(() => {
  if (currentStep === 3 && extendedModules.length === 0) {
    fetchExtendedModules();
  }
}, [currentStep]);
```

#### D. New Handler Functions
```javascript
// Fetch billing plans from database
const fetchBillingPlans = async () => {
  setIsLoadingPlans(true);
  try {
    const response = await getAllBillingPlans();
    setBillingPlans(response || []);
  } catch (error) {
    console.error('Error fetching billing plans:', error);
    setFormErrors(prev => ({ ...prev, plans: 'Failed to load billing plans' }));
  } finally {
    setIsLoadingPlans(false);
  }
};

// Fetch extended modules from database
const fetchExtendedModules = async () => {
  setIsLoadingModules(true);
  try {
    const response = await getActiveModules();
    setExtendedModules(response.data || []);
  } catch (error) {
    console.error('Error fetching extended modules:', error);
    setFormErrors(prev => ({ ...prev, modules: 'Failed to load modules' }));
  } finally {
    setIsLoadingModules(false);
  }
};

// Handle plan selection
const handlePlanSelect = (plan) => {
  setFormData(prev => ({
    ...prev,
    selectedPlanId: plan.id,
    selectedPlanName: plan.name,
    customModules: [] // Reset custom modules when changing plan
  }));
  setFormErrors(prev => ({ ...prev, plan: null }));
};

// Handle module toggle for custom plan
const handleModuleToggle = (moduleId) => {
  setFormData(prev => {
    const isSelected = prev.customModules.includes(moduleId);
    return {
      ...prev,
      customModules: isSelected
        ? prev.customModules.filter(id => id !== moduleId)
        : [...prev.customModules, moduleId]
    };
  });
};
```

#### E. Updated handleNextStep
```javascript
const handleNextStep = () => {
  if (currentStep === 1 && validateStep1()) {
    setCurrentStep(2);
  } else if (currentStep === 2) {
    // Validate plan selection
    if (!formData.selectedPlanId) {
      setFormErrors(prev => ({ ...prev, plan: 'Please select a billing plan' }));
      return;
    }
    
    // Always go to step 3 (either for custom modules or confirmation)
    setCurrentStep(3);
  }
};
```

#### F. Updated handleSubmit
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!recaptchaToken) {
    setRecaptchaError('Please complete the reCAPTCHA verification');
    return;
  }
  
  // Validate custom modules if custom plan
  if (formData.selectedPlanName.toLowerCase() === 'custom' && formData.customModules.length === 0) {
    setFormErrors(prev => ({ ...prev, modules: 'Please select at least one module for custom plan' }));
    return;
  }
  
  try {
    const signupFormData = new FormData();
    // ... existing fields ...
    
    // NEW: Add billing plan information
    signupFormData.append('selectedPlanId', formData.selectedPlanId);
    signupFormData.append('selectedPlanName', formData.selectedPlanName);
    
    // NEW: Add custom modules if custom plan
    if (formData.selectedPlanName.toLowerCase() === 'custom') {
      signupFormData.append('customModules', JSON.stringify(formData.customModules));
    }
    
    const resultAction = await dispatch(signupOrganization(signupFormData));
    // ... rest of submission logic ...
  }
};
```

---

## 🎨 New UI Components

### Step 1: Company Information (Unchanged)
- Organization name
- Admin email
- Business registration number
- Business registration document upload
- Employee count range

### Step 2: Billing Plan Selection (NEW)
**Features:**
- Grid display of all billing plans from database
- Shows plan details: name, description, price, period, features
- "Most Popular" badge for popular plans
- Selected plan highlighted with checkmark
- Hover effects for better UX
- Loading state while fetching plans
- Validation: Must select a plan to continue

**Plan Card Display:**
```
┌─────────────────────────────────────┐
│     [Most Popular Badge]            │
│  ✓ Selected Checkmark (if selected)│
│                                     │
│  Plan Name (e.g., Professional)    │
│  Description text...                │
│                                     │
│  LKR 5,000 /month                  │
│  Up to 50 employees                │
│                                     │
│  ✓ Feature 1                       │
│  ✓ Feature 2                       │
│  ✓ Feature 3                       │
│  ... (up to 5 features shown)      │
│  +X more features                  │
└─────────────────────────────────────┘
```

### Step 3A: Custom Module Selection (Conditional - Only if "Custom" plan)
**Features:**
- Grid display of active extended modules from database
- Each module shows: name, description, price/month, category
- Checkbox selection
- Real-time total price calculation
- Shows selected module count
- Validation: Must select at least one module

**Module Card Display:**
```
┌─────────────────────────────────────┐
│ ☐ Module Name          $199.99/mo  │
│   Description of module...          │
│   [Category Badge]                  │
└─────────────────────────────────────┘

[Selected modules summary:]
┌─────────────────────────────────────┐
│ Total Monthly Cost:      $449.98    │
│ 3 module(s) selected                │
└─────────────────────────────────────┘
```

### Step 3B: Confirmation (For Non-Custom Plans)
**Features:**
- Summary of all entered information
- Organization name
- Admin email
- Employee count
- Selected plan name
- reCAPTCHA verification

---

## 🔄 User Flow

```
Step 1: Company Information
   ↓ (Next button)
Step 2: Choose Billing Plan
   ↓ (Continue button)
   ├─→ If "Custom" plan selected:
   │     Step 3: Select Custom Modules
   │     ↓
   │     reCAPTCHA → Submit
   │
   └─→ If any other plan:
         Step 3: Confirmation Summary
         ↓
         reCAPTCHA → Submit
```

---

## 📊 Data Flow

### Frontend → Backend

**Registration Request (FormData):**
```javascript
{
  organizationName: "ABC Company",
  adminEmail: "admin@abc.com",
  businessRegistrationNumber: "BR12345",
  businessRegistrationDocument: File,
  employeeCountRange: "11-50",
  selectedPlanId: 2,                    // NEW
  selectedPlanName: "Professional",     // NEW
  customModules: [1, 3, 5],            // NEW (only if custom plan)
  recaptchaToken: "token..."
}
```

### Backend Processing (Expected)

The backend should:
1. Validate the selected plan exists
2. If custom plan:
   - Validate all module IDs exist and are active
   - Calculate total price
3. Create organization record
4. Store plan selection (could be in a separate table: `organization_subscriptions`)
5. If custom plan, store module subscriptions in `organization_modules` table
6. Send approval notification to sys_admin

---

## 🎯 Key Features

### 1. **Dynamic Plan Loading**
- Plans are fetched from `billing_plans` table
- No hardcoded plans in frontend
- Easy to add/remove/modify plans from admin panel

### 2. **Conditional Step 3**
- Shows custom module selection ONLY if "Custom" plan is selected
- Shows confirmation summary for all other plans
- Prevents unnecessary steps for users

### 3. **Real-time Price Calculation**
- For custom plans, shows running total
- Updates instantly when modules are toggled
- Clear display of selected module count

### 4. **Progressive Loading**
- Plans load when entering Step 2
- Modules load when entering Step 3 (if custom)
- Prevents unnecessary API calls

### 5. **Enhanced UX**
- Visual feedback for selected plan
- Hover effects on cards
- Loading spinners during data fetch
- Clear error messages
- Progress indicator shows all 3 steps

### 6. **Validation**
- Step 2: Must select a plan
- Step 3 (Custom): Must select at least one module
- reCAPTCHA required before submission

---

## 🔧 Backend Integration Requirements

### Expected API Endpoints

1. **GET /billing-plans** - Already exists ✅
   - Returns all billing plans

2. **GET /api/modules/active** - Already exists ✅
   - Returns active extended modules

3. **POST /auth/signup** - Needs update ⚠️
   - Accept new fields: `selectedPlanId`, `selectedPlanName`, `customModules`
   - Store plan selection
   - If custom plan, store module selections

### Recommended Database Changes

1. **New Table: `organization_subscriptions`** (Optional)
```sql
CREATE TABLE organization_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    billing_plan_id BIGINT NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (billing_plan_id) REFERENCES billing_plans(id)
);
```

2. **Update `organization_modules` table** - Already exists ✅
   - Use existing table to store custom module selections
   - Set `is_enabled = true` for selected modules during signup

---

## ✅ Testing Checklist

### Frontend Tests:
- [ ] Step 1: Company info validation works
- [ ] Step 2: Plans load correctly from database
- [ ] Step 2: Can select a plan
- [ ] Step 2: "Most Popular" badge shows correctly
- [ ] Step 2: Cannot proceed without selecting plan
- [ ] Step 3 (Custom): Modules load correctly
- [ ] Step 3 (Custom): Can toggle modules
- [ ] Step 3 (Custom): Price calculation is accurate
- [ ] Step 3 (Custom): Cannot submit without selecting modules
- [ ] Step 3 (Non-Custom): Shows confirmation summary
- [ ] reCAPTCHA validation works
- [ ] Back buttons work correctly
- [ ] Form submission includes all data

### Integration Tests:
- [ ] Signup with "Starter" plan
- [ ] Signup with "Professional" plan
- [ ] Signup with "Enterprise" plan
- [ ] Signup with "Custom" plan + 1 module
- [ ] Signup with "Custom" plan + multiple modules
- [ ] Verify plan is stored in database
- [ ] Verify custom modules are stored in organization_modules
- [ ] Approval workflow still works

---

## 📝 Notes

### Module Options Removed:
The old hardcoded module checkboxes are no longer used:
- ~~moduleQrAttendance~~
- ~~moduleFaceRecognitionAttendance~~
- ~~moduleEmployeeFeedback~~
- ~~moduleHiringManagement~~

These were replaced with dynamic plan and module selection from the database.

### Custom Plan Logic:
- Plan name is compared case-insensitively: `.toLowerCase() === 'custom'`
- Ensure there's a plan in the database with name "Custom" or "custom"
- Custom plan should have appropriate description explaining it's customizable

### Price Display:
- Plans show price in LKR (Sri Lankan Rupees)
- Custom modules show price in USD with "/mo" suffix
- Consider making currency consistent or configurable

---

## 🚀 Next Steps (Backend)

1. **Update Signup Controller:**
   - Add handling for `selectedPlanId`
   - Add handling for `customModules` array
   - Parse JSON string for custom modules

2. **Update Organization Entity (Optional):**
   - Add field for current billing plan reference

3. **Update Signup Service:**
   - Save plan selection to database
   - If custom plan, iterate through `customModules` and create `OrganizationModule` records
   - Set `isEnabled = true` for selected modules

4. **Example Backend Code:**
```java
// In signup service
if (request.getSelectedPlanName().equalsIgnoreCase("custom")) {
    String customModulesJson = request.getCustomModules();
    List<Long> moduleIds = objectMapper.readValue(customModulesJson, new TypeReference<List<Long>>(){});
    
    for (Long moduleId : moduleIds) {
        ExtendedModule module = extendedModuleRepository.findById(moduleId)
            .orElseThrow(() -> new RuntimeException("Module not found"));
        
        OrganizationModule orgModule = OrganizationModule.builder()
            .organization(organization)
            .extendedModule(module)
            .isEnabled(true)
            .subscribedAt(LocalDateTime.now())
            .build();
        
        organizationModuleRepository.save(orgModule);
    }
}
```

---

## 📞 Support

If issues arise:
1. Check browser console for API errors
2. Verify billing plans exist in database
3. Verify extended modules are marked as active
4. Check network tab for API responses
5. Verify backend is receiving all form fields

---

**Status:** ✅ Frontend Implementation Complete
**Last Updated:** January 11, 2026
