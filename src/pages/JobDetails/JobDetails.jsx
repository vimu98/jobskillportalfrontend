import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  checkApplication,
  applyForJob,
  clearApplicationStatus,
} from '../../store/jobsSlice';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../component/Navbar/Navbar';
import Chatbot from '../../component/Chatbot/Chatbot';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
  Snackbar,
  Box,
} from '@mui/material';

function JobDetails() {
  const location = useLocation();
  const { job } = location.state || {};
  const dispatch = useDispatch();
  const { user, resume } = useAuth();
  const { hasApplied, loading, error, applicationStatus } = useSelector((state) => state.jobs);

  useEffect(() => {
    if (user && job) {
      dispatch(checkApplication({ jobId: job.id, userId: user.id }));
    }
    return () => {
      dispatch(clearApplicationStatus());
    };
  }, [user, job, dispatch]);

  const handleApplyJob = () => {
    const applicationData = {
      applicationId: 0,
      jobId: job.id,
      applicantId: user.id,
      resumeUrl: resume,
      applicationStatus: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    dispatch(applyForJob(applicationData));
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
                    <strong>Publish Date:</strong>{' '}
                    {new Date(job.publishDate).toLocaleDateString()}
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
                        <Chip
                          key={index}
                          label={skill}
                          sx={{ marginRight: 1, marginBottom: 1 }}
                        />
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
                {loading ? (
                  <Typography>Loading...</Typography>
                ) : error ? (
                  <Typography color="error">Error: {error}</Typography>
                ) : hasApplied ? (
                  <Typography variant="body1" color="primary" align="center">
                    You have already applied for this job.
                  </Typography>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleApplyJob}
                  >
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
          open={!!applicationStatus}
          autoHideDuration={6000}
          onClose={() => dispatch(clearApplicationStatus())}
          message={applicationStatus}
        />
      </Container>
    </Box>
  );
}

export default JobDetails;