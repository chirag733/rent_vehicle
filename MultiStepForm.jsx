import React, { useState, useEffect } from "react";
import StepName from "./StepName";
import StepWheels from "./StepWheels";
import StepType from "./StepType";
import StepModel from "./StepModel";
import StepDates from "./StepDates";
import { Box, Button, Paper, Typography, Alert } from "@mui/material";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { blue } from "@mui/material/colors";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000/api";

const steps = ["Name", "Number of wheels", "Vehicle type", "Model", "Dates"];

export default function MultiStepForm() {
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    wheels: null,
    vehicleTypeId: null,
    vehicleId: null,
    startDate: null,
    endDate: null,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setError(null);
  }, [active]);

  const handleNext = () => {
    setError(null);
    // Validation per step
    if (active === 0) {
      if (!form.firstName.trim() || !form.lastName.trim())
        return setError("Please enter first and last name");
    } else if (active === 1) {
      if (![2, 4].includes(form.wheels))
        return setError("Pick number of wheels");
      // clear downstream selections
      setForm((prev) => ({ ...prev, vehicleTypeId: null, vehicleId: null }));
    } else if (active === 2) {
      if (!form.vehicleTypeId) return setError("Select a vehicle type");
      setForm((prev) => ({ ...prev, vehicleId: null }));
    } else if (active === 3) {
      if (!form.vehicleId) return setError("Select a specific model");
    } else if (active === 4) {
      if (!form.startDate || !form.endDate)
        return setError("Select start and end dates");
      // final submit
      submitBooking();
      return;
    }
    setActive((a) => Math.min(steps.length - 1, a + 1));
  };

  const handleBack = () => {
    setError(null);
    setActive((a) => Math.max(0, a - 1));
  };

  const submitBooking = async () => {
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        vehicleId: form.vehicleId,
        startDate: form.startDate,
        endDate: form.endDate,
      };
      await axios.post(`${API_BASE}/bookings`, payload);
      setSuccess("Booking successful!");
      setError(null);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || "Server error");
      } else {
        setError("Network error");
      }
    }
  };

  return (
    // <sx={{bgcolor:"#f3f3f3ff"}}></sx=>
    <Paper
      sx={{
        p: 3,
        // bgcolor: "#f3f3f3ff",
      }}
    >
      <Typography variant="h6">{steps[active]}</Typography>

      <Box sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {active === 0 && <StepName form={form} setForm={setForm} />}
        {active === 1 && <StepWheels form={form} setForm={setForm} />}
        {active === 2 && (
          <StepType form={form} setForm={setForm} apiBase={API_BASE} />
        )}
        {active === 3 && (
          <StepModel form={form} setForm={setForm} apiBase={API_BASE} />
        )}
        {active === 4 && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <StepDates form={form} setForm={setForm} />
          </LocalizationProvider>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button disabled={active === 0} onClick={handleBack}>
            Back
          </Button>
          <Button variant="contained" onClick={handleNext}>
            {active === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
