import React from "react";
import MultiStepForm from "./components/MultiStepForm";
import { Container, Typography } from "@mui/material";

function App() {
  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Vehicle Rental
      </Typography>
      <MultiStepForm />
    </Container>
  );
}

export default App;
