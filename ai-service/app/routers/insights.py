"""
Insights Router

This is the main API for getting AI-generated insights.
The frontend calls these endpoints to get dashboard insights.
"""

from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.services.analytics_service import AnalyticsService
from app.services.gemini_service import GeminiService


# Create router instance
router = APIRouter()


# ----- Pydantic Models for API Response -----

class InsightItem(BaseModel):
    """Single insight item structure"""
    title: str
    description: str
    type: str  # positive, warning, info, critical
    priority: str  # high, medium, low
    action: Optional[str] = None


class DashboardInsightsResponse(BaseModel):
    """Full dashboard insights response"""
    success: bool
    insights: List[InsightItem]
    metrics: dict
    generated_at: str
    source: str  # 'ai' or 'fallback'


class MetricsResponse(BaseModel):
    """Metrics-only response"""
    success: bool
    data: dict
    generated_at: str


# ----- API Endpoints -----

@router.get("/dashboard", response_model=DashboardInsightsResponse)
async def get_dashboard_insights(
    organization_uuid: str = Header(..., alias="X-Organization-UUID",
                                     description="Organization UUID from JWT token")
):
    """
    Get AI-generated insights for the dashboard.
    
    This is the main endpoint called by the frontend.
    
    Flow:
    1. Get organization UUID from header
    2. Fetch analytics data from database
    3. Send to Gemini AI for insights
    4. Return formatted response
    
    Headers:
        X-Organization-UUID: The organization's UUID (required)
        
    Returns:
        DashboardInsightsResponse with insights and metrics
    """
    try:
        print(f"\n{'='*50}")
        print(f"📊 Dashboard insights requested for org: {organization_uuid[:8]}...")
        
        # Step 1: Get analytics data
        analytics_service = AnalyticsService(organization_uuid)
        metrics = analytics_service.get_dashboard_metrics()
        
        # Step 2: Generate AI insights
        gemini_service = GeminiService()
        insights = await gemini_service.generate_dashboard_insights(
            metrics, 
            organization_uuid
        )
        
        # Determine source (AI or fallback)
        source = "ai" if gemini_service.model else "fallback"
        
        print(f"✅ Returning {len(insights)} insights (source: {source})")
        print(f"{'='*50}\n")
        
        return DashboardInsightsResponse(
            success=True,
            insights=insights,
            metrics=metrics,
            generated_at=datetime.now().isoformat(),
            source=source
        )
        
    except Exception as e:
        print(f"❌ Error generating insights: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate insights: {str(e)}"
        )


@router.get("/attendance")
async def get_attendance_insights(
    organization_uuid: str = Header(..., alias="X-Organization-UUID"),
    days: int = Query(default=30, ge=1, le=365, description="Number of days to analyze")
):
    """
    Get attendance-specific analytics.
    
    Returns detailed attendance metrics without AI processing.
    Useful for attendance-specific dashboards.
    """
    try:
        analytics_service = AnalyticsService(organization_uuid)
        data = analytics_service.analyze_attendance_patterns(days=days)
        
        return MetricsResponse(
            success=True,
            data=data,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leaves")
async def get_leave_insights(
    organization_uuid: str = Header(..., alias="X-Organization-UUID"),
    days: int = Query(default=30, ge=1, le=365)
):
    """
    Get leave-specific analytics.
    
    Returns detailed leave metrics without AI processing.
    """
    try:
        analytics_service = AnalyticsService(organization_uuid)
        data = analytics_service.analyze_leave_patterns(days=days)
        
        return MetricsResponse(
            success=True,
            data=data,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/employees")
async def get_employee_stats(
    organization_uuid: str = Header(..., alias="X-Organization-UUID")
):
    """
    Get employee statistics.
    
    Returns basic employee counts and department stats.
    """
    try:
        analytics_service = AnalyticsService(organization_uuid)
        stats = analytics_service.repo.get_employee_stats()
        
        return MetricsResponse(
            success=True,
            data=stats,
            generated_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))