import React, { useEffect, useState } from "react";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

export default function StepType({ form, setForm, apiBase }) {
  const [types, setTypes] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!form.wheels) return;
    setLoading(true);
    axios
      .get(`${apiBase}/vehicle-types?wheels=${form.wheels}`)
      .then((res) => {
        setTypes(res.data);
        console.log("Vehicle types:", res.data); // Add this line
      })
      .catch((err) => setTypes([]))
      .finally(() => setLoading(false));
  }, [form.wheels, apiBase]);
  if (!form.wheels) return <div>Please pick number of wheels first.</div>;
  if (loading) return <CircularProgress />;

  return (
    <RadioGroup
      required
      value={form.vehicleTypeId ? String(form.vehicleTypeId) : ""}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          vehicleTypeId: parseInt(e.target.value, 10),
        }))
      }
    >
      {types &&
        types.map((t) => (
          <FormControlLabel
            key={t.id}
            value={String(t.id)}
            control={<Radio />}
            label={t.name}
          />
        ))}
    </RadioGroup>
  );
}
