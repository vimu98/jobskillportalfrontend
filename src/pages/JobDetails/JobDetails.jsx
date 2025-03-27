import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Paper, Typography, Grid, Chip, Divider, Button, Snackbar } from '@mui/material';
import axios from 'axios';
import { useAuth } from "./../../context/AuthContext";

function JobDetails() {
  const location = useLocation();
  const { job } = location.state || {};
  
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false); // To check if the user has applied
  const { user, resume } = useAuth();

  // Fetch applications to check if the user has applied
  useEffect(() => {
    const checkIfApplied = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/applications');
        const applications = response.data;

        // Check if the user has applied for the current job
        const appliedJob = applications.some(
          (application) => application.jobId === job.id && application.applicantId === user.id
        );

        setHasApplied(appliedJob); // Set the state if the user has applied
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    if (user && job) {
      checkIfApplied(); // Only check if user and job exist
    }
  }, [user, job]); // Re-run when user or job changes

  const handleApplyJob = async () => {
    console.log("Job ID:", job); // Log the job ID to verify it's being passed correctly
    const applicationData = {
      applicationId: 0, // Example application ID, could be dynamic
      jobId: job.id,  // Job ID from the job object
      applicantId: user.id,    // Example applicant ID, you can set this dynamically based on the logged-in user
      resumeUrl: resume, // Example resume URL
      applicationStatus: "Pending",
      appliedDate: new Date().toISOString().split('T')[0], // Current date in 'yyyy-mm-dd' format
    };

    try {
      const response = await axios.post('http://localhost:8080/api/applications/upload', applicationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSnackbarMessage('Application submitted successfully!');
      setOpenSnackbar(true);
      setHasApplied(true); // Set the state to true after applying
    } catch (error) {
      setSnackbarMessage('Failed to submit application!');
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        {job ? (
          <div>
            <Typography variant="h4" gutterBottom>
              Job Title: {job.title}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={3}>
              {/* Left section for company, location, and status */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Location:</strong> {job.location}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Company:</strong> {job.company}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Status:</strong> {job.active ? 'Active' : 'Inactive'}
                </Typography>
              </Grid>

              {/* Right section for salary, experience, publish date, and industry */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Salary:</strong> {job.salary}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Experience Required:</strong> {job.experienceRequired}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Publish Date:</strong> {new Date(job.publishDate).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Job Industry:</strong> {job.industry}
                </Typography>
              </Grid>

              {/* Skills */}
              <Grid item xs={12}>
                <Typography variant="body2">
                  <strong>Skills Required:</strong>
                  <div>
                    {job.skillsRequired?.split(',').map((skill, index) => (
                      <Chip key={index} label={skill} sx={{ marginRight: 1, marginBottom: 1 }} />
                    ))}
                  </div>
                </Typography>
              </Grid>

              {/* Job Description moved to bottom */}
              <Grid item xs={12}>
                <Typography variant="body1" paragraph>
                  <strong>Job Description:</strong> {job.description}
                </Typography>
              </Grid>
            </Grid>

            {/* Conditional render for Apply Button or Already Applied note */}
            <div style={{ marginTop: '20px' }}>
              {hasApplied ? (
                <Typography variant="body1" color="primary" align="center">
                  You have already applied for this job.
                </Typography>
              ) : (
                <Button variant="contained" color="primary" fullWidth onClick={handleApplyJob}>
                  Apply for Job
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Typography variant="h6" color="textSecondary">
            No job details available.
          </Typography>
        )}
      </Paper>

      {/* Snackbar to show success or error message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default JobDetails;
