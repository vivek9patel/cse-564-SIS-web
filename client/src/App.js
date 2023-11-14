import React, { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import ActionPanel from './components/ActionPanel';
import LocationPanel from './components/LocationPanel';
import GraphPanel from './components/GraphPanel';

const IrrigationSystem = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedPlantData, setSelectedPlantData] = useState(null);
  
  const handleModuleSelect = (locationId, moduleId) => {
    setSelectedModule(moduleId);
    setSelectedLocation(locationId);
  };

  const handleLocationSelect = (locationId) => {
    setSelectedLocation(locationId);
  }

  const fetchLocations = async () => {
    const response = await fetch('http://127.0.0.1:5000/getAllModules');
    const data = await response.json();
    const result = [];
    Object.keys(data.moduleList).forEach((locationId) => {
      result.push({
        id: locationId,
        name: `Location ${locationId}`,
        modules: data.moduleList[locationId].map((module) => ({id: module, name: `Module ${module}`}))
      });
    })
    setLocations(result);
    setSelectedLocation(result[0].id);
    setSelectedModule(result[0].modules[0].id);
  }

  const fetchPlantData = async () => {
    const response = await fetch(`http://127.0.0.1:5000/getPlantData/${selectedModule}`);
    const data = await response.json();
    setSelectedPlantData(data);
  }

  useEffect(() => {
    fetchLocations();
  },[]);

  useEffect(() => {
    if(selectedModule !== null){
      fetchPlantData();
    }
  },[selectedModule])

  return (
    <Grid container>
      <Grid item xs={2}>
        <LocationPanel
          locations={locations}
          activeModule={selectedModule}
          selectedLocation={selectedLocation}
          onModuleSelect={handleModuleSelect}
          onLocationSelect={handleLocationSelect}
        />
      </Grid>
      <Grid item xs={7}>
        <GraphPanel selectedModule={selectedModule} />
      </Grid>
      <Grid item xs={3}>
        <ActionPanel selectedModule={selectedModule} selectedPlantData={selectedPlantData} />
      </Grid>
    </Grid>
  );
};

export default IrrigationSystem;
