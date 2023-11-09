import React, { useState } from 'react';
import { FormControlLabel, Switch, TextField, Button, Box } from '@mui/material';

const ActionPanel = () => {
  const [autoMode, setAutoMode] = useState(false);
  const [idealMoisture, setIdealMoisture] = useState(40);

  const handleAutoModeChange = (event) => {
    setAutoMode(event.target.checked);
  };

  const handleIdealMoistureChange = (event) => {
    setIdealMoisture(event.target.value);
  };

  const handleUpdate = () => {
    // Logic to handle the update action
    console.log('Update Ideal Moisture to:', idealMoisture);
  };

  const handleTurnOnPump = () => {
    // Logic to handle turning on the pump
    console.log('Pump turned on');
  };

  const handleTurnOffPump = () => {
    // Logic to handle turning off the pump
    console.log('Pump turned off');
  };

  return (
    <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: '4px', margin: "10px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
      <Box sx={{ mb: 2 }}>
      <FormControlLabel
        sx={{ mb: 2 }}
        control={
          <Switch
            checked={autoMode}
            onChange={handleAutoModeChange}
            name="autoMode"
          />
        }
        label="Auto"
      />
        <TextField
          label="Ideal Moisture"
          type="number"
          value={idealMoisture}
          onChange={handleIdealMoistureChange}
          variant="outlined"
          size="small"
          fullWidth
        />
        <Button
          sx={{ mt: 1 }}
          variant="outlined"
          color="primary"
          onClick={handleUpdate}
        >
          update
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleTurnOnPump}
          sx={{ mb: 1 }}
        >
          Turn on Pump
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={handleTurnOffPump}
        >
          Turn off Pump
        </Button>
      </Box>
    </Box>
  );
};

export default ActionPanel;
