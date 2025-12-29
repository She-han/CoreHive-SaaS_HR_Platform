/**
 * AI Insights Card Component
 * 
 * Displays AI-generated insights on the dashboard.
 * Features:
 * - Loading skeleton animation
 * - Color-coded insight types (positive, warning, critical, info)
 * - Error handling with retry functionality
 * - Refresh button to get new insights
 */

import React, { useState, useEffect, useCallback } from 'react';
import aiInsightsApi from '../../api/aiInsightsApi';

// Insight type configurations with colors and icons
const insightTypeConfig = {
    positive: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconBg: 'bg-green-100',
        icon: (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    warning: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconBg: 'bg-yellow-100',
        icon: (
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    critical: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconBg: 'bg-red-100',
        icon: (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    info: {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconBg: 'bg-blue-100',
        icon: (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
};

// Priority badge configurations
const priorityConfig = {
    high: { bgColor: 'bg-red-100', textColor: 'text-red-700' },
    medium: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
    low: { bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
};

/**
 * Skeleton Loader Component
 * Shows animated placeholder while loading
 */
const InsightSkeleton = () => (
    <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

/**
 * Single Insight Item Component
 */
const InsightItem = ({ insight, isExpanded, onToggle }) => {
    const config = insightTypeConfig[insight.type] || insightTypeConfig.info;
    const priority = priorityConfig[insight.priority] || priorityConfig.medium;

    return (
        <div
            className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer`}
            onClick={onToggle}
        >
            <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`${config.iconBg} p-2 rounded-full flex-shrink-0`}>
                    {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header with title and priority */}
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold ${config.textColor} text-sm`}>
                            {insight.title}
                        </h4>
                        <span className={`${priority.bgColor} ${priority.textColor} text-xs px-2 py-0.5 rounded-full font-medium`}>
                            {insight.priority}
                        </span>
                    </div>

                    {/* Description */}
                    <p className={`text-sm ${config.textColor} opacity-80`}>
                        {insight.description}
                    </p>

                    {/* Action (shown when expanded) */}
                    {isExpanded && insight.action && (
                        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                            <p className="text-xs font-medium uppercase tracking-wide opacity-60 mb-1">
                                Recommended Action
                            </p>
                            <p className={`text-sm ${config.textColor}`}>
                                {insight.action}
                            </p>
                        </div>
                    )}

                    {/* Expand indicator */}
                    {insight.action && (
                        <div className="mt-2 flex items-center text-xs opacity-60">
                            <span>{isExpanded ? 'Click to collapse' : 'Click for action'}</span>
                            <svg
                                className={`w-4 h-4 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Error Display Component
 */
const ErrorDisplay = ({ error, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 className="text-red-800 font-semibold mb-2">Failed to Load Insights</h4>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
            Try Again
        </button>
    </div>
);

/**
 * Empty State Component
 */
const EmptyState = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h4 className="text-gray-800 font-semibold mb-2">No Insights Available</h4>
        <p className="text-gray-600 text-sm">
            AI insights will appear here once there's enough data to analyze.
        </p>
    </div>
);

/**
 * Main AI Insights Card Component
 */
const AIInsightsCard = ({ organizationUuid }) => {
    const [insights, setInsights] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [source, setSource] = useState(null);

    // Fetch insights from AI Service
    const fetchInsights = useCallback(async () => {
        if (!organizationUuid) {
            setError('Organization UUID is required');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await aiInsightsApi.getDashboardInsights(organizationUuid);
            
            if (response.success) {
                setInsights(response.insights || []);
                setMetrics(response.metrics || null);
                setSource(response.source || 'unknown');
                setLastUpdated(new Date());
            } else {
                setError('Failed to get insights');
            }
        } catch (err) {
            console.error('Error fetching insights:', err);
            setError(err.message || 'Failed to connect to AI Service');
        } finally {
            setLoading(false);
        }
    }, [organizationUuid]);

    // Fetch on mount and when organizationUuid changes
    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    // Toggle insight expansion
    const handleToggle = (index) => {
        setExpandedId(expandedId === index ? null : index);
    };

    // Format last updated time
    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        return lastUpdated.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* AI Icon */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                            <p className="text-xs text-gray-500">
                                Powered by Google Gemini
                                {source === 'fallback' && ' (Fallback Mode)'}
                            </p>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="flex items-center space-x-3">
                        {lastUpdated && (
                            <span className="text-xs text-gray-500">
                                Updated {formatLastUpdated()}
                            </span>
                        )}
                        <button
                            onClick={fetchInsights}
                            disabled={loading}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh Insights"
                        >
                            <svg
                                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {loading ? (
                    <InsightSkeleton />
                ) : error ? (
                    <ErrorDisplay error={error} onRetry={fetchInsights} />
                ) : insights.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-3">
                        {insights.map((insight, index) => (
                            <InsightItem
                                key={index}
                                insight={insight}
                                isExpanded={expandedId === index}
                                onToggle={() => handleToggle(index)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer with Quick Stats (if metrics available) */}
            {!loading && !error && metrics && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                            {metrics.employee_stats && (
                                <span>
                                    👥 {metrics.employee_stats.active_employees || 0} active employees
                                </span>
                            )}
                            {metrics.attendance_analysis && (
                                <span>
                                    📊 {metrics.attendance_analysis.attendance_rate || 0}% attendance
                                </span>
                            )}
                            {metrics.leave_analysis && (
                                <span>
                                    📋 {metrics.leave_analysis.status_breakdown?.PENDING || 0} pending leaves
                                </span>
                            )}
                        </div>
                        <span className="text-indigo-600 font-medium">
                            {insights.length} insight{insights.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInsightsCard;