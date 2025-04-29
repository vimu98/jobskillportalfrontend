import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Grid,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import JobCard from '../JobCard/JobCard';
import { fetchJobSuggestions } from '../../store/jobsSlice';
import { useAuth } from '../../context/AuthContext';

const SuggetionCarousel = () => {
  const dispatch = useDispatch();
  const { resume } = useAuth();
  const { suggestedJobs, loading, error } = useSelector((state) => state.jobs);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (resume) {
      dispatch(fetchJobSuggestions(resume));
    }
  }, [resume, dispatch]);

  
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };


  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };


  if (!resume) {
    return (
      <Box sx={{ textAlign: 'center', py: 5, color: 'gray' }}>
        <Typography variant="h6">
          Please upload a resume to see job suggestions.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
      {/* Job Suggestions Count */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        {loading
          ? 'Loading job suggestions...'
          : `Found ${suggestedJobs.length} job suggestions`}
      </Typography>

      <Box
        sx={{
          maxWidth: '1000px',
          mx: 'auto',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 5, color: 'red' }}>
            <Typography variant="h6">
              Failed to load job suggestions.
            </Typography>
          </Box>
        ) : suggestedJobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, color: 'gray' }}>
            <Typography variant="h6">
              No job suggestions found.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Left Navigation Button */}
            <IconButton
              onClick={scrollLeft}
              aria-label="Previous job suggestions"
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'white',
                '&:hover': { backgroundColor: 'grey.100' },
              }}
            >
              <ArrowBack />
            </IconButton>

            {/* Scrollable Job Cards Container */}
            <Box
              ref={scrollRef}
              sx={{
                display: 'flex',
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none', // Firefox
                '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
                py: 2,
                px: 1,
              }}
            >
              <Grid container spacing={2} wrap="nowrap">
                {suggestedJobs.map((job) => (
                  <Grid
                    item
                    key={job.id}
                    sx={{ minWidth: { xs: '250px', sm: '300px' }, maxWidth: '300px' }}
                  >
                    <JobCard job={job} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Right Navigation Button */}
            <IconButton
              onClick={scrollRight}
              aria-label="Next job suggestions"
              sx={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: 'white',
                '&:hover': { backgroundColor: 'grey.100' },
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SuggetionCarousel;