import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, CircularProgress, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import Navbar from '../../component/NavBar/Navbar';
import { useJobs } from '../../context/JobsProvider';

const ApplicationsPage = () => {
  const [jobId, setJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { jobs } = useJobs();
  const [jobList, setJobList] = useState([]);

  // Update job list when jobs change
  useEffect(() => {
    if (jobs && jobs.length) {
      const updatedJobList = jobs.map(job => ({
        id: job.id,
        title: job.title,
      }));
      setJobList(updatedJobList);
    }
  }, [jobs]);

  // Fetch applications by job ID
  useEffect(() => {
    const fetchApplications = async () => {
      if (!jobId) return;
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/applications/job/${jobId}`);
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching applications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  // Handle approve/reject actions
  const handleStatusChange = async (applicationId, status) => {
    console.log(`Application ID: ${applicationId}, Status: ${status}`);
    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:8080/api/applications/${applicationId}`, {
        applicationStatus: status,
      });

      if (response.status === 200) {
        setApplications((prevApplications) =>
          prevApplications.map((application) =>
            application.applicationId === applicationId
              ? { ...application, applicationStatus: status }
              : application
          )
        );
      }
    } catch (error) {
      console.error('Error updating application status', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Navbar />
      <Box sx={{ width: "50%", margin: "auto", padding: 3, marginTop: 10 }}>
        <FormControl fullWidth style={{ marginBottom: '20px' }}>
          <InputLabel id="job-select-label">Select Vacancy</InputLabel>
          <Select
            labelId="job-select-label"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            label="Select Vacancy"
          >
            {jobList.map((job) => (
              <MenuItem key={job.id} value={job.id}>
                {job.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {jobId && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Application No</TableCell>
                  <TableCell>Resume</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application, index) => (
                  <TableRow key={application.applicationId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    </TableCell>
                    <TableCell>{application.applicationStatus}</TableCell>
                    <TableCell>{application.appliedDate}</TableCell>
                    <TableCell>
                      <IconButton
                        color="success"
                        onClick={() => handleStatusChange(application.applicationId, 'Approved')}
                        style={{ marginRight: '8px' }}
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleStatusChange(application.applicationId, 'Rejected')}
                      >
                        <Cancel />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default ApplicationsPage;
