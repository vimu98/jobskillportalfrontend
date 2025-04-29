import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all jobs
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:8080/api/jobs/all', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('iap-final-token')}`,
      },
    });
    console.log('Jobs response:', response.data); // Debugging line
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

// Fetch job suggestions based on resume
export const fetchJobSuggestions = createAsyncThunk(
  'jobs/fetchJobSuggestions',
  async (resumeUrl, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/jobs/match-jobs',
        { resumeUrl },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Job suggestions response:', response.data); // Debugging line
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Check if user has applied to a job
export const checkApplication = createAsyncThunk(
  'jobs/checkApplication',
  async ({ jobId, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:8080/api/applications');
      const applications = response.data;
      const hasApplied = applications.some(
        (app) => app.jobId === jobId && app.applicantId === userId
      );
      console.log('Check application response:', hasApplied); // Debugging line
      return hasApplied;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Apply for a job
export const applyForJob = createAsyncThunk(
  'jobs/applyForJob',
  async (applicationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/applications/upload',
        applicationData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Apply for job response:', response.data); // Debugging line
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    latestJobs: [],
    latestJobsCount: 0,
    suggestedJobs: [],
    filteredJobs: [],
    filters: {
      location: '',
      industry: '',
      minSalary: '',
      maxSalary: '',
      searchTerm: '',
    },
    loading: false,
    error: null,
    hasApplied: false,
    applicationStatus: null,
  },
  reducers: {
    clearApplicationStatus: (state) => {
      state.applicationStatus = null;
    },
    setLocationFilter: (state, action) => {
      state.filters.location = action.payload;
    },
    setIndustryFilter: (state, action) => {
      state.filters.industry = action.payload;
    },
    setMinSalaryFilter: (state, action) => {
      state.filters.minSalary = action.payload;
    },
    setMaxSalaryFilter: (state, action) => {
      state.filters.maxSalary = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
    },
    applyFilters: (state) => {
      let filtered = state.jobs;

      const { location, industry, minSalary, maxSalary, searchTerm } = state.filters;

      const minSalaryNum = minSalary ? Number(minSalary) : null;
      const maxSalaryNum = maxSalary ? Number(maxSalary) : null;

      if (location) {
        filtered = filtered.filter((job) => job.location === location);
      }

      if (industry) {
        filtered = filtered.filter((job) => job.industry === industry);
      }

      if (minSalaryNum !== null) {
        filtered = filtered.filter((job) => Number(job.salary) >= minSalaryNum);
      }

      if (maxSalaryNum !== null) {
        filtered = filtered.filter((job) => Number(job.salary) <= maxSalaryNum);
      }

      if (searchTerm) {
        filtered = filtered.filter((job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      state.filteredJobs = filtered;
    },
  },
  extraReducers: (builder) => {
    // Fetch jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
        state.filteredJobs = action.payload;
        const today = new Date().toISOString().split('T')[0];
        state.latestJobs = action.payload.filter((job) => job.publishDate === today);
        state.latestJobsCount = state.latestJobs.length;

      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch jobs';
      })
      // Fetch job suggestions
      .addCase(fetchJobSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestedJobs = action.payload;
      })
      .addCase(fetchJobSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch job suggestions';
      })
      // Check application
      .addCase(checkApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.hasApplied = action.payload;
      })
      .addCase(checkApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to check application';
      })
      // Apply for job
      .addCase(applyForJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.applicationStatus = null;
      })
      .addCase(applyForJob.fulfilled, (state) => {
        state.loading = false;
        state.hasApplied = true;
        state.applicationStatus = 'Application submitted successfully!';
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.loading = false;
        state.applicationStatus = action.payload || 'Failed to submit application!';
      });
  },
});

export const {
  clearApplicationStatus,
  setLocationFilter,
  setIndustryFilter,
  setMinSalaryFilter,
  setMaxSalaryFilter,
  setSearchTerm,
  applyFilters,
} = jobsSlice.actions;
export default jobsSlice.reducer;