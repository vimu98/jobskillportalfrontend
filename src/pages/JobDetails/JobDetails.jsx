import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Chip, 
  Divider, 
  Button, 
  Snackbar,
  Box
} from '@mui/material';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";
import Navbar from '../../component/Navbar/Navbar';
import Chatbot from '../../component/Chatbot/Chatbot';

function JobDetails() {
  const location = useLocation();
  const { job } = location.state || {};
  
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const { user, resume } = useAuth();

  useEffect(() => {
    const checkIfApplied = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/applications');
        const applications = response.data;
        const appliedJob = applications.some(
          (application) => application.jobId === job?.id && application.applicantId === user?.id
        );
        setHasApplied(appliedJob);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    if (user && job) {
      checkIfApplied();
    }
  }, [user, job]);

  const handleApplyJob = async () => {
    const applicationData = {
      applicationId: 0,
      jobId: job.id,
      applicantId: user.id,
      resumeUrl: resume,
      applicationStatus: "Pending",
      appliedDate: new Date().toISOString().split('T')[0],
    };

    try {
      await axios.post('http://localhost:8080/api/applications/upload', applicationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSnackbarMessage('Application submitted successfully!');
      setOpenSnackbar(true);
      setHasApplied(true);
    } catch (error) {
      setSnackbarMessage('Failed to submit application!');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          {job ? (
            <div>
              <Typography variant="h4" gutterBottom>
                {job.title}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
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
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    <strong>Job Description:</strong> {job.description}
                  </Typography>
                </Grid>
              </Grid>

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
        
        <Chatbot job={job} />

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message={snackbarMessage}
        />
      </Container>
    </Box>
  );
}

export default JobDetails;