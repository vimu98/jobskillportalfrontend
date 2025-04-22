import { Avatar, Box, Button, Card, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function CourseCard({course}) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Passing the job object as state to the JobDetails page
    navigate('/coursedetails', { state: { course } });
  };

  return (
    <Box>
      <Card sx={{ width: '300px', height: '200px' , padding: '20px', borderRadius: '10px', margin: '10px' }}>
        <Typography variant="h4" color="initial">{course.title}</Typography>
        <Typography variant="h5" color="initial">{course.category}</Typography>
        <Typography variant="h5" color="initial">{course.duration}</Typography>
        <Button variant="contained" color="primary" onClick={handleClick}>
          View Details
        </Button>
      </Card>
    </Box>
  );
}

export default CourseCard;
