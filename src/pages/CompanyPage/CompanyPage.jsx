import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import Navbar from '../../component/NavBar/Navbar';

import AddIcon from '@mui/icons-material/Add';

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ name: '', userId: '', location: '' });
  const [updateCompanyData, setUpdateCompanyData] = useState({ id: '', name: '', userId: '', location: '' });
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  // Fetch companies by userId
  const fetchCompanies = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8080/companies/user/10`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // Create company
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/companies', newCompany);
      fetchCompanies(newCompany.userId);  // Refresh the companies list
      setNewCompany({ name: '', userId: '', location: '' }); // Reset form
      setOpenCreateModal(false); // Close the modal
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  // Update company
  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/companies/${updateCompanyData.id}`, updateCompanyData);
      fetchCompanies(updateCompanyData.userId);  // Refresh the companies list
      setOpenUpdateModal(false); // Close modal after updating
      setUpdateCompanyData({ id: '', name: '', userId: '', location: '' }); // Reset form
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  // Delete company
  const handleDeleteCompany = async (companyId, userId) => {
    try {
      await axios.delete(`http://localhost:8080/companies/${companyId}`);
      fetchCompanies(userId);  // Refresh the companies list
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  // Initial fetch for companies when the component mounts
  useEffect(() => {
    fetchCompanies(10); // Example userId 10
  }, []);

  // Open the Update modal and set the company data
  const handleOpenUpdateModal = (company) => {
    setUpdateCompanyData(company);
    setOpenUpdateModal(true);
  };

  // Close the Update modal
  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setUpdateCompanyData({ id: '', name: '', userId: '', location: '' });
  };

  // Open the Create modal
  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
  };

  // Close the Create modal
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setNewCompany({ name: '', userId: '', location: '' });
  };

  return (
    <Box>
      <Navbar />
      <Box sx={{ width: "50%", margin: "auto", padding: 3, marginTop: 10 }}>
        {/* Button to open Create Company modal */}
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateModal}>
          Create Company
        </Button>

        {/* Companies List */}
{/* Companies List */}
<Box sx={{ mt: 4 }}>
  {companies.map((company) => (
    <Box key={company.id} sx={{ border: "1px solid #ddd", padding: 2, marginBottom: 2 }}>
      <Typography variant="h6">{company.name}</Typography>
      <Typography>{`Location: ${company.location}`}</Typography>
      <Button onClick={() => handleOpenUpdateModal(company)} variant="contained" color="primary" sx={{ mr: 2 }}>
        Update
      </Button>
      <Button onClick={() => handleDeleteCompany(company.id, company.userId)} variant="contained" color="error">
        Delete
      </Button>
    </Box>
  ))}
</Box>


        {/* Create Company Modal (Dialog) */}
        <Dialog open={openCreateModal} onClose={handleCloseCreateModal}>
          <DialogTitle>Create Company</DialogTitle>
          <DialogContent>
            <TextField
              label="Company Name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="User ID"
              value={newCompany.userId}
              onChange={(e) => setNewCompany({ ...newCompany, userId: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Location"
              value={newCompany.location}
              onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreateModal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleCreateCompany} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Company Modal (Dialog) */}
        <Dialog open={openUpdateModal} onClose={handleCloseUpdateModal}>
          <DialogTitle>Update Company</DialogTitle>
          <DialogContent>
            <TextField
              label="Company Name"
              value={updateCompanyData.name}
              onChange={(e) => setUpdateCompanyData({ ...updateCompanyData, name: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="User ID"
              value={updateCompanyData.userId}
              onChange={(e) => setUpdateCompanyData({ ...updateCompanyData, userId: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Location"
              value={updateCompanyData.location}
              onChange={(e) => setUpdateCompanyData({ ...updateCompanyData, location: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpdateModal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUpdateCompany} variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default CompanyPage;
