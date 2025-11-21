import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function AddJobForm() {
  const navigate = useNavigate();


    useEffect(() => {
  axios.get("http://localhost:8080/api/departments")
    .then(res => setDepartments(res.data))
    .catch(err => console.error("Error loading departments", err));
}, []);

  const [form, setForm] = useState({
    title: "",
    department: "",
    employmentType: "FULL_TIME",
    status: "OPEN",
    postedDate: "",
    closingDate: "",
    availableVacancies: 1,
    description: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/departments")
      .then((res) => setDepartments(res.data || []))
      .catch((err) => console.error("Failed to fetch departments:", err));
  }, []);

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
  }

//   const handleSubmit = async (e)=>{
//     e.preventDefault();

//     try{
//         const response = await axios.post("http://localhost:8080/api/employees", formData);

//         Swal.fire({
//       title: "Success!",
//       text: "Employee added successfully",
//       icon: "success",
//       confirmButtonColor: "#02C39A",
//     }).then(()=>{
//         navigate("/hr_staff/employeemanagement");
//     });

//     console.log("Saved:", response.data);

//     }catch(error){
//       console.error("Error adding employee:", error);
//      Swal.fire({
//       title: "Error!",
//       text: "Failed to save employee",
//       icon: "error",
//       confirmButtonColor: "#d33",
//     });

//     console.error("Save error:", error);
//     }
//   }

  async function handleSubmit(e) {
    e.preventDefault();

    try{
        const response = await axios.post("http://localhost:8080/api/job-postings", form);

        Swal.fire({
      title: "Success!",
      text: "Job Post added successfully",
      icon: "success",
      confirmButtonColor: "#02C39A",
    }).then(()=>{
        navigate("/hr_staff/HiringManagement");
    });

    console.log("Saved:", response.data);

    }catch(error){
      console.error("Error adding Job Post:", error);
     Swal.fire({
      title: "Error!",
      text: "Failed to save job post",
      icon: "error",
      confirmButtonColor: "#d33",
    });

    console.error("Save error:", error);
    }

    if (!form.title.trim()) {
      alert("Job title is required.");
      return;
    }
    if (!form.department) {
      alert("Please select a department.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (avatarFile) payload.append("avatar", avatarFile);

      await axios.post("http://localhost:8080/api/job-postings", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Job posting created successfully!");
      navigate("/hr_staff/hiring-management");
    } catch (err) {
      console.error(err);
      alert("Failed to create job posting.");
    } finally {
      setLoading(false);
    }
  }

  return (
     <div className="w-full h-screen bg-[#F1FDF9] flex justify-center items-center p-6">
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
              <label className="text-sm font-medium text-[#333333]">Job Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleInput}
                placeholder="Software Engineer"
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg focus:ring-2 focus:ring-[#02C39A]"
              />
            </div>


            {/* Department */}
            <div>
              <label className="text-sm font-medium text-[#333333]">Department</label>
              <select
                name="department"
                value={form.department}
                onChange={handleInput}
                className="mt-2 w-full p-3 border border-[#9B9B9B] rounded-lg"
              >
                <option value="">Select department</option>
                {departments.map(dep => (
                    <option key={dep.id} value={dep.id}>
                        {dep.name}
                    </option>
                    ))}
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="text-sm font-medium text-[#333333]">Employment Type</label>
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
              <label className="text-sm font-medium text-[#333333]">Posted Date</label>
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
              <label className="text-sm font-medium text-[#333333]">Closing Date</label>
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
              <label className="text-sm font-medium text-[#333333]">Status</label>
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
              <label className="text-sm font-medium text-[#333333]">Available Vacancies</label>
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
              <label className="text-sm font-medium text-[#333333]">Job Description</label>
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
            <div>
              <label className="text-sm font-medium text-[#333333]">Job Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 w-full text-sm text-[#9B9B9B]"
              />
            </div>
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
