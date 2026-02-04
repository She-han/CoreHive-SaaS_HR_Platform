// components/hrstaff/notices/NoticeFormModal.jsx
import { useState, useEffect } from "react";
import { createNotice, updateNotice } from "../../../api/NoticeApi";
import {
  FiX,
  FiInfo,
  FiCalendar,
  FiFlag,
  FiLayers,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";
import Swal from "sweetalert2";

const emptyForm = {
  title: "",
  content: "",
  priority: "LOW",
  status: "PUBLISHED",
  publishAt: "",
  expireAt: ""
};

export default function NoticeFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  notice = null
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors , setErrors] = useState({});



  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && notice) {
        setFormData({
          title: notice.title,
          content: notice.content,
          priority: notice.priority,
          status: notice.status,
          publishAt: notice.publishAt?.split("T")[0] || "",
          expireAt: notice.expireAt?.split("T")[0] || ""
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [isOpen, mode, notice]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };


  //================== Form Validation ================= //
  const validateForm = () => {
  const newErrors = {};

  if (!formData.title.trim()) {
    newErrors.title = "Title is required";
  } else if (formData.title.length < 5) {
    newErrors.title = "Title must be at least 5 characters";
  }

  if (!formData.content.trim()) {
    newErrors.content = "Content is required";
  } else if (formData.content.length < 10) {
    newErrors.content = "Content must be at least 10 characters";
  }

  // Publish date validation
if (!formData.publishAt) {
  newErrors.publishAt = "Publish date is required";
} else {
  const publishDate = new Date(formData.publishAt);
  const today = new Date();

  // normalize time (important!)
  today.setHours(0, 0, 0, 0);
  publishDate.setHours(0, 0, 0, 0);

  if (publishDate < today) {
    newErrors.publishAt = "Publish date cannot be in the past";
  }
}


  if (
    formData.publishAt &&
    formData.expireAt &&
    new Date(formData.expireAt) < new Date(formData.publishAt)
  ) {
    newErrors.expireAt = "Expire date must be after publish date";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Prevent submission if validation fails
    setLoading(true);
    try {
      const payload = {
        ...formData,
        publishAt: new Date(`${formData.publishAt}T00:00:00`).toISOString(),
        expireAt: formData.expireAt
          ? new Date(`${formData.expireAt}T23:59:59`).toISOString()
          : null
      };
      if (mode === "edit") await updateNotice(notice.id, payload);
      else await createNotice(payload);
      
      await Swal.fire({
        icon: 'success',
        title: mode === "edit" ? 'Notice Updated!' : 'Notice Created!',
        text: `Notice has been ${mode === "edit" ? "updated" : "published"} successfully.`,
        confirmButtonColor: '#02C39A',
        timer: 2000,
        showConfirmButton: false
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: `Failed to ${mode === "edit" ? "update" : "create"} notice. Please try again.`,
        confirmButtonColor: '#02C39A'
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI Components (Scaled Down) ================= */
  const inputClass =
    "w-full mt-1 bg-white border border-gray-200 rounded-lg p-2 text-sm text-[#333333] transition-all focus:outline-none focus:ring-2 focus:ring-[#02C39A]/20 focus:border-[#02C39A] placeholder:text-gray-300";
  const labelClass =
    "flex items-center gap-1.5 text-[10px] font-bold text-[#333333] uppercase tracking-wider opacity-80";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0C397A]/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Reduced max-width to 'md' (448px) and rounded-3xl for a tighter look */}
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-slideUp">
        {/* Header (Reduced Padding) */}
        <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-[#F1FDF9] to-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-[#333333] tracking-tight">
              {mode === "edit" ? "Update Notice" : "New Notice"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-all"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form Body (Reduced Padding and Spacing) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>
              <FiInfo className="text-[#02C39A]" /> Title
            </label>
            <input
              name="title"
              required
              placeholder="Description title..."
              value={formData.title}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.title && (
  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
)}

          </div>

          <div>
            <label className={labelClass}>
              <FiLayers className="text-[#02C39A]" /> Details
            </label>
            <textarea
              name="content"
              required
              rows={3}
              placeholder="Notice details..."
              value={formData.content}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
            />
            {errors.content && (
  <p className="text-red-500 text-xs mt-1">{errors.content}</p>
)}

          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <FiFlag className="text-[#05668D]" /> Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>           
            </div>
            <div>
              <label className={labelClass}>
                <FiCheckCircle className="text-[#02C39A]" /> Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* Date Section (Compact) */}
          <div className="bg-[#F1FDF9]/40 border border-[#1ED292]/10 rounded-xl p-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <FiCalendar size={12} className="text-[#02C39A]" /> Start
              </label>
              <input
                type="date"
                name="publishAt"
                required
                value={formData.publishAt}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.publishAt && (
  <p className="text-red-500 text-xs mt-1">{errors.publishAt}</p>
)}

            </div>
            <div>
              <label className={labelClass}>
                <FiClock size={12} className="text-[#05668D]" /> End
              </label>
              <input
                type="date"
                name="expireAt"
                value={formData.expireAt}
                onChange={handleChange}
                className={inputClass}
              />
              {errors.expireAt && (
  <p className="text-red-500 text-xs mt-1">{errors.expireAt}</p>
)}

            </div>
          </div>

          {/* Action Buttons (More Compact) */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#9B9B9B] hover:text-[#333333]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#0C397A] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#05668D] transition-all disabled:opacity-50"
            >
              {loading ? "..." : mode === "edit" ? "Update" : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
