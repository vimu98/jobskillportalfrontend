import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs } from '../../store/jobsSlice';
import JobCard from '../../component/JobCard/JobCard';
import Navbar from '../../component/NavBar/Navbar';
import { Grid, Typography } from '@mui/material';
import CustomPagination from '../../component/Pagination/CustomPagination';
import HeroSection from '../../component/HeroSection/HeroSection';
import SuggetionCarousel from '../../component/SuggetionCarousel/SuggetionCarousel';

const HomePage = () => {
  const jobsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const { latestJobs, latestJobsCount} = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);
  

  const totalPages = Math.ceil(latestJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const displayedJobs = latestJobs.slice(startIndex, startIndex + jobsPerPage);

  //if (loading) return <Typography>Loading...</Typography>;
  //if (error) return <Typography>Errorrrr: {error}</Typography>;

  return (
    <div>
      <Navbar />
      <HeroSection />
      <SuggetionCarousel />

      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}
        align="left"
        paddingLeft={4}
        gutterBottom
      >
        {latestJobsCount > 0
          ? `Latest Jobs: ${latestJobsCount} available today`
          : 'No jobs available for today'}
      </Typography>

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
              No jobs available for today
            </Typography>
          </Grid>
        )}
      </Grid>

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

export default HomePage;