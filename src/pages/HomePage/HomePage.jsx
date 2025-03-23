import React, { useEffect, useState } from "react";
import JobCard from "../../component/JobCard/JobCard";
import axios from "axios";

const HomePage = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/jobs/all", {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("iap-final-token"),
        },
      })
      .then((response) => {
        console.log(response.data);
        setJobs(response.data); 
      })
      .catch((error) => {
        console.error(" API Error:", error);
      });
  }, []); // Run only once on component mount
  console.log(localStorage.getItem("iap-final-token"));

  return (
    <div>
      {jobs.length > 0 ? (
        jobs.map((job) => <JobCard key={job.id} job={job} />)
      ) : (
        <p>Loading jobs...</p>
      )}
    </div>
  );
};

export default HomePage;
