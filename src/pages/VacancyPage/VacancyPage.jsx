import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../component/NavBar/Navbar";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Modal,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

const steps = ["Job Details", "Requirements", "Publish"];

const VacancyPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [jobData, setJobData] = useState({
    title: "",
    companyId: "",
    location: "",
    description: "",
    skillsRequired: "",
    experienceRequired: "",
    industry: "",
    salary: "",
    active: true,
    publishDate: new Date().toISOString().split("T")[0],
  });
  const [jobs, setJobs] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);

  // Fetch jobs by user (company) ID
  const fetchJobs = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/jobs/companies", {
        params: { companyIds: "1,2,3" } // Send companyIds as a comma-separated string
      });
      setJobs(response.data); // Update your state with the fetched jobs
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  // Create Job API Call
  const handleSubmit = async () => {
    try {
      if (editingJobId) {
        // If updating an existing job
        await axios.put(`http://localhost:8080/api/jobs/update/${editingJobId}`, jobData);
        alert("Job Updated Successfully!");
      } else {
        // If creating a new job
        await axios.post("http://localhost:8080/api/jobs/create", jobData);
        alert("Job Created Successfully!");
      }

      setJobData({
        title: "",
        companyId: "",
        location: "",
        description: "",
        skillsRequired: "",
        experienceRequired: "",
        industry: "",
        salary: "",
        active: true,
        publishDate: new Date().toISOString().split("T")[0],
      });
      setActiveStep(0);
      setOpenModal(false);
      fetchJobs();  // Refresh the jobs list after creating or updating a job
    } catch (error) {
      console.error("Error creating/updating job:", error);
      alert("Failed to create/update job");
    }
  };

  // Handle changes in input fields
  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  // Handle step navigation
  const handleNext = () => setActiveStep((prevStep) => prevStep + 1);
  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  // Delete Job
  const handleDelete = async (jobId) => {
    try {
      await axios.delete(`http://localhost:8080/api/jobs/delete/${jobId}`);
      alert("Job Deleted Successfully!");
      fetchJobs();  // Refresh the jobs list after deleting
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  // Open and close modal for creating/updating a job
  const handleOpenModal = (job = null) => {
    if (job) {
      setEditingJobId(job.id);
      setJobData({
        ...job,
        publishDate: job.publishDate.split("T")[0], // Formatting the publish date for input
      });
      setActiveStep(0);
    } else {
      setEditingJobId(null);
      setJobData({
        title: "",
        companyId: "",
        location: "",
        description: "",
        skillsRequired: "",
        experienceRequired: "",
        industry: "",
        salary: "",
        active: true,
        publishDate: new Date().toISOString().split("T")[0],
      });
    }
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <Box>
      <Navbar />
      <Box sx={{ width: "50%", margin: "auto", padding: 3, marginTop: 10 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Create New Vacancy
        </Button>

        {/* Displaying jobs associated with the company */}
        <Box sx={{ mt: 3 }}>
          {jobs.map((job) => (
            <Box key={job.id} sx={{ border: "1px solid #ddd", padding: 2, marginBottom: 2 }}>
              <Typography variant="h6">{job.title}</Typography>
              <Typography>{job.location}</Typography>
              <Typography>{job.skillsRequired}</Typography>
              <Button onClick={() => handleDelete(job.id)} variant="contained" color="error">
                Delete
              </Button>
              <Button onClick={() => handleOpenModal(job)} variant="contained" color="primary" sx={{ ml: 2 }}>
                Update
              </Button>
            </Box>
          ))}
        </Box>

        {/* Modal for job creation/update */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={{ width: 400, margin: "auto", padding: 3, marginTop: 10, backgroundColor: "white", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{editingJobId ? "Update Job" : "Create a Job"}</Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 3 }}>
              {activeStep === 0 && (
                <>
                  <TextField label="Job Title" name="title" fullWidth margin="normal" onChange={handleChange} value={jobData.title} />
                  <TextField label="Company ID" name="companyId" fullWidth margin="normal" onChange={handleChange} value={jobData.companyId} />
                  <TextField label="Location" name="location" fullWidth margin="normal" onChange={handleChange} value={jobData.location} />
                </>
              )}
              {activeStep === 1 && (
                <>
                  <TextField label="Description" name="description" fullWidth margin="normal" onChange={handleChange} value={jobData.description} />
                  <TextField label="Skills Required" name="skillsRequired" fullWidth margin="normal" onChange={handleChange} value={jobData.skillsRequired} />
                  <TextField label="Experience Required" name="experienceRequired" fullWidth margin="normal" onChange={handleChange} value={jobData.experienceRequired} />
                </>
              )}
              {activeStep === 2 && (
                <>
                  <TextField label="Industry" name="industry" fullWidth margin="normal" onChange={handleChange} value={jobData.industry} />
                  <TextField label="Salary" name="salary" fullWidth margin="normal" onChange={handleChange} value={jobData.salary} />
                </>
              )}
            </Box>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
              <Button disabled={activeStep === 0} onClick={handleBack} variant="contained">
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button onClick={handleSubmit} variant="contained" color="primary">
                  Submit
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained" color="primary">
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default VacancyPage;
