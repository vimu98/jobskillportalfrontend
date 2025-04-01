import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Button,
  TextField,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import Navbar from "../../component/NavBar/Navbar";
import { Visibility } from '@mui/icons-material';
import AddIcon from "@mui/icons-material/Add";

const CompanyPage = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ name: "", location: "" });
  const [updateCompanyData, setUpdateCompanyData] = useState({ id: "", name: "", location: "" });
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  useEffect(() => {
    if (user?.id) fetchCompanies();
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/companies/user/${user.id}`);
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/companies", { ...newCompany, userId: user.id });
      fetchCompanies();
      setNewCompany({ name: "", location: "" });
      setOpenCreateModal(false);
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/companies/${updateCompanyData.id}`, { ...updateCompanyData, userId: user.id });
      fetchCompanies();
      setOpenUpdateModal(false);
      setUpdateCompanyData({ id: "", name: "", location: "" });
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await axios.delete(`http://localhost:8080/companies/${companyId}`);
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  return (
    <Box>
      <Navbar />
      <Box sx={{ width: "50%", margin: "auto", padding: 3, marginTop: 10 }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenCreateModal(true)}>
          Create Company
        </Button>
        <Box sx={{ mt: 4 }}>
          {companies.map((company) => (
            <Box key={company.id} sx={{ border: "1px solid #ddd", padding: 2, marginBottom: 2 }}>
              <Typography variant="h6">{company.name}</Typography>
              <Typography>{`Location: ${company.location}`}</Typography>
              <Button onClick={() => { setUpdateCompanyData(company); setOpenUpdateModal(true); }} variant="contained" color="primary" sx={{ mr: 2 }}>Update</Button>
              <Button onClick={() => handleDeleteCompany(company.id)} variant="contained" color="error">Delete</Button>
            </Box>
          ))}
        </Box>

        {/* Create Company Modal */}
        <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
          <DialogTitle>Create Company</DialogTitle>
          <DialogContent>
            <TextField label="Company Name" value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} fullWidth required margin="normal" />
            <TextField label="Location" value={newCompany.location} onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })} fullWidth required margin="normal" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateModal(false)} color="primary">Cancel</Button>
            <Button onClick={handleCreateCompany} variant="contained" color="primary">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Update Company Modal */}
        <Dialog open={openUpdateModal} onClose={() => setOpenUpdateModal(false)}>
          <DialogTitle>Update Company</DialogTitle>
          <DialogContent>
            <TextField label="Company Name" value={updateCompanyData.name} onChange={(e) => setUpdateCompanyData({ ...updateCompanyData, name: e.target.value })} fullWidth required margin="normal" />
            <TextField label="Location" value={updateCompanyData.location} onChange={(e) => setUpdateCompanyData({ ...updateCompanyData, location: e.target.value })} fullWidth required margin="normal" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUpdateModal(false)} color="primary">Cancel</Button>
            <Button onClick={handleUpdateCompany} variant="contained" color="primary">Update</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};



export default CompanyPage;
