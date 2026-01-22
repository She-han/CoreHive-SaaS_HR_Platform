# Signup Flow - Visual Guide

## 📋 Step-by-Step Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      SIGNUP PAGE - STEP 1                        │
│                    Company Information                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Organization Name:     [_____________________________]          │
│  Admin Email:           [_____________________________]          │
│  Business Reg Number:   [_____________________________]          │
│  Registration Document: [Upload File]                            │
│  Employee Count:        [Dropdown: 1-10, 11-50, etc.]          │
│                                                                  │
│                                          [Next: Choose Plan →]   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SIGNUP PAGE - STEP 2                        │
│                      Choose Your Plan                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Starter    │  │ Professional │  │  Enterprise  │          │
│  │  LKR 2,500   │  │  LKR 5,000   │  │  LKR 10,000  │          │
│  │              │  │ [⭐ Popular] │  │              │          │
│  │ • Feature 1  │  │ • Feature 1  │  │ • Feature 1  │          │
│  │ • Feature 2  │  │ • Feature 2  │  │ • Feature 2  │          │
│  │ • Feature 3  │  │ • Feature 3  │  │ • Feature 3  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐                                               │
│  │    Custom    │                                               │
│  │   Flexible   │                                               │
│  │  Customize   │                                               │
│  │    modules   │                                               │
│  └──────────────┘                                               │
│                                                                  │
│  [← Back]                                    [Continue →]       │
└─────────────────────────────────────────────────────────────────┘
              ↓                        ↓
              ↓ (If Custom)           ↓ (If Not Custom)
              ↓                        ↓
┌─────────────────────────────┐   ┌─────────────────────────────┐
│   STEP 3A: Custom Modules   │   │   STEP 3B: Confirmation     │
├─────────────────────────────┤   ├─────────────────────────────┤
│ Select Modules You Need:    │   │ Review Your Information:    │
│                             │   │                             │
│ ☑ QR Attendance             │   │ Organization: ABC Company   │
│   $199.99/mo [Attendance]   │   │ Admin Email: admin@abc.com  │
│                             │   │ Employees: 11-50            │
│ ☐ Face Recognition          │   │ Selected Plan: Professional │
│   $499.99/mo [Attendance]   │   │                             │
│                             │   │ ┌─────────────────────────┐ │
│ ☑ Employee Feedback         │   │ │   reCAPTCHA Verify     │ │
│   $149.99/mo [Engagement]   │   │ └─────────────────────────┘ │
│                             │   │                             │
│ ☐ Hiring Management         │   │ [← Back]  [Submit →]       │
│   $299.99/mo [Recruitment]  │   └─────────────────────────────┘
│                             │
│ ┌─────────────────────────┐ │
│ │ Total: $349.98/month    │ │
│ │ 2 modules selected      │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │   reCAPTCHA Verify     │ │
│ └─────────────────────────┘ │
│                             │
│ [← Back]  [Submit →]       │
└─────────────────────────────┘
              ↓
              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     REGISTRATION SUCCESSFUL                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                     ✓ Registration Successful!                   │
│                                                                  │
│      Your organization has been registered successfully.         │
│      Please wait for admin approval to start using CoreHive.     │
│                                                                  │
│                     [Go to Login]                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌─────────────┐
│   STEP 1    │
│   Company   │──────────┐
│   Info      │          │
└─────────────┘          │
                         │
                         ↓
                    Form Data:
                    ├─ organizationName
                    ├─ adminEmail
                    ├─ businessRegistrationNumber
                    ├─ businessRegistrationDocument
                    ├─ employeeCountRange
                    │
                    ↓
