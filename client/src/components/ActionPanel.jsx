import React, { useEffect, useState } from 'react';
import { FormControlLabel, Switch, TextField, Button, Box } from '@mui/material';

const ActionPanel = ({selectedModule, selectedPlantData, changePlantData}) => {
  const [autoMode, setAutoMode] = useState(false);
  const [lowIdealMoisture, setLowIdealMoisture] = useState(0);
  const [highIdealMoisture, setHighIdealMoisture] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if(selectedModule){
      setLowIdealMoisture(selectedPlantData.ideal_moisture_low);
      setHighIdealMoisture(selectedPlantData.ideal_moisture_high);
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

  const startCycle = () => {
    if(autoMode) return;
    fetch(`http://127.0.0.1:5000/manualOverride/${selectedModule}/${cycle}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => res.json())
      .then(data => {
        if(data.message){
          console.log("Cycle started successfully");
          setCycle(0);
        }
        else{
          console.log("Cycle start failed");
        }
      })
      .catch(err => console.log(err));

  }

  if(selectedPlantData === null){
    return null;
  }

  return (
    <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: '4px', margin: "10px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
      <Box sx={{ mb: 2 }}>
        <h2 style={{textAlign: "center", marginBottom: "0"}}>{selectedPlantData.name}</h2>
        <p style={{textAlign: "center", marginTop: "10px"}}>Surface Area : {
          (3.14 * Math.pow(selectedPlantData.soil_radius_cm, 2).toFixed(2))
        } cm<sup>2</sup></p>
        <FormControlLabel
          sx={{ mt: 2, mb: 2 }}
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
      <Box sx={{ mt: 2 }} >
      <Box display={"flex"}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {if(cycle!==0){setCycle(cycle - 1)}}}
          disabled={autoMode}
        >
          -
        </Button>
        <TextField
          sx={{ mx: 2 }}
          disabled={autoMode}
          label="Cycle"
          type="number"
          value={cycle}
          onChange={(e) => {if(e.target.value >= 0){setCycle(e.target.value)}}}
          variant="outlined"
          size="small"
        />
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {setCycle(cycle + 1)}}
          disabled={autoMode}
        >
          +
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={startCycle}
          disabled={autoMode || cycle === 0}
          fullWidth
        >
          Start Cycle
        </Button>
      </Box>
      </Box>
    </Box>
  );
};

export default ActionPanel;
