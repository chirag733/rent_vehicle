import React from "react";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";

export default function StepWheels({ form, setForm }) {
  return (
    <RadioGroup
      row
      value={form.wheels ? String(form.wheels) : ""}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, wheels: parseInt(e.target.value, 10) }))
      }
    >
      <FormControlLabel value="2" control={<Radio />} label="2" />
      <FormControlLabel value="4" control={<Radio />} label="4" />
    </RadioGroup>
  );
}
