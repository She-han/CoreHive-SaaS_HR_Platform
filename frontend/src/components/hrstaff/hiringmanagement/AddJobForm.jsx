import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createJobPosting } from "../../../api/hiringService";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../store/slices/authSlice";

export default function AddJobForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    contactEmail: "",
    employmentType: "FULL_TIME",
    status: "OPEN",
    postedDate: "",
    closingDate: "",
    availableVacancies: 1,
    description: ""
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token } = useSelector(selectAuth); // pull JWT from auth slice

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
  }

  // Simple email validation
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!token) {
      Swal.fire("Unauthorized", "Please login first.", "warning");
      return;
    }

    // Validate required fields using SweetAlert
    if (!form.title.trim()) {
      Swal.fire("Required!", "Job title is required.", "warning");
      return;
    }
    if (!form.employmentType) {
      Swal.fire("Required!", "Please select an employment type.", "warning");
      return;
    }
    if (!form.postedDate) {
      Swal.fire("Required!", "Posted date is required.", "warning");
      return;
    }
    if (!form.closingDate) {
      Swal.fire("Required!", "Closing date is required.", "warning");
      return;
    }
    if (!form.status) {
      Swal.fire("Required!", "Please select a status.", "warning");
      return;
    }
    if (!form.availableVacancies || form.availableVacancies < 1) {
      Swal.fire(
        "Required!",
        "Available vacancies must be at least 1.",
        "warning"
      );
      return;
    }
    if (!form.description.trim()) {
      Swal.fire("Required!", "Job description is required.", "warning");
      return;
    }

    if (!form.contactEmail.trim()) {
      Swal.fire("Required!", "Contact email is required.", "warning");
      return;
    }

    if (!isValidEmail(form.contactEmail)) {
      Swal.fire(
        "Invalid Email!",
        "Please enter a valid email address.",
        "warning"
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form
      };

      await createJobPosting(payload, token);

      Swal.fire({
        title: "Success!",
        text: "Job posting created successfully",
        icon: "success",
        confirmButtonColor: "#02C39A"
      }).then(() => {
        navigate("/hr_staff/HiringManagement");
      });
    } catch (error) {
      console.error("Error creating job posting:", error);

      Swal.fire({
        title: "Error!",
        text: "Failed to create job posting",
        icon: "error",
        confirmButtonColor: "#d33"
      });
    } finally {
      setLoading(false);
    }
  }

  // async function handleSubmit(e) {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const payload = {
  //       ...form,
  //       departmentId: form.department // ensure DTO field matches backend
  //     };

  //     await createJobPosting(payload, token);

  //     Swal.fire({
  //       title: "Success!",
  //       text: "Job posting created successfully",
  //       icon: "success",
  //       confirmButtonColor: "#02C39A"
  //     }).then(() => navigate("/hr_staff/HiringManagement"));

  //   } catch (error) {
  //     console.error("Error creating job posting:", error);
  //     Swal.fire("Error", "Failed to create job posting", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  return (
    <div className="w-full  bg-[#F1FDF9] flex justify-center items-center p-6">
      <div className="w-full max-w-5xl h-full bg-white shadow-xl rounded-2xl border border-gray-200 flex flex-col">
        {/* HEADER */}
        <div className="px-8 py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0C397A]">
            Add New Job Posting
          </h1>
          <p className="text-[#9B9B9B] mt-2">
            Fill in the details below to publish a job posting
          </p>
        </div>

        {/* FORM BODY */}
        <form
          onSubmit={handleSubmit}
          className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto"
          style={{ maxHeight: "70vh" }}
        >
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="text-sm font-medium text-[#333333]">
                Job Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleInput}
                placeholder="Software Engineer"
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg focus:ring-2 focus:ring-[#02C39A]"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="text-sm font-medium text-[#333333]">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleInput}
                placeholder="hr@company.com"
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg 
                          focus:ring-2 focus:ring-[#02C39A]"
                required
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className="text-sm font-medium text-[#333333]">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleInput}
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>

            {/* Posted Date */}
            <div>
              <label className="text-sm font-medium text-[#333333]">
                Posted Date
              </label>
              <input
                type="date"
                name="postedDate"
                value={form.postedDate}
                onChange={handleInput}
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg"
              />
            </div>

            {/* Closing Date */}
            <div>
              <label className="text-sm font-medium text-[#333333]">
                Closing Date
              </label>
              <input
                type="date"
                name="closingDate"
                value={form.closingDate}
                onChange={handleInput}
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-[#333333]">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleInput}
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg"
              >
                <option value="OPEN">Open</option>
                <option value="DRAFT">Draft</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* Vacancies */}
            <div>
              <label className="text-sm font-medium text-[#333333]">
                Available Vacancies
              </label>
              <input
                type="number"
                name="availableVacancies"
                value={form.availableVacancies}
                min="1"
                onChange={handleInput}
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg"
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="text-sm font-medium text-[#333333]">
                Job Description
              </label>
              <textarea
                name="description"
                rows="6"
                value={form.description}
                onChange={handleInput}
                placeholder="Describe the position and responsibilities..."
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg"
              />
            </div>

            {/* Avatar Upload */}
            {/* <div>
              <label className="text-sm font-medium text-[#333333]">Job Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 w-full text-sm text-[#9B9B9B]"
              />
            </div> */}
          </div>

          {/* ACTION BUTTONS */}
          <div className="col-span-1 md:col-span-2 flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-[#9B9B9B] rounded-lg text-[#333333] hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#02C39A] text-white font-semibold rounded-lg hover:bg-[#1ED292]"
            >
              {loading ? "Saving..." : "Save Job Posting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
