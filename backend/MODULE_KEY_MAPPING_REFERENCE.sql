-- ================================================================
-- Module Key to Organization Field Mapping Reference
-- ================================================================
-- This file documents the mapping between extended_modules.module_key
-- and Organization entity boolean fields
-- ================================================================

/*
┌─────────────────────────────────────────────────┬───────────────────────────────────────────────────┐
│            EXTENDED MODULE KEY                   │     ORGANIZATION ENTITY BOOLEAN FIELD             │
├─────────────────────────────────────────────────┼───────────────────────────────────────────────────┤
│  moduleQrAttendanceMarking                      │  moduleQrAttendanceMarking                        │
│  moduleFaceRecognitionAttendanceMarking         │  moduleFaceRecognitionAttendanceMarking           │
│  moduleEmployeeFeedback                         │  moduleEmployeeFeedback                           │
│  moduleHiringManagement                         │  moduleHiringManagement                           │
└─────────────────────────────────────────────────┴───────────────────────────────────────────────────┘

IMPORTANT NOTES:
================
1. Module keys MUST match Organization entity field names EXACTLY
2. The OrganizationModuleService.syncOrganizationModules() method uses this mapping
3. When adding new modules, ensure:
   - Add boolean field to Organization entity
   - Add module key to extended_modules that matches the field name
   - Update OrganizationModuleService switch statements

CURRENT SUPPORTED MODULES (with Organization boolean fields):
==============================================================
*/

-- ✅ ACTIVE MODULES (isActive = TRUE)
-- These are available for ORG_ADMINs to select

SELECT 
    'moduleQrAttendanceMarking' AS module_key,
    'Organization.moduleQrAttendanceMarking' AS entity_field,
    'QR Code Attendance Marking' AS module_name,
    'ACTIVE' AS status
UNION ALL
SELECT 
    'moduleFaceRecognitionAttendanceMarking',
    'Organization.moduleFaceRecognitionAttendanceMarking',
    'Face Recognition Attendance',
    'ACTIVE'
UNION ALL
SELECT 
    'moduleEmployeeFeedback',
    'Organization.moduleEmployeeFeedback',
    'Employee Feedback System',
    'ACTIVE'
UNION ALL
SELECT 
    'moduleHiringManagement',
    'Organization.moduleHiringManagement',
    'Hiring Management System',
    'ACTIVE';

-- ❌ INACTIVE MODULES (isActive = FALSE)
-- These exist in database but are not yet available for selection
-- Note: These do NOT have corresponding Organization entity fields yet

/*
modulePerformanceReviews          → NOT YET MAPPED (no Organization field)
moduleLeaveManagementPro          → NOT YET MAPPED (no Organization field)
modulePayrollIntegration          → NOT YET MAPPED (no Organization field)
moduleTrainingDevelopment         → NOT YET MAPPED (no Organization field)
*/

-- ================================================================
-- HOW TO ADD A NEW MODULE WITH ORGANIZATION FIELD SYNC
-- ================================================================

/*
STEP 1: Add Boolean Field to Organization Entity
================================================
@Column(name = "module_new_feature")
private Boolean moduleNewFeature = false;

STEP 2: Add Getter and Setter
==============================
public Boolean getModuleNewFeature() { return moduleNewFeature; }
public void setModuleNewFeature(Boolean moduleNewFeature) { this.moduleNewFeature = moduleNewFeature; }

STEP 3: Add to OrganizationModuleService.isModuleEnabledInOrganization()
=========================================================================
case "moduleNewFeature":
    return Boolean.TRUE.equals(org.getModuleNewFeature());

STEP 4: Add to OrganizationModuleService.updateOrganizationModuleFlag()
========================================================================
case "moduleNewFeature":
    org.setModuleNewFeature(value);
    break;

STEP 5: Add to UpdateModuleConfigRequest DTO
=============================================
private Boolean moduleNewFeature;

STEP 6: Add to ModuleConfigResponse DTO
========================================
private Boolean moduleNewFeature;

STEP 7: Add to OrganizationService.getModuleConfiguration()
============================================================
.moduleNewFeature(organization.getModuleNewFeature())

STEP 8: Add to OrganizationService.updateModuleConfiguration()
===============================================================
if (request.getModuleNewFeature() != null) {
    organization.setModuleNewFeature(request.getModuleNewFeature());
}

STEP 9: Add Module to Database
===============================
INSERT INTO extended_modules (name, module_key, description, icon, category, price, is_active) 
VALUES (
    'New Feature Module',
    'moduleNewFeature',  -- MUST match Organization field name
    'Description of new feature',
    'IconName',
    'Category',
    99.99,
    TRUE
);

STEP 10: Update ModuleConfiguration.jsx Frontend
=================================================
Add new toggle/checkbox for the new module
*/

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check if module keys in database match Organization entity fields
SELECT 
    em.module_key,
    em.name,
    em.is_active,
    CASE 
        WHEN em.module_key IN (
            'moduleQrAttendanceMarking',
            'moduleFaceRecognitionAttendanceMarking',
            'moduleEmployeeFeedback',
            'moduleHiringManagement'
        ) THEN '✅ Has Organization Field'
        ELSE '❌ No Organization Field'
    END AS mapping_status
