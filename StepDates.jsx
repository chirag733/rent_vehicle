import React from "react";
import { TextField } from "@mui/material";
import { Box } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function StepDates({ form, setForm }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <DatePicker
          label="Start date"
          value={form.startDate ? new Date(form.startDate) : null}
          onChange={(newVal) =>
            setForm((prev) => ({
              ...prev,
              startDate: newVal ? newVal.toISOString().slice(0, 10) : null,
            }))
          }
          renderInput={(params) => <TextField {...params} />}
        />
        <DatePicker
          label="End date"
          value={form.endDate ? new Date(form.endDate) : null}
          onChange={(newVal) =>
            setForm((prev) => ({
              ...prev,
              endDate: newVal ? newVal.toISOString().slice(0, 10) : null,
            }))
          }
          renderInput={(params) => <TextField {...params} />}
        />
      </Box>
    </LocalizationProvider>
  );
}
