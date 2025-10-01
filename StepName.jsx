import React from "react";
import { TextField, Grid } from "@mui/material";

export default function StepName({ form, setForm }) {
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          label="First name"
          fullWidth
          value={form.firstName}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, firstName: e.target.value }))
          }
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Last name"
          fullWidth
          value={form.lastName}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, lastName: e.target.value }))
          }
        />
      </Grid>
    </Grid>
  );
}
