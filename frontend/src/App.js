import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Stack
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { ArrowBack, ArrowForward, CheckCircle, DirectionsCar, TwoWheeler } from '@mui/icons-material';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create a modern theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#f59e0b',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
      },
    },
  },
});

const steps = [
  'Personal Info',
  'Vehicle Type',
  'Select Model',
  'Choose Dates',
  'Confirmation'
];

const VehicleRentalForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    wheels: '',
    vehicleTypeId: '',
    vehicleId: '',
    startDate: null,
    endDate: null
  });
  
  // API data
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    if (currentStep === 2 && formData.wheels) {
      fetchVehicleTypes();
    }
  }, [currentStep, formData.wheels]);
  
  useEffect(() => {
    if (currentStep === 3 && formData.vehicleTypeId) {
      fetchVehicles();
    }
  }, [currentStep, formData.vehicleTypeId]);
  
  const fetchVehicleTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/vehicle-types?wheels=${formData.wheels}`);
      setVehicleTypes(response.data);
    } catch (err) {
      console.error('Error fetching vehicle types:', err);
      setError('Failed to load vehicle types');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/vehicles?type_id=${formData.vehicleTypeId}`);
      setVehicles(response.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
      setError('');
    }
  };
  
  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    setError('');
  };
  
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('Please enter both first and last name');
          return false;
        }
        break;
      case 1:
        if (!formData.wheels) {
          setError('Please select number of wheels');
          return false;
        }
        break;
      case 2:
        if (!formData.vehicleTypeId) {
          setError('Please select a vehicle type');
          return false;
        }
        break;
      case 3:
        if (!formData.vehicleId) {
          setError('Please select a specific vehicle');
          return false;
        }
        break;
      case 4:
        if (!formData.startDate || !formData.endDate) {
          setError('Please select both start and end dates');
          return false;
        }
        if (formData.startDate.isAfter(formData.endDate)) {
          setError('End date must be after start date');
          return false;
        }
        if (formData.startDate.isBefore(dayjs(), 'day')) {
          setError('Start date cannot be in the past');
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const bookingData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        wheels: parseInt(formData.wheels),
        vehicle_type_id: formData.vehicleTypeId,
        vehicle_id: formData.vehicleId,
        start_date: formData.startDate.format('YYYY-MM-DD'),
        end_date: formData.endDate.format('YYYY-MM-DD')
      };
      
      await axios.post(`${API}/bookings`, bookingData);
      setSuccess(true);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.detail || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };
  
  const getSelectedVehicleType = () => {
    return vehicleTypes.find(type => type.id === formData.vehicleTypeId);
  };
  
  const getSelectedVehicle = () => {
    return vehicles.find(vehicle => vehicle.id === formData.vehicleId);
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
              What is your name?
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                fullWidth
                variant="outlined"
                required
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                fullWidth
                variant="outlined"
                required
              />
            </Stack>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
              Number of wheels?
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={formData.wheels}
                onChange={(e) => setFormData({ ...formData, wheels: e.target.value, vehicleTypeId: '', vehicleId: '' })}
                sx={{ gap: 2 }}
              >
                <Paper sx={{ p: 2, border: formData.wheels === '2' ? '2px solid' : '1px solid', borderColor: formData.wheels === '2' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TwoWheeler color={formData.wheels === '2' ? 'primary' : 'action'} />
                        <Typography variant="body1">2 Wheels (Bike)</Typography>
                      </Box>
                    }
                  />
                </Paper>
                <Paper sx={{ p: 2, border: formData.wheels === '4' ? '2px solid' : '1px solid', borderColor: formData.wheels === '4' ? 'primary.main' : 'divider' }}>
                  <FormControlLabel
                    value="4"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCar color={formData.wheels === '4' ? 'primary' : 'action'} />
                        <Typography variant="body1">4 Wheels (Car)</Typography>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
              Type of vehicle?
            </Typography>
            {loading ? (
              <LinearProgress />
            ) : (
              <FormControl component="fieldset">
                <RadioGroup
                  value={formData.vehicleTypeId}
                  onChange={(e) => setFormData({ ...formData, vehicleTypeId: e.target.value, vehicleId: '' })}
                  sx={{ gap: 2 }}
                >
                  {vehicleTypes.map((type) => (
                    <Paper key={type.id} sx={{ p: 2, border: formData.vehicleTypeId === type.id ? '2px solid' : '1px solid', borderColor: formData.vehicleTypeId === type.id ? 'primary.main' : 'divider' }}>
                      <FormControlLabel
                        value={type.id}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight={600}>{type.name}</Typography>
                            <Chip label={`${type.wheels} wheels`} size="small" sx={{ mt: 1 }} />
                          </Box>
                        }
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
              Specific Model?
            </Typography>
            {loading ? (
              <LinearProgress />
            ) : (
              <FormControl component="fieldset">
                <RadioGroup
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  sx={{ gap: 2 }}
                >
                  {vehicles.map((vehicle) => (
                    <Paper key={vehicle.id} sx={{ p: 2, border: formData.vehicleId === vehicle.id ? '2px solid' : '1px solid', borderColor: formData.vehicleId === vehicle.id ? 'primary.main' : 'divider' }}>
                      <FormControlLabel
                        value={vehicle.id}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight={600}>{vehicle.model}</Typography>
                            <Chip label={getSelectedVehicleType()?.name} size="small" sx={{ mt: 1 }} />
                          </Box>
                        }
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </Box>
        );
      
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
              Select rental dates
            </Typography>
            <Stack spacing={3}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(newValue) => setFormData({ ...formData, startDate: newValue })}
                minDate={dayjs()}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
                minDate={formData.startDate || dayjs()}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </Box>
        );
      
      case 5:
        return (
          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              Booking Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your vehicle rental has been successfully booked.
            </Typography>
            
            <Paper sx={{ p: 3, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom>Booking Details</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Typography><strong>Name:</strong> {formData.firstName} {formData.lastName}</Typography>
                <Typography><strong>Vehicle:</strong> {getSelectedVehicle()?.model}</Typography>
                <Typography><strong>Type:</strong> {getSelectedVehicleType()?.name}</Typography>
                <Typography><strong>Dates:</strong> {formData.startDate?.format('MMM DD, YYYY')} - {formData.endDate?.format('MMM DD, YYYY')}</Typography>
              </Box>
            </Paper>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  if (success) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="md">
              <Paper sx={{ p: 4 }}>
                {renderStepContent()}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      setCurrentStep(0);
                      setFormData({
                        firstName: '',
                        lastName: '',
                        wheels: '',
                        vehicleTypeId: '',
                        vehicleId: '',
                        startDate: null,
                        endDate: null
                      });
                      setSuccess(false);
                    }}
                  >
                    Book Another Vehicle
                  </Button>
                </Box>
              </Paper>
            </Container>
          </Box>
        </ThemeProvider>
      </LocalizationProvider>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="md">
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 4 }}>
                Vehicle Rental Booking
              </Typography>
              
              <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {renderStepContent()}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 0 || loading}
                  startIcon={<ArrowBack />}
                  variant="outlined"
                >
                  Back
                </Button>
                
                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    variant="contained"
                    size="large"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    variant="contained"
                    endIcon={<ArrowForward />}
                    size="large"
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VehicleRentalForm />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;