FROM extended_modules em
ORDER BY em.is_active DESC, em.name;

-- Find organizations with specific module enabled
SELECT 
    o.organization_uuid,
    o.name AS organization_name,
    o.module_qr_attendance_marking,
    o.module_face_recognition_attendance_marking,
    o.module_employee_feedback,
    o.module_hiring_management,
    o.modules_configured
FROM organizations o
WHERE o.modules_configured = TRUE;

-- Compare Organization boolean flags with organization_modules table
SELECT 
    o.name AS organization_name,
    o.module_qr_attendance_marking AS org_qr_flag,
    EXISTS(
        SELECT 1 
        FROM organization_modules om 
        JOIN extended_modules em ON om.module_id = em.module_id
        WHERE om.organization_id = o.id 
        AND em.module_key = 'moduleQrAttendanceMarking'
        AND om.is_enabled = TRUE
    ) AS has_qr_subscription,
    o.module_face_recognition_attendance_marking AS org_face_flag,
    EXISTS(
        SELECT 1 
        FROM organization_modules om 
        JOIN extended_modules em ON om.module_id = em.module_id
        WHERE om.organization_id = o.id 
        AND em.module_key = 'moduleFaceRecognitionAttendanceMarking'
        AND om.is_enabled = TRUE
    ) AS has_face_subscription
FROM organizations o
WHERE o.modules_configured = TRUE;

-- ================================================================
-- SYNC VERIFICATION
-- ================================================================
-- Use this query to verify that Organization flags match organization_modules

SELECT 
    o.name AS organization,
    'QR Attendance' AS module,
    o.module_qr_attendance_marking AS org_flag,
    COALESCE(om.is_enabled, FALSE) AS subscription_enabled,
    CASE 
        WHEN o.module_qr_attendance_marking = COALESCE(om.is_enabled, FALSE) THEN '✅ SYNCED'
        ELSE '❌ OUT OF SYNC'
    END AS sync_status
FROM organizations o
LEFT JOIN organization_modules om ON o.id = om.organization_id
LEFT JOIN extended_modules em ON om.module_id = em.module_id AND em.module_key = 'moduleQrAttendanceMarking'
UNION ALL
SELECT 
    o.name,
    'Face Recognition' AS module,
    o.module_face_recognition_attendance_marking,
    COALESCE(om.is_enabled, FALSE),
    CASE 
        WHEN o.module_face_recognition_attendance_marking = COALESCE(om.is_enabled, FALSE) THEN '✅ SYNCED'
        ELSE '❌ OUT OF SYNC'
    END
FROM organizations o
LEFT JOIN organization_modules om ON o.id = om.organization_id
LEFT JOIN extended_modules em ON om.module_id = em.module_id AND em.module_key = 'moduleFaceRecognitionAttendanceMarking'
UNION ALL
SELECT 
    o.name,
    'Employee Feedback' AS module,
    o.module_employee_feedback,
    COALESCE(om.is_enabled, FALSE),
    CASE 
        WHEN o.module_employee_feedback = COALESCE(om.is_enabled, FALSE) THEN '✅ SYNCED'
        ELSE '❌ OUT OF SYNC'
    END
FROM organizations o
LEFT JOIN organization_modules om ON o.id = om.organization_id
LEFT JOIN extended_modules em ON om.module_id = em.module_id AND em.module_key = 'moduleEmployeeFeedback'
UNION ALL
SELECT 
    o.name,
    'Hiring Management' AS module,
    o.module_hiring_management,
    COALESCE(om.is_enabled, FALSE),
    CASE 
        WHEN o.module_hiring_management = COALESCE(om.is_enabled, FALSE) THEN '✅ SYNCED'
        ELSE '❌ OUT OF SYNC'
    END
FROM organizations o
LEFT JOIN organization_modules om ON o.id = om.organization_id
LEFT JOIN extended_modules em ON om.module_id = em.module_id AND em.module_key = 'moduleHiringManagement'
ORDER BY organization, module;

-- ================================================================
-- MANUAL SYNC (if needed)
-- ================================================================
-- If you need to manually sync organization_modules with Organization flags:

-- Call the sync endpoint via API:
-- POST /api/organization-modules/{organizationUuid}/sync

-- Or trigger via Java:
-- organizationModuleService.syncOrganizationModules(organizationUuid);
