import React, { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import axios from 'axios'

const Feedback = () => {

  const [formData, setFormData] = useState({
    employeeId: '',
    rating: '',
    feedbackType: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setSuccess('')
    setError('')

    try {
      await axios.post(
        'http://localhost:8080/api/employee/employee-feedback',
        {
          ...formData,
          rating: Number(formData.rating), // ensure integer
          employeeId: Number(formData.employeeId)
        }
      )

      setSuccess('Thank you! Your feedback has been submitted successfully.')

      setFormData({
        employeeId: '',
        rating: '',
        feedbackType: '',
        message: ''
      })
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div style={styles.page}>
        <div style={styles.card}>

          <h2 style={styles.title}>Employee Feedback</h2>
          <p style={styles.subtitle}>
            Your feedback helps us improve the workplace 🌱
          </p>

          {success && <div style={styles.success}>{success}</div>}
          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Employee ID */}
            <div style={styles.field}>
              <label style={styles.label}>Employee ID</label>
              <input
                type="number"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                placeholder="Enter your employee ID"
                style={styles.input}
              />
            </div>

            {/* Feedback Type */}
            <div style={styles.field}>
              <label style={styles.label}>Feedback Type</label>
              <select
                name="feedbackType"
                value={formData.feedbackType}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select feedback type</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEGATIVE">Negative</option>
                <option value="SUGGESTION">Suggestion</option>
              </select>
            </div>

            {/* Rating */}
            <div style={styles.field}>
              <label style={styles.label}>Rating</label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Rate your experience</option>
                <option value="1">⭐ Very Bad</option>
                <option value="2">⭐⭐ Bad</option>
                <option value="3">⭐⭐⭐ Average</option>
                <option value="4">⭐⭐⭐⭐ Good</option>
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              </select>
            </div>

            {/* Message */}
            <div style={styles.field}>
              <label style={styles.label}>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Write your feedback here..."
                style={{ ...styles.input, resize: 'none' }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>

          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Feedback

/* ===================== STYLES ===================== */

const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    padding: '30px'
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
  },
  title: {
    marginBottom: '5px',
    fontSize: '22px',
    fontWeight: '600'
  },
  subtitle: {
    marginBottom: '20px',
    color: '#666',
    fontSize: '14px'
  },
  field: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  success: {
    backgroundColor: '#e6fffa',
    color: '#065f46',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px'
  }
}
