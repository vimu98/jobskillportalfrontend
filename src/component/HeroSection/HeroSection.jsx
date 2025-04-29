import React from "react";
import { Box, Typography, TextField, InputAdornment, Button, Paper } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const HeroSection = () => {



  return (
    <Box textAlign="center" py={5}>
    

     
      <Typography variant="h3" fontWeight="bold" mt={3}>
        Search, Apply & <br />
        Get Your Dream Job & Training
      </Typography>


      <Box
        component={Paper}
        elevation={3}
        display="flex"
        alignItems="center"
        sx={{
          maxWidth: "500px",
          mx: "auto",
          mt: 4,
          p: 1,
          borderRadius: "30px",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Find your dream jobs"
          
          InputProps={{
            sx: { borderRadius: "30px" },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          sx={{ borderRadius: "30px", ml: 1, px: 3, bgcolor: "#6A38C2" }}
        >
          Search
        </Button>
      </Box>
    </Box>
  );
};

export default HeroSection;
