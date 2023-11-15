import React, { useEffect, useState } from 'react';
import { FormControlLabel, Switch, TextField, Button, Box } from '@mui/material';

const ActionPanel = ({selectedModule, selectedPlantData, changePlantData}) => {
  const [autoMode, setAutoMode] = useState(false);
  const [lowIdealMoisture, setLowIdealMoisture] = useState(0);
  const [highIdealMoisture, setHighIdealMoisture] = useState(0);
  const [pumpState, setPumpState] = useState(false);

  useEffect(() => {
    if(selectedModule){
      setLowIdealMoisture(selectedPlantData.ideal_moisture_low);
      setHighIdealMoisture(selectedPlantData.ideal_moisture_high);
      setPumpState(selectedPlantData.pump_state === 1 ? true : false);
    }
  },[selectedPlantData]);

  const handleAutoModeChange = (event) => {
    setAutoMode(event.target.checked);
  };

  const handleLowIdealMoistureChange = (event) => {
    if(event.target.value <= 1 && event.target.value >= 0 && event.target.value <= highIdealMoisture){
      setLowIdealMoisture(event.target.value);
    }
  };

  const handleHighIdealMoistureChange = (event) => {
    if(event.target.value <= 1 && event.target.value >= 0 && event.target.value >= lowIdealMoisture){
      setHighIdealMoisture(event.target.value);
    }
  };

  const handleUpdate = () => {
    if(autoMode) return;
    changePlantData({
      ...selectedPlantData,
      ideal_moisture_low: parseFloat(lowIdealMoisture),
      ideal_moisture_high: parseFloat(highIdealMoisture),
      manual: autoMode ? 0 : 1
    })
  };

  const handleTurnOnPump = () => {
    setPumpState(true);
    changePlantData({
      ...selectedPlantData,
      pump_state: 1
    });
  };

  const handleTurnOffPump = () => {
    setPumpState(false);
    changePlantData({
      ...selectedPlantData,
      pump_state: 0
    });
  };

  if(selectedPlantData === null){
    return null;
  }

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
          label="Low Ideal Moisture"
          disabled={autoMode}
          type="number"
          value={lowIdealMoisture}
          onChange={handleLowIdealMoistureChange}
          variant="outlined"
          size="small"
          fullWidth
        />
        <TextField
          sx={{ mt: 2 }}
          disabled={autoMode}
          label="High Ideal Moisture"
          type="number"
          value={highIdealMoisture}
          onChange={handleHighIdealMoistureChange}
          variant="outlined"
          size="small"
          fullWidth
        />
        <Button
          sx={{ mt: 1 }}
          variant="outlined"
          color="primary"
          onClick={handleUpdate}
          disabled={autoMode}
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
          disabled={autoMode || pumpState}
        >
          Turn on Pump
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={handleTurnOffPump}
          disabled={autoMode || !pumpState}
        >
          Turn off Pump
        </Button>
      </Box>
    </Box>
  );
};

export default ActionPanel;
