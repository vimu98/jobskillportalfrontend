// src/components/MyEnrollments.js

import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, CircularProgress,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import NavBar from '../../component/NavBar/Navbar';

const EnrollmentsPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user?.id) return;

      try {
        const res = await axios.get(`http://localhost:8080/api/enroll/user/${user.id}`);
        const enrollmentsData = res.data;
        setEnrollments(enrollmentsData);

        // Fetch each course details by courseId
        const courseMap = {};
        await Promise.all(
          enrollmentsData.map(async (enroll) => {
            const courseRes = await axios.get(`http://localhost:8080/api/courses/${enroll.courseId}`);
            courseMap[enroll.courseId] = courseRes.data;
          })
        );

        setCourses(courseMap);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user?.id]);

  const handleRowClick = (courseId) => {
    const course = courses[courseId];
    navigate('/coursedetails', { state: { course } });
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box>
        <NavBar />
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ p: 2 }}>My Enrollments</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Course Title</TableCell>
            <TableCell>Enrollment Date</TableCell>
            <TableCell>Progress (%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {enrollments.map((enroll) => (
            <TableRow
              key={enroll.enrollmentId}
              hover
              onClick={() => handleRowClick(enroll.courseId)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{courses[enroll.courseId]?.title || 'Loading...'}</TableCell>
              <TableCell>{enroll.enrollmentDate}</TableCell>
              <TableCell>{enroll.progressStatus}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  );
};

export default EnrollmentsPage;
