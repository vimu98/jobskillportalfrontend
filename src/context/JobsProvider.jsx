import React, { createContext, useContext, useState } from 'react';

// Create the Jobs context
const JobsContext = createContext();

// Create a provider component
export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);

  return (
    <JobsContext.Provider value={{ jobs, setJobs }}>
      {children}
    </JobsContext.Provider>
  );
};

// Custom hook to use Jobs context
export const useJobs = () => {
  return useContext(JobsContext);
};
