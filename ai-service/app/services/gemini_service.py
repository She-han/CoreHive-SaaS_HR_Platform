"""
Google Gemini AI Service for CoreHive

This is the brain of the AI insights feature!
It uses Google's Gemini AI (FREE!) to generate human-readable insights
from HR analytics data.

FREE TIER LIMITS (More than enough for us!):
- 60 requests per minute
- 1,500 requests per day
- No credit card required!
"""

import google.generativeai as genai
from typing import Dict, Any, List
import json
from cachetools import TTLCache
from datetime import datetime

from app.config.settings import settings


# Cache for insights - stores results for 5 minutes
# This reduces API calls and improves response time
insights_cache = TTLCache(maxsize=100, ttl=300)  # 300 seconds = 5 minutes


class GeminiService:
    """
    Service for generating AI-powered insights using Google Gemini.
    
    How it works:
    1. Receives analytics data (attendance, leave, employee stats)
    2. Builds a prompt for the AI
    3. Sends to Google Gemini API
    4. Parses the JSON response
    5. Returns structured insights
    """
    
    def __init__(self):
        """
        Initialize the Gemini service.
        
        Configures the API key and selects the model.
        We use 'gemini-1.5-flash' which is fast and FREE!
        """
        # Check if API key is configured
        if not settings.GEMINI_API_KEY:
            print("⚠️ WARNING: GEMINI_API_KEY not set! AI insights will use fallback mode.")
            self.model = None
            return
        
        # Configure the Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Use gemini-1.5-flash - it's fast, capable, and FREE!
        # Alternative: gemini-1.5-pro (more powerful but slower)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        print("✅ Gemini AI Service initialized successfully!")
    
    async def generate_dashboard_insights(
        self, 
        analytics_data: Dict[str, Any],
        organization_uuid: str
    ) -> List[Dict[str, Any]]:
        """
        Generate AI-powered insights from analytics data.
        
        Args:
            analytics_data: Dictionary containing employee_stats, attendance_analysis, leave_analysis
            organization_uuid: Used as cache key
            
        Returns:
            List of insight dictionaries, each containing:
            - title: Short title with emoji
            - description: 1-2 sentence explanation
            - type: positive/warning/info/critical
            - priority: high/medium/low
            - action: Recommended action
        """
        
        # Check cache first - if we generated insights recently, return cached version
        cache_key = f"insights_{organization_uuid}"
        if cache_key in insights_cache:
            print(f"📦 Returning cached insights for org: {organization_uuid[:8]}...")
            return insights_cache[cache_key]
        
        # If Gemini is not configured, use rule-based fallback
        if not self.model:
            print("🔄 Using rule-based fallback insights...")
            return self._generate_fallback_insights(analytics_data)
        
        # Build the prompt for Gemini
        prompt = self._build_insights_prompt(analytics_data)
        
        try:
            print(f"🤖 Calling Gemini AI for org: {organization_uuid[:8]}...")
            
            # Call Gemini API
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,  # Creativity level (0=conservative, 1=creative)
                    max_output_tokens=1000,  # Max response length
                )
            )
            
            # Get the response text
            response_text = response.text
            print(f"📝 Gemini response received ({len(response_text)} chars)")
            
            # Clean up the response - remove markdown code blocks if present
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            # Parse JSON response
            result = json.loads(response_text.strip())
            
            # Handle different response formats
            if isinstance(result, dict) and 'insights' in result:
                insights = result['insights']
            elif isinstance(result, list):
                insights = result
            else:
                insights = [result]
            
            # Validate and clean insights
            validated_insights = self._validate_insights(insights)
            
            # Cache the results for 5 minutes
            insights_cache[cache_key] = validated_insights
            print(f"✅ Generated {len(validated_insights)} AI insights")
            
            return validated_insights
            
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON parsing error: {e}")
            print("🔄 Falling back to rule-based insights...")
            return self._generate_fallback_insights(analytics_data)
            
        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            print("🔄 Falling back to rule-based insights...")
            return self._generate_fallback_insights(analytics_data)
    
    def _build_insights_prompt(self, data: Dict) -> str:
        """
        Build the prompt for Gemini AI.
        
        A good prompt is key to getting good results!
        We provide:
        - Clear context (HR analytics expert)
        - Structured data
        - Specific output format requirements
        """
        
        employee_stats = data.get('employee_stats', {})
        attendance = data.get('attendance_analysis', {})
        leave = data.get('leave_analysis', {})
        
        return f"""
You are an expert HR analytics assistant. Analyze the following HR data and provide 
3-5 actionable insights for an HR dashboard.

=== HR DATA SUMMARY ===

📊 EMPLOYEE STATISTICS:
- Total Employees: {employee_stats.get('total_employees', 0)}
- Active Employees: {employee_stats.get('active_employees', 0)}
- Inactive Employees: {employee_stats.get('inactive_employees', 0)}
- Total Departments: {employee_stats.get('total_departments', 0)}

📈 ATTENDANCE (Last 30 days):
- Attendance Rate: {attendance.get('attendance_rate', 0)}%
- Present Count: {attendance.get('present_count', 0)}
- Absent Count: {attendance.get('absent_count', 0)}
- Leave Count: {attendance.get('leave_count', 0)}
- Late Arrivals: {attendance.get('late_count', 0)}
- Average Late Minutes: {attendance.get('avg_late_minutes', 0)}
- Frequently Late Employees: {len(attendance.get('frequent_late_employees', []))} people
- Department Attendance: {attendance.get('department_attendance', {})}

📋 LEAVE REQUESTS (Last 30 days):
- Total Requests: {leave.get('total_requests', 0)}
- Status Breakdown: {leave.get('status_breakdown', {})}
- Leave Types: {leave.get('leave_type_breakdown', {})}
- Upcoming Approved Leaves: {leave.get('upcoming_leaves_count', 0)}

=== INSTRUCTIONS ===

Generate 3-5 insights. For EACH insight provide:
1. title: Short title with relevant emoji (max 10 words)
2. description: Clear explanation in 1-2 sentences
3. type: One of [positive, warning, info, critical]
4. priority: One of [high, medium, low]
5. action: One specific actionable recommendation

Priority Guidelines:
- critical: Attendance below 70%, major issues
- high: Attendance below 85%, pending approvals > 5
- medium: Minor issues, informational alerts
- low: Positive observations, minor notes

=== REQUIRED OUTPUT FORMAT ===

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{{
  "insights": [
    {{
      "title": "📊 Example Title Here",
      "description": "Clear description of the insight.",
      "type": "info",
      "priority": "medium",
      "action": "Specific recommended action."
    }}
  ]
}}
"""

    def _validate_insights(self, insights: List[Dict]) -> List[Dict]:
        """
        Validate and clean the insights from Gemini.
        
        Ensures each insight has all required fields with valid values.
        """
        valid_types = {'positive', 'warning', 'info', 'critical'}
        valid_priorities = {'high', 'medium', 'low'}
        validated = []
        
        for insight in insights:
            if not isinstance(insight, dict):
                continue
                
            # Ensure all required fields exist
            validated_insight = {
                "title": str(insight.get('title', '📊 Insight'))[:100],
                "description": str(insight.get('description', 'No description available.'))[:500],
                "type": insight.get('type', 'info') if insight.get('type') in valid_types else 'info',
                "priority": insight.get('priority', 'medium') if insight.get('priority') in valid_priorities else 'medium',
                "action": str(insight.get('action', 'Review the data for more details.'))[:300]
            }
            validated.append(validated_insight)
        
        return validated if validated else self._default_insights()
    
    def _default_insights(self) -> List[Dict]:
        """Return default insights if AI fails completely."""
        return [{
            "title": "✨ System Running Smoothly",
            "description": "AI insights are temporarily unavailable. All systems are operational.",
            "type": "info",
            "priority": "low",
            "action": "Check back later for detailed insights."
        }]
    
    def _generate_fallback_insights(self, data: Dict) -> List[Dict]:
        """
        Generate rule-based insights if AI is unavailable.
        
        This is the backup plan! Uses simple if-else logic to generate
        insights based on the data. Not as smart as AI, but always works.
        """
        insights = []
        
        attendance = data.get('attendance_analysis', {})
        leave = data.get('leave_analysis', {})
        employee_stats = data.get('employee_stats', {})
        
        # ----- Employee Statistics Insights -----
        total_employees = employee_stats.get('total_employees', 0)
        inactive = employee_stats.get('inactive_employees', 0)
        
        if total_employees > 0 and inactive > 0:
            insights.append({
                "title": "👥 Inactive Employee Records",
                "description": f"{inactive} employee(s) are marked as inactive out of {total_employees} total.",
                "type": "info",
                "priority": "low",
                "action": "Review inactive records and update or archive as needed."
            })
        
        # ----- Attendance Rate Insights -----
        attendance_rate = attendance.get('attendance_rate', 100)
        
        if isinstance(attendance_rate, (int, float)):
            if attendance_rate < 70:
                insights.append({
                    "title": "🚨 Critical Attendance Alert",
                    "description": f"Attendance rate is {attendance_rate}% - significantly below acceptable levels.",
                    "type": "critical",
                    "priority": "high",
                    "action": "Immediately investigate root causes and implement corrective measures."
                })
            elif attendance_rate < 80:
                insights.append({
                    "title": "⚠️ Low Attendance Warning",
                    "description": f"Attendance rate is {attendance_rate}% - below the 80% threshold.",
                    "type": "warning",
                    "priority": "high",
                    "action": "Review attendance policies and address issues with affected teams."
                })
            elif attendance_rate < 90:
                insights.append({
                    "title": "📊 Attendance Needs Attention",
                    "description": f"Attendance rate is {attendance_rate}%. Room for improvement.",
                    "type": "info",
                    "priority": "medium",
                    "action": "Monitor trends and consider engagement initiatives."
                })
            elif attendance_rate >= 95:
                insights.append({
                    "title": "✅ Excellent Attendance",
                    "description": f"Outstanding! Attendance rate is {attendance_rate}%.",
                    "type": "positive",
                    "priority": "low",
                    "action": "Consider recognizing teams with perfect attendance."
                })
        
        # ----- Late Arrivals Insights -----
        late_count = attendance.get('late_count', 0)
        
        if late_count > 15:
            insights.append({
                "title": "🕐 High Late Arrival Rate",
                "description": f"{late_count} late arrivals recorded. This is concerning.",
                "type": "warning",
                "priority": "high",
                "action": "Address punctuality issues with affected employees."
            })
        elif late_count > 5:
            insights.append({
                "title": "🕐 Moderate Late Arrivals",
                "description": f"{late_count} late arrivals recorded in the analysis period.",
                "type": "info",
                "priority": "medium",
                "action": "Monitor trends and consider flexible timing policies."
            })
        
        # ----- Frequently Late Employees -----
        frequent_late = attendance.get('frequent_late_employees', [])
        if len(frequent_late) > 0:
            insights.append({
                "title": "👤 Recurring Lateness Detected",
                "description": f"{len(frequent_late)} employee(s) have been late 3+ times.",
                "type": "warning",
                "priority": "medium",
                "action": "Schedule one-on-one meetings to understand underlying issues."
            })
        
        # ----- Pending Leave Requests -----
        status_breakdown = leave.get('status_breakdown', {})
        pending = status_breakdown.get('PENDING', 0)
        
        if pending > 5:
            insights.append({
                "title": "📋 Multiple Pending Requests",
                "description": f"{pending} leave requests are awaiting approval.",
                "type": "warning",
                "priority": "high",
                "action": "Process pending requests to avoid workflow bottlenecks."
            })
        elif pending > 0:
            insights.append({
                "title": "📋 Pending Leave Requests",
                "description": f"{pending} leave request(s) awaiting approval.",
                "type": "info",
                "priority": "medium",
                "action": "Review and process pending leave requests."
            })
        
        # ----- Upcoming Leaves -----
        upcoming = leave.get('upcoming_leaves_count', 0)
        if upcoming > 5:
            insights.append({
                "title": "📅 Multiple Upcoming Leaves",
                "description": f"{upcoming} employees have approved leaves coming up.",
                "type": "info",
                "priority": "medium",
                "action": "Ensure adequate coverage for upcoming absences."
            })
        
        # ----- Default Insight if nothing generated -----
        if not insights:
            insights.append({
                "title": "✨ All Systems Normal",
                "description": "HR metrics are within normal ranges. Keep up the good work!",
                "type": "positive",
                "priority": "low",
                "action": "Continue monitoring and maintain current practices."
            })
        
        return insights