┌─────────────┐
│   STEP 2    │◄─────── GET /billing-plans
│   Select    │         (Fetch from database)
│   Plan      │
└─────────────┘
      ↓
      │ User selects plan
      ↓
   Form Data:
   ├─ ... (previous fields)
   ├─ selectedPlanId
   ├─ selectedPlanName
   │
   ├─ If Custom Plan? ────YES────┐
   │                              ↓
   │                    ┌─────────────┐
   │                    │   STEP 3A   │◄─── GET /api/modules/active
   │                    │   Custom    │      (Fetch from database)
   │                    │   Modules   │
   │                    └─────────────┘
   │                         │ User selects modules
   │                         ↓
   │                    Form Data:
   │                    ├─ ... (previous fields)
   │                    ├─ customModules: [1, 3, 5]
   │                         │
   └───────NO───────────────┼───────────┐
                            │           │
                            ↓           ↓
                       ┌─────────────────────┐
                       │      STEP 3B        │
                       │   Confirmation +    │
                       │    reCAPTCHA       │
                       └─────────────────────┘
                                │
                                ↓
                         [Submit Button]
                                │
                                ↓
                        ┌───────────────┐
                        │  POST /auth/  │
                        │    signup     │
                        └───────────────┘
                                │
                                ↓
                          Backend Logic:
                          ├─ Create Organization
                          ├─ Store Plan Selection
                          │  (organization_subscriptions)
                          ├─ If custom:
                          │  └─ Create OrganizationModule
                          │     records for each selected
                          │     module
                          └─ Send for approval
```

## 📊 Database Relationships

```
┌────────────────────────────────────────────────────────────────┐
│                         TABLES                                  │
└────────────────────────────────────────────────────────────────┘

┌─────────────────┐           ┌──────────────────┐
│  billing_plans  │           │  organizations   │
├─────────────────┤           ├──────────────────┤
│ id (PK)         │           │ id (PK)          │
│ name            │           │ name             │
│ price           │           │ admin_email      │
│ period          │           │ status           │
│ description     │           │ ...              │
│ features (JSON) │           └──────────────────┘
│ employees       │                    │
│ popular         │                    │
│ ...             │                    │
└─────────────────┘                    │
        │                              │
        │                              │
        └──────────┬───────────────────┘
                   │
                   ↓
        ┌────────────────────────────┐
        │ organization_subscriptions │ (Optional new table)
        ├────────────────────────────┤
        │ id (PK)                    │
        │ organization_id (FK)       │
        │ billing_plan_id (FK)       │
        │ subscribed_at              │
        │ status                     │
        └────────────────────────────┘


┌───────────────────┐           ┌─────────────────────────┐
│ extended_modules  │           │  organization_modules   │
├───────────────────┤           ├─────────────────────────┤
│ module_id (PK)    │◄──────────│ id (PK)                 │
│ name              │           │ organization_id (FK)    │
│ module_key        │           │ module_id (FK)          │
│ description       │           │ is_enabled              │
│ price             │           │ subscribed_at           │
│ is_active         │           │ expires_at              │
│ category          │           └─────────────────────────┘
│ icon              │                      │
│ ...               │                      │
└───────────────────┘                      │
                                           │
                                           ↓
                                  ┌─────────────────┐
                                  │ organizations   │
                                  └─────────────────┘
