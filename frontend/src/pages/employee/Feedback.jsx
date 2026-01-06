import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import DashboardLayout from '../../components/layout/DashboardLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Alert from '../../components/common/Alert'
import { getCurrentEmployeeProfile } from '../../api/employeeApi'
import apiClient from '../../api/axios'
import Swal from 'sweetalert2'

const Feedback = () => {
  const { user } = useSelector((state) => state.auth)
  const [employeeId, setEmployeeId] = useState(null)
  const [formData, setFormData] = useState({
    rating: '',
    feedbackType: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Fetch current employee profile to get employee ID
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        setProfileLoading(true)
        const response = await getCurrentEmployeeProfile()
        if (response.success && response.data) {
          setEmployeeId(response.data.id)
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unable to fetch your profile. Please refresh the page.',
            confirmButtonColor: '#02C39A'
          })
        }
      } catch (err) {
        console.error('Error fetching employee profile:', err)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Unable to fetch your profile. Please refresh the page.',
          confirmButtonColor: '#02C39A'
        })
      } finally {
        setProfileLoading(false)
      }
    }

    fetchEmployeeProfile()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!employeeId) {
      setError('Employee ID not found. Please refresh the page.')
      return
    }

    setLoading(true)
    setSuccess('')
    setError('')

    try {
      await apiClient.post('/employee/employee-feedback', {
        employeeId: employeeId,
        rating: Number(formData.rating),
        feedbackType: formData.feedbackType,
        message: formData.message
      })

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'Feedback Submitted!',
        text: 'Thank you! Your feedback has been submitted successfully.',
        confirmButtonColor: '#02C39A',
        confirmButtonText: 'OK'
      })

      // Reset form
      setFormData({
        rating: '',
        feedbackType: '',
        message: ''
      })
    } catch (err) {
      console.error(err)
      
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.message || 'Something went wrong. Please try again later.',
        confirmButtonColor: '#02C39A',
        confirmButtonText: 'OK'
      })
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto animate-fade-in">
        
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
            Employee Feedback
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Your feedback helps us improve the workplace 🌱
          </p>
        </div>

        {/* FEEDBACK FORM CARD */}
        <div className="bg-[var(--color-background-white)] rounded-xl p-8 shadow-[0_10px_15px_-3px_rgba(12,57,122,0.1),0_4px_6px_-2px_rgba(12,57,122,0.05)] border border-[#f1f5f9] animate-slide-up">
          
     

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Feedback Type <span className="text-red-500">*</span>
              </label>
              <select
                name="feedbackType"
                value={formData.feedbackType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-2 outline-none transition-all"
              >
                <option value="">Select feedback type</option>
                <option value="COMPLAINT">⚠️ Complaint</option>
                <option value="APPRECIATION">🌟 Appreciation</option>
                <option value="WORK_ENVIRONMENT">🏢 Work Environment</option>
                <option value="MANAGEMENT">👔 Management</option>
                <option value="SYSTEM_ISSUE">🔧 System Issue</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Rating <span className="text-red-500">*</span>
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-2 outline-none transition-all"
              >
                <option value="">Rate your experience</option>
                <option value="1">⭐ 1 - Very Bad</option>
                <option value="2">⭐⭐ 2 - Bad</option>
                <option value="3">⭐⭐⭐ 3 - Average</option>
                <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Share your thoughts, suggestions, or concerns..."
                className="w-full px-4 py-3 rounded-lg border bg-white border-gray-300 text-gray-700 focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] focus:ring-2 outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`
                  bg-[var(--color-primary-500)]
                  text-white px-8 py-3 rounded-lg font-medium
                  hover:bg-[var(--color-primary-600)]
                  transition-all duration-200
                  flex items-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Feedback
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your feedback is anonymous and confidential</p>
              <p className="text-blue-700">We value your honest opinions and use them to improve our workplace environment.</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

export default Feedback
