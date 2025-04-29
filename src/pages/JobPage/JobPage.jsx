import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchJobs,
  setLocationFilter,
  setIndustryFilter,
  setMinSalaryFilter,
  setMaxSalaryFilter,
  setSearchTerm,
  applyFilters,
} from '../../store/jobsSlice';
import JobCard from '../../component/JobCard/JobCard';
import Navbar from '../../component/NavBar/Navbar';
import {
  Grid,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import CustomPagination from '../../component/Pagination/CustomPagination';
import SuggetionCarousel from '../../component/SuggetionCarousel/SuggetionCarousel';

const JobPage = () => {
  const jobsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const { filteredJobs, filters } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    dispatch(applyFilters());
  }, [filters, dispatch]);

  const handleLocationChange = (event) => {
    dispatch(setLocationFilter(event.target.value));
  };

  const handleIndustryChange = (event) => {
    dispatch(setIndustryFilter(event.target.value));
  };

  const handleMinSalaryChange = (event) => {
    dispatch(setMinSalaryFilter(event.target.value));
  };

  const handleMaxSalaryChange = (event) => {
    dispatch(setMaxSalaryFilter(event.target.value));
  };

  const handleSearchChange = (event) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const displayedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);


  return (
    <div>
      <Navbar />
      <SuggetionCarousel />

      {/* Filters */}
      <Grid container spacing={2} padding={2} justifyContent="space-between">
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={filters.location}
              onChange={handleLocationChange}
              label="Location"
            >
              <MenuItem value="">All Locations</MenuItem>
              <MenuItem value="New York">New York</MenuItem>
              <MenuItem value="San Francisco">San Francisco</MenuItem>
              <MenuItem value="Los Angeles">Los Angeles</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select
              value={filters.industry}
              onChange={handleIndustryChange}
              label="Industry"
            >
              <MenuItem value="">All Industries</MenuItem>
              <MenuItem value="IT">IT</MenuItem>
              <MenuItem value="Healthcare">Healthcare</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Min Salary"
            type="number"
            value={filters.minSalary}
            onChange={handleMinSalaryChange}
            placeholder="Enter min salary"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Max Salary"
            type="number"
            value={filters.maxSalary}
            onChange={handleMaxSalaryChange}
            placeholder="Enter max salary"
            variant="outlined"
          />
        </Grid>
      </Grid>

      {/* Job Title Search */}
      <Grid container spacing={2} padding={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search by Job Title"
            variant="outlined"
            value={filters.searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for a job title"
          />
        </Grid>
      </Grid>

      {/* Job Cards */}
      <Grid container spacing={2} padding={2}>
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job) => (
            <Grid item key={job.id} xs={12} sm={6} md={4} lg={3}>
              <JobCard job={job} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              No jobs available
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <CustomPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default JobPage;