```

## 🎨 UI Component Hierarchy

```
SignupPage
├── Navbar
├── Container
│   ├── Header
│   │   └── CoreHive Logo & Title
│   │
│   ├── Progress Indicator
│   │   ├── Step 1: Company (Active/Complete)
│   │   ├── Step 2: Plan (Active/Complete/Inactive)
│   │   └── Step 3: Confirm (Active/Inactive)
│   │
│   └── Card (Form Container)
│       ├── Error Alert (if error)
│       │
│       ├── Form
│       │   │
│       │   ├── Step 1 Content (if currentStep === 1)
│       │   │   ├── Input: Organization Name
│       │   │   ├── Input: Admin Email
│       │   │   ├── Input: Business Reg Number
│       │   │   ├── File Upload: Registration Document
│       │   │   ├── Select: Employee Count
│       │   │   └── Button: Next
│       │   │
│       │   ├── Step 2 Content (if currentStep === 2)
│       │   │   ├── Header: Choose Your Plan
│       │   │   ├── Loading Spinner (if isLoadingPlans)
│       │   │   ├── Plan Cards Grid
│       │   │   │   └── For each billing plan:
│       │   │   │       ├── Popular Badge (if plan.popular)
│       │   │   │       ├── Selected Checkmark (if selected)
│       │   │   │       ├── Plan Name
│       │   │   │       ├── Price & Period
│       │   │   │       ├── Employee Limit
│       │   │   │       └── Features List
│       │   │   ├── Error: plan (if validation error)
│       │   │   └── Buttons: Back | Continue
│       │   │
│       │   └── Step 3 Content (if currentStep === 3)
│       │       │
│       │       ├── If Custom Plan:
│       │       │   ├── Header: Customize Your Modules
│       │       │   ├── Loading Spinner (if isLoadingModules)
│       │       │   ├── Modules Grid
│       │       │   │   └── For each extended module:
│       │       │   │       ├── Checkbox
│       │       │   │       ├── Module Name & Price
│       │       │   │       ├── Description
│       │       │   │       └── Category Badge
│       │       │   ├── Total Price Summary
│       │       │   ├── Error: modules (if validation error)
│       │       │   ├── ReCaptcha Component
│       │       │   └── Buttons: Back | Submit
│       │       │
│       │       └── If Non-Custom Plan:
│       │           ├── Header: Confirm Registration
│       │           ├── Summary Card
│       │           │   ├── Organization Name
│       │           │   ├── Admin Email
│       │           │   ├── Employee Count
│       │           │   └── Selected Plan
│       │           ├── ReCaptcha Component
│       │           └── Buttons: Back | Submit
│       │
│       └── Login Link
│
└── Footer
```

## 🔍 State Management Flow

```
Initial State:
├── currentStep: 1
├── formData: { empty fields }
├── billingPlans: []
├── extendedModules: []
└── isLoading: false

User fills Step 1 → clicks Next
├── validateStep1()
├── If valid: currentStep = 2
└── useEffect triggers fetchBillingPlans()
    ├── isLoadingPlans = true
    ├── API call to /billing-plans
    ├── setBillingPlans(response)
    └── isLoadingPlans = false

User selects a plan → clicks Continue
├── handlePlanSelect(plan)
│   ├── formData.selectedPlanId = plan.id
│   ├── formData.selectedPlanName = plan.name
│   └── formData.customModules = []
├── handleNextStep()
│   ├── Validate plan selection
│   └── currentStep = 3

If Custom Plan:
├── useEffect triggers fetchExtendedModules()
├── isLoadingModules = true
├── API call to /api/modules/active
├── setExtendedModules(response.data)
└── isLoadingModules = false

User toggles modules → clicks Submit
├── handleModuleToggle(moduleId)
│   ├── Add/Remove moduleId from customModules array
│   └── Re-render with updated formData
├── Validate: at least 1 module selected
├── handleSubmit()
│   ├── Create FormData
│   ├── Append all fields including customModules
│   ├── dispatch(signupOrganization(formData))
│   └── If success: isSuccess = true

If Non-Custom Plan → clicks Submit:
├── No module selection needed
├── handleSubmit()
│   ├── Create FormData
│   ├── Append all fields (no customModules)
│   ├── dispatch(signupOrganization(formData))
│   └── If success: isSuccess = true

Success State:
└── Render success message with "Go to Login" button
```

## ✨ Interactive Elements

```
Clickable Elements:
├── Plan Cards (Step 2)
│   ├── Hover: border-primary-300 + shadow-md
│   └── Selected: border-primary-500 + bg-primary-50 + shadow-lg
│
├── Module Cards (Step 3A - Custom)
│   ├── Hover: border-primary-300
│   └── Selected: border-primary-500 + bg-primary-50
│
├── Checkboxes (Step 3A - Custom)
│   └── Toggle: Add/Remove module from selection
│
├── Back Buttons
│   └── Navigate to previous step
│
├── Next/Continue Buttons
│   ├── Disabled if: validation fails or loading
│   └── Navigate to next step or submit
│
└── Submit Button
    ├── Disabled if: no recaptcha or loading or (custom && no modules)
    └── Trigger: handleSubmit()
```

---

**Diagram Legend:**
- `[___]` = Input field
- `[Button]` = Clickable button
- `☐` / `☑` = Checkbox (unchecked/checked)
- `↓` = Flow direction
- `│` `├` `└` = Hierarchy/relationship
- `◄───` = API call
- `(FK)` = Foreign Key
- `(PK)` = Primary Key
