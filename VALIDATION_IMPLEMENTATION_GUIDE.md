# Form Validation Implementation Guide

## Overview
This guide provides the standard pattern for implementing form validation across all forms in the application.

## Validation Pattern

### 1. Form Error State
```javascript
const [formErrors, setFormErrors] = useState({});
```

### 2. Input Field with Validation
```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Field Name <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="fieldName"
    value={formData.fieldName}
    onChange={handleInputChange}
    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
      formErrors.fieldName 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-300 focus:ring-blue-500'
    }`}
    placeholder="Enter field name"
  />
  {formErrors.fieldName && (
    <p className="mt-1 text-sm text-red-600">{formErrors.fieldName}</p>
  )}
</div>
```

### 3. Handle Input Change (Clear Error on Type)
```javascript
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));

  // Clear error when user starts typing
  if (formErrors[name]) {
    setFormErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  }
};
```

### 4. Validation Function
```javascript
const validateForm = () => {
  const errors = {};

  // Required field
  if (!formData.fieldName.trim()) {
    errors.fieldName = "Field name is required";
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Length validation
  if (formData.password && formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  // Number validation
  if (formData.age && (isNaN(formData.age) || formData.age < 0)) {
    errors.age = "Please enter a valid age";
  }

  // Phone validation
  if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
    errors.phone = "Please enter a valid phone number";
  }

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};
```

### 5. Form Submission with SweetAlert
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate form
  if (!validateForm()) {
    return; // Don't show alert, just highlight errors
  }

  try {
    // API call
    await someApiCall(formData);
    
    // Success SweetAlert
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Operation completed successfully',
      confirmButtonColor: '#02C39A',
      timer: 2000,
      showConfirmButton: false
    });
    
    // Navigate or refresh
    navigate('/success-page');
  } catch (error) {
    // Error SweetAlert
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Operation failed',
      confirmButtonColor: '#02C39A',
    });
  }
};
```

### 6. Delete Confirmation with SweetAlert
```javascript
const handleDelete = async (id) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'This action cannot be undone',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#02C39A',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  try {
    await deleteApi(id);
    Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: 'Item has been deleted',
      confirmButtonColor: '#02C39A',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to delete item',
      confirmButtonColor: '#02C39A',
    });
  }
};
```

## Complete Example Component

```jsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';

const ExampleForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Form submitted successfully',
        confirmButtonColor: '#02C39A',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Submission failed',
        confirmButtonColor: '#02C39A',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      {/* Name Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            formErrors.name 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter your name"
        />
        {formErrors.name && (
          <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            formErrors.email 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter your email"
        />
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
        )}
      </div>

      {/* Phone Field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            formErrors.phone 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter your phone"
        />
        {formErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            formErrors.password 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter your password"
        />
        {formErrors.password && (
          <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default ExampleForm;
```

## Files That Need Updates

### High Priority (User-Facing Forms)
1. ✅ LoginPage.jsx - Partially done
2. ✅ ForgetPasswordPage.jsx - Needs update
3. ✅ ChangePasswordPage.jsx - Needs update
4. ❌ SignupPage.jsx - Needs update
5. ❌ EditProfile.jsx - Needs update
6. ❌ LeaveRequest.jsx - Needs update
7. ❌ Feedback.jsx - Needs update

### Medium Priority (HR Staff Forms)
8. ❌ AddEmployee.jsx - Needs update (replace alert with Swal)
9. ❌ EditeEmployee.jsx - Needs update (replace alert with Swal)
10. ❌ AddJobForm.jsx - Has Swal, improve validation
11. ❌ EditeJobPosting.jsx - Has Swal, improve validation
12. ❌ NoticeFormModal.jsx - Needs validation
13. ❌ EditSurveyQuestions.jsx - Replace alert with Swal
14. ❌ QuestionEditor.jsx - Replace alert with Swal

### Lower Priority (Admin Forms)
15. ❌ DepartmentManagement.jsx - Replace alert with Swal
16. ❌ DesignationManagement.jsx - Replace alert with Swal
17. ❌ HRStaffManagement.jsx - Needs full validation
18. ❌ LeaveAndAttendanceConfigure.jsx - Needs validation
19. ❌ PayrollConfiguration.jsx - Needs validation
20. ❌ BillingAndPlans.jsx - Complex, needs review
21. ❌ Modules.jsx - Complex, needs review

## Key Points

1. **No SweetAlert for Validation Errors**: Only show red borders and inline error messages
2. **SweetAlert for**:
   - Success messages
   - Error messages from API
   - Confirmation dialogs (delete, important actions)
3. **Clear Errors**: Remove error message when user starts typing
4. **Required Fields**: Mark with red asterisk (*)
5. **Consistent Styling**: Use the same border/text colors across all forms

## Color Scheme
- Error Border: `border-red-500`
- Error Text: `text-red-600`
- Error Focus Ring: `focus:ring-red-500`
- Normal Border: `border-gray-300`
- Normal Focus Ring: `focus:ring-blue-500` or `focus:ring-[#02C39A]` (theme primary)
- SweetAlert Primary Color: `#02C39A`
