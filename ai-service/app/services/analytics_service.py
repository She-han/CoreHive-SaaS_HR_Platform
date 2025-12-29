"""
Analytics Service for CoreHive AI Service

This service analyzes HR data and calculates metrics.
These metrics are then used by the AI to generate insights.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from app.repositories.database import HRDataRepository


class AnalyticsService:
    """
    Service for HR data analytics and pattern detection.
    
    This service:
    1. Fetches data from database via HRDataRepository
    2. Analyzes patterns in attendance, leave, etc.
    3. Calculates key metrics
    4. Prepares data for AI insight generation
    """
    
    def __init__(self, organization_uuid: str):
        """
        Initialize analytics service for an organization.
        
        Args:
            organization_uuid: The unique identifier for the organization
        """
        self.org_uuid = organization_uuid
        self.repo = HRDataRepository(organization_uuid)
        print(f"📊 AnalyticsService initialized for org: {organization_uuid[:8]}...")
    
    def analyze_attendance_patterns(self, days: int = 30) -> Dict[str, Any]:
        """
        Analyze attendance patterns and detect anomalies.
        
        This method:
        - Calculates attendance rate
        - Finds frequently late employees
        - Analyzes department-wise attendance
        
        Args:
            days: Number of days to analyze (default: 30)
            
        Returns:
            Dictionary with attendance analysis results
        """
        df = self.repo.get_attendance_summary(days=days)
        
        # If no data, return empty analysis
        if df.empty:
            return {
                "period": f"Last {days} days",
                "message": "No attendance data available",
                "total_records": 0,
                "attendance_rate": 0,
                "present_count": 0,
                "absent_count": 0,
                "late_count": 0,
                "avg_late_minutes": 0,
                "frequent_late_employees": [],
                "department_attendance": {}
            }
        
        # Calculate basic metrics
        total_records = len(df)
        
        # Count by status (handle both string and None values)
        present_count = len(df[df['status'].str.upper() == 'PRESENT']) if 'status' in df.columns else 0
        absent_count = len(df[df['status'].str.upper() == 'ABSENT']) if 'status' in df.columns else 0
        leave_count = len(df[df['status'].str.upper() == 'LEAVE']) if 'status' in df.columns else 0
        
        # Attendance rate calculation
        # Formula: (Present / (Present + Absent)) * 100
        # We exclude LEAVE and HOLIDAY from denominator
        work_days = present_count + absent_count
        attendance_rate = (present_count / work_days * 100) if work_days > 0 else 0
        
        # Late arrivals analysis
        late_count = 0
        avg_late_minutes = 0
        frequent_late_employees = []
        
        if 'late_minutes' in df.columns:
            # Filter rows where late_minutes > 0
            late_df = df[df['late_minutes'] > 0]
            late_count = len(late_df)
            
            if not late_df.empty:
                avg_late_minutes = late_df['late_minutes'].mean()
                
                # Find employees who were late 3+ times
                late_by_employee = late_df.groupby(
                    ['employee_id', 'first_name', 'last_name']
                ).size().reset_index(name='late_count')
                
                frequent_late = late_by_employee[late_by_employee['late_count'] >= 3]
                
                if not frequent_late.empty:
                    frequent_late_employees = frequent_late.to_dict('records')
        
        # Department-wise attendance analysis
        department_attendance = {}
        if 'department_name' in df.columns and 'status' in df.columns:
            dept_groups = df.groupby('department_name')
            for dept_name, group in dept_groups:
                if dept_name:  # Skip None values
                    dept_total = len(group)
                    dept_present = len(group[group['status'].str.upper() == 'PRESENT'])
                    dept_rate = (dept_present / dept_total * 100) if dept_total > 0 else 0
                    department_attendance[dept_name] = round(dept_rate, 2)
        
        return {
            "period": f"Last {days} days",
            "total_records": total_records,
            "attendance_rate": round(attendance_rate, 2),
            "present_count": present_count,
            "absent_count": absent_count,
            "leave_count": leave_count,
            "late_count": late_count,
            "avg_late_minutes": round(avg_late_minutes, 2),
            "frequent_late_employees": frequent_late_employees,
            "department_attendance": department_attendance
        }
    
    def analyze_leave_patterns(self, days: int = 30) -> Dict[str, Any]:
        """
        Analyze leave request patterns.
        
        This method:
        - Counts leave requests by status
        - Analyzes leave type distribution
        - Identifies upcoming approved leaves
        
        Args:
            days: Number of days to analyze (default: 30)
            
        Returns:
            Dictionary with leave analysis results
        """
        df = self.repo.get_leave_summary(days=days)
        
        if df.empty:
            return {
                "period": f"Last {days} days",
                "message": "No leave data available",
                "total_requests": 0,
                "status_breakdown": {},
                "leave_type_breakdown": {},
                "upcoming_leaves_count": 0,
                "upcoming_leaves": []
            }
        
        # Total requests
        total_requests = len(df)
        
        # Status breakdown (PENDING, APPROVED, REJECTED)
        status_breakdown = {}
        if 'status' in df.columns:
            status_counts = df['status'].value_counts().to_dict()
            status_breakdown = {str(k): int(v) for k, v in status_counts.items()}
        
        # Leave type breakdown
        leave_type_breakdown = {}
        if 'leave_type' in df.columns:
            type_counts = df['leave_type'].value_counts().to_dict()
            leave_type_breakdown = {str(k): int(v) for k, v in type_counts.items() if k}
        
        # Upcoming approved leaves
        upcoming_leaves = []
        upcoming_count = 0
        
        if 'status' in df.columns and 'start_date' in df.columns:
            today = datetime.now().date()
            
            # Convert start_date to datetime if it's not already
            if df['start_date'].dtype == 'object':
                df['start_date'] = pd.to_datetime(df['start_date'], errors='coerce')
            
            # Filter approved leaves starting in future
            approved_df = df[df['status'].str.upper() == 'APPROVED']
            
            if not approved_df.empty and 'start_date' in approved_df.columns:
                future_leaves = approved_df[
                    approved_df['start_date'].dt.date > today
                ]
                upcoming_count = len(future_leaves)
                
                if not future_leaves.empty:
                    # Get top 5 upcoming leaves
                    upcoming_data = future_leaves.head(5)[[
                        'first_name', 'last_name', 'leave_type', 'start_date', 'end_date'
                    ]].copy()
                    
                    # Convert dates to strings
                    upcoming_data['start_date'] = upcoming_data['start_date'].dt.strftime('%Y-%m-%d')
                    upcoming_data['end_date'] = pd.to_datetime(
                        upcoming_data['end_date'], errors='coerce'
                    ).dt.strftime('%Y-%m-%d')
                    
                    upcoming_leaves = upcoming_data.to_dict('records')
        
        return {
            "period": f"Last {days} days",
            "total_requests": total_requests,
            "status_breakdown": status_breakdown,
            "leave_type_breakdown": leave_type_breakdown,
            "upcoming_leaves_count": upcoming_count,
            "upcoming_leaves": upcoming_leaves
        }
    
    def get_dashboard_metrics(self) -> Dict[str, Any]:
        """
        Get all metrics for the dashboard.
        
        This is the main method called by the insights router.
        It combines:
        - Employee statistics
        - Attendance analysis
        - Leave analysis
        
        Returns:
            Dictionary with all dashboard metrics
        """
        print(f"📊 Generating dashboard metrics for org: {self.org_uuid[:8]}...")
        
        # Gather all metrics
        employee_stats = self.repo.get_employee_stats()
        attendance_analysis = self.analyze_attendance_patterns()
        leave_analysis = self.analyze_leave_patterns()
        
        return {
            "employee_stats": employee_stats,
            "attendance_analysis": attendance_analysis,
            "leave_analysis": leave_analysis,
            "generated_at": datetime.now().isoformat()
        }