import React, { useEffect, useState } from "react";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

export default function StepModel({ form, setForm, apiBase }) {
  const [vehicles, setVehicles] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!form.vehicleTypeId) return;
    setLoading(true);
    axios
      .get(`${apiBase}/vehicles?typeId=${form.vehicleTypeId}`)
      .then((res) => setVehicles(res.data))
      .catch((err) => setVehicles([]))
      .finally(() => setLoading(false));
  }, [form.vehicleTypeId]);

  if (!form.vehicleTypeId) return <div>Please pick a vehicle type first.</div>;
  if (loading) return <CircularProgress />;

  return (
    <RadioGroup
      value={form.vehicleId ? String(form.vehicleId) : ""}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          vehicleId: parseInt(e.target.value, 10),
        }))
      }
    >
      {vehicles &&
        vehicles.map((v) => (
          <FormControlLabel
            key={v.id}
            value={String(v.id)}
            control={<Radio />}
            label={v.name}
          />
        ))}
    </RadioGroup>
  );
}
