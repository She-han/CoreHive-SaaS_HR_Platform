"""
Database Repository for CoreHive AI Service

This module handles all database connections and queries.
It reads data from the same MySQL database used by the Spring Boot backend.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import pandas as pd
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from app.config.settings import settings


# Create database engine with connection pooling
# pool_pre_ping=True ensures connections are valid before using
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )
    print(f"✅ Database engine created successfully")
except Exception as e:
    print(f"❌ Failed to create database engine: {e}")
    engine = None


class HRDataRepository:
    """
    Repository class for fetching HR data from the database.
    
    This class provides methods to:
    - Get employee statistics
    - Fetch attendance data
    - Retrieve leave information
    
    All methods filter by organization_uuid to ensure data isolation
    (multi-tenant architecture).
    """
    
    def __init__(self, organization_uuid: str):
        """
        Initialize repository with organization UUID.
        
        Args:
            organization_uuid: The unique identifier for the organization
        """
        self.org_uuid = organization_uuid
        print(f"📊 HRDataRepository initialized for org: {organization_uuid[:8]}...")
    
    def get_employee_stats(self) -> Dict[str, Any]:
        """
        Get employee statistics for the organization.
        
        Returns:
            Dictionary containing:
            - total_employees: Total count of employees
            - active_employees: Count of active employees
            - inactive_employees: Count of inactive employees
            - total_departments: Count of unique departments
        """
        if not engine:
            return self._empty_employee_stats()
        
        query = text("""
            SELECT 
                COUNT(*) as total_employees,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_employees,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_employees,
                COUNT(DISTINCT department_id) as total_departments
            FROM employee
            WHERE organization_uuid = :org_uuid
        """)
        
        try:
            with engine.connect() as conn:
                result = conn.execute(query, {"org_uuid": self.org_uuid})
                row = result.fetchone()
                
                if row:
                    return {
                        "total_employees": int(row[0] or 0),
                        "active_employees": int(row[1] or 0),
                        "inactive_employees": int(row[2] or 0),
                        "total_departments": int(row[3] or 0)
                    }
                return self._empty_employee_stats()
                
        except SQLAlchemyError as e:
            print(f"❌ Database error in get_employee_stats: {e}")
            return self._empty_employee_stats()
    
    def _empty_employee_stats(self) -> Dict[str, Any]:
        """Return empty stats if query fails"""
        return {
            "total_employees": 0,
            "active_employees": 0,
            "inactive_employees": 0,
            "total_departments": 0
        }
    
    def get_attendance_summary(self, days: int = 30) -> pd.DataFrame:
        """
        Get attendance data for the last N days.
        
        Args:
            days: Number of days to look back (default: 30)
            
        Returns:
            Pandas DataFrame with attendance records
        """
        if not engine:
            return pd.DataFrame()
        
        query = text("""
            SELECT 
                a.employee_id,
                e.first_name,
                e.last_name,
                e.department_id,
                d.name as department_name,
                a.attendance_date,
                a.check_in_time,
                a.check_out_time,
                a.status,
                COALESCE(a.late_minutes, 0) as late_minutes,
                COALESCE(a.total_hours, 0) as total_hours
            FROM attendance a
            LEFT JOIN employee e ON a.employee_id = e.id
            LEFT JOIN department d ON e.department_id = d.id
            WHERE a.organization_uuid = :org_uuid
            AND a.attendance_date >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
            ORDER BY a.attendance_date DESC
        """)
        
        try:
            with engine.connect() as conn:
                result = conn.execute(query, {"org_uuid": self.org_uuid, "days": days})
                df = pd.DataFrame(result.fetchall(), columns=result.keys())
                print(f"📈 Fetched {len(df)} attendance records")
                return df
                
        except SQLAlchemyError as e:
            print(f"❌ Database error in get_attendance_summary: {e}")
            return pd.DataFrame()
    
    def get_leave_summary(self, days: int = 30) -> pd.DataFrame:
        """
        Get leave requests for the last N days.
        
        Args:
            days: Number of days to look back (default: 30)
            
        Returns:
            Pandas DataFrame with leave request records
        """
        if not engine:
            return pd.DataFrame()
        
        query = text("""
            SELECT 
                lr.id,
                lr.employee_id,
                e.first_name,
                e.last_name,
                lr.leave_type_id,
                lt.name as leave_type,
                lr.start_date,
                lr.end_date,
                lr.status,
                lr.reason,
                lr.created_at
            FROM leave_request lr
            LEFT JOIN employee e ON lr.employee_id = e.id
            LEFT JOIN leave_type lt ON lr.leave_type_id = lt.id
            WHERE lr.organization_uuid = :org_uuid
            AND lr.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
            ORDER BY lr.created_at DESC
        """)
        
        try:
            with engine.connect() as conn:
                result = conn.execute(query, {"org_uuid": self.org_uuid, "days": days})
                df = pd.DataFrame(result.fetchall(), columns=result.keys())
                print(f"📋 Fetched {len(df)} leave requests")
                return df
                
        except SQLAlchemyError as e:
            print(f"❌ Database error in get_leave_summary: {e}")
            return pd.DataFrame()
    
    def get_department_stats(self) -> pd.DataFrame:
        """
        Get department-wise statistics.
        
        Returns:
            Pandas DataFrame with department stats
        """
        if not engine:
            return pd.DataFrame()
        
        query = text("""
            SELECT 
                d.id,
                d.name,
                d.code,
                COUNT(e.id) as employee_count
            FROM department d
            LEFT JOIN employee e ON d.id = e.department_id AND e.is_active = 1
            WHERE d.organization_uuid = :org_uuid
            AND d.is_active = 1
            GROUP BY d.id, d.name, d.code
            ORDER BY employee_count DESC
        """)
        
        try:
            with engine.connect() as conn:
                result = conn.execute(query, {"org_uuid": self.org_uuid})
                df = pd.DataFrame(result.fetchall(), columns=result.keys())
                return df
                
        except SQLAlchemyError as e:
            print(f"❌ Database error in get_department_stats: {e}")
            return pd.DataFrame()


def test_database_connection() -> bool:
    """
    Test if database connection is working.
    
    Returns:
        True if connection successful, False otherwise
    """
    if not engine:
        return False
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
            print("✅ Database connection test: SUCCESS")
            return True
    except Exception as e:
        print(f"❌ Database connection test FAILED: {e}")
        return False