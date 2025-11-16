-- Debug script for organization approval issues
-- Check current organizations and their users

SELECT 'Organizations' as table_name;
SELECT 
    id,
    organization_uuid,
    name,
    email,
    status,
    module_performance_tracking,
    module_employee_feedback,
    module_hiring_management,
    modules_configured,
    created_at
FROM organization 
WHERE status = 'PENDING_APPROVAL'
ORDER BY created_at DESC;

SELECT 'App Users' as table_name;
SELECT 
    id,
    organization_uuid,
    email,
    role,
    is_active,
    linked_employee_id,
    created_at
FROM app_user 
WHERE organization_uuid IN (
    SELECT organization_uuid 
    FROM organization 
    WHERE status = 'PENDING_APPROVAL'
)
ORDER BY organization_uuid, role;

-- Check specific organization
SELECT 'Specific Organization Check' as info;
SELECT 
    o.organization_uuid,
    o.name,
    o.status,
    u.email as user_email,
    u.role,
    u.is_active
FROM organization o
LEFT JOIN app_user u ON o.organization_uuid = u.organization_uuid
WHERE o.organization_uuid = '9fdf096e-96ca-43b5-a81b-50f5aea4d3a7'
ORDER BY u.role;