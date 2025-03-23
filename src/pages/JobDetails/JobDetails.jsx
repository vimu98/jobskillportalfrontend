import React from 'react';
import { useLocation } from 'react-router-dom';

function JobDetails() {
  const location = useLocation();
  const { job } = location.state || {}; 

  return (
    <div>
      {job ? (
        <div>
          <h1>Job Title: {job.title}</h1>
          <p>Job Description: {job.description}</p>
          <p>Location: {job.location}</p>
          <p>Company: {job.company}</p>
          <p>Status: {job.active}</p>
          <p>Skills Required: {job.skillsRequired}</p>
        </div>
      ) : (
        <p>No job details available.</p>
      )}
    </div>
  );
}

export default JobDetails;
