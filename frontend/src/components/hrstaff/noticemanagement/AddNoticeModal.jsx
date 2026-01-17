// components/hrstaff/notices/AddNoticeModal.jsx
import { useState, useEffect } from "react";
import { createNotice } from "../../../api/NoticeApi";
import { FiX, FiInfo, FiCalendar, FiFlag, FiLayers , FiClock } from "react-icons/fi";

const initialFormState = {
  title: "",
  content: "",
  priority: "LOW",
  status: "PUBLISHED",
  publishAt: "",
  expireAt: "",
};

export default function AddNoticeModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setFormData(initialFormState);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createNotice({
        ...formData,
        publishAt: new Date(formData.publishAt).toISOString(),
        expireAt: formData.expireAt ? new Date(formData.expireAt).toISOString() : null,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to create notice");
    } finally {
      setLoading(false);
    }
  };

  // Shared Input Styles
  const inputClass = "w-full mt-1.5 bg-white border border-gray-200 rounded-xl p-2.5 text-sm text-[#333333] focus:ring-2 focus:ring-[#02C39A]/20 focus:border-[#02C39A] outline-none transition-all placeholder:text-[#9B9B9B]";
  const labelClass = "flex items-center gap-2 text-xs font-bold text-[#333333] uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0C397A]/20 backdrop-blur-md animate-fadeIn" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-[#F1FDF9]/50">
          <div>
            <h2 className="text-xl font-extrabold text-[#333333] flex items-center gap-2">
              Create New Notice
            </h2>
            <p className="text-xs text-[#9B9B9B] mt-1 font-medium">Broadcast information to the entire team.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white hover:shadow-sm rounded-full text-[#9B9B9B] hover:text-red-500 transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {/* Title */}
          <div>
            <label className={labelClass}><FiInfo size={14} className="text-[#02C39A]"/> Title</label>
            <input
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g., Annual Office Retreat 2026"
            />
          </div>

          {/* Content */}
          <div>
            <label className={labelClass}><FiLayers size={14} className="text-[#02C39A]"/> Description</label>
            <textarea
              name="content"
              required
              rows={4}
              value={formData.content}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
              placeholder="Provide detailed information here..."
            />
          </div>

          {/* Priority + Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><FiFlag size={14} className="text-[#05668D]"/> Priority Level</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="PUBLISHED">Immediate Publish</option>
                <option value="DRAFT">Save as Draft</option>
              </select>
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4 bg-[#F1FDF9]/30 p-4 rounded-xl border border-[#1ED292]/10">
            <div>
              <label className={labelClass}><FiCalendar size={14} className="text-[#02C39A]"/> Publish Date</label>
              <input
                type="datetime-local"
                name="publishAt"
                required
                value={formData.publishAt}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}><FiClock size={14} className="text-[#05668D]"/> Expiry Date (Optional)</label>
              <input
                type="datetime-local"
                name="expireAt"
                value={formData.expireAt}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-[#9B9B9B] hover:text-[#333333] transition-colors"
            >
              Discard
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-[#0C397A] text-white rounded-xl text-sm font-bold hover:bg-[#05668D] shadow-lg shadow-[#0C397A]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Create Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}