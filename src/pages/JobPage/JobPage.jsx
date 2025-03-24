import React, { useEffect, useState } from "react";
import JobCard from "../../component/JobCard/JobCard";
import axios from "axios";
import Navbar from "../../component/NavBar/Navbar";
import { Grid, Typography, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import CustomPagination from "../../component/Pagination/CustomPagination";
import SuggetionCarousel from "../../component/SuggetionCarousel/SuggetionCarousel";

const JobPage = () => {
  const jobsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [minSalaryFilter, setMinSalaryFilter] = useState("");
  const [maxSalaryFilter, setMaxSalaryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleLocationChange = (event) => setLocationFilter(event.target.value);
  const handleIndustryChange = (event) => setIndustryFilter(event.target.value);
  const handleMinSalaryChange = (event) => setMinSalaryFilter(event.target.value);
  const handleMaxSalaryChange = (event) => setMaxSalaryFilter(event.target.value);
  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/jobs/all", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("iap-final-token"),
          },
        });
        setAllJobs(response.data);
        setFilteredJobs(response.data);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = allJobs;

    // Convert filter values to numbers for comparison
    const minSalary = minSalaryFilter ? Number(minSalaryFilter) : null;
    const maxSalary = maxSalaryFilter ? Number(maxSalaryFilter) : null;

    // Filter by location
    if (locationFilter) {
      filtered = filtered.filter((job) => job.location === locationFilter);
    }

    // Filter by industry
    if (industryFilter) {
      filtered = filtered.filter((job) => job.industry === industryFilter);
    }

    // Filter by salary range
    if (minSalary !== null) {
      filtered = filtered.filter((job) => Number(job.salary) >= minSalary);
    }

    if (maxSalary !== null) {
      filtered = filtered.filter((job) => Number(job.salary) <= maxSalary);
    }

    // Filter by job title search
    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [
    locationFilter,
    industryFilter,
    minSalaryFilter,
    maxSalaryFilter,
    searchTerm,
    allJobs,
  ]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const displayedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

  return (
    <div>
      <Navbar />
     

      {/* Filters */}
      <Grid container spacing={2} padding={2} justifyContent="space-between">
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={locationFilter}
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
              value={industryFilter}
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
            value={minSalaryFilter}
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
            value={maxSalaryFilter}
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
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for a job title"
          />
        </Grid>
      </Grid>
      <SuggetionCarousel />
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
