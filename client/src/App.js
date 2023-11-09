import React, { useState } from 'react';
import { Grid } from '@mui/material';
import ActionPanel from './components/ActionPanel';
import LocationPanel from './components/LocationPanel';
import GraphPanel from './components/GraphPanel';

const IrrigationSystem = () => {
  const [locations] = useState([
    { id: '1', name: 'Location 1', modules: [{id: "1", name: 'Module #1', moisture: 40}, {id: "2", name: 'Module #2', moisture: 50}, {id: "3", name: 'Module #3', moisture: 90}] },
    { id: '2', name: 'Location 2', modules: [{id: "4", name: 'Module #1', moisture: 60}, {id: "5", name: 'Module #2', moisture: 70}] },
    { id: '3', name: 'Location 3', modules: [{id: "6", name: 'Module #1', moisture: 80}]}
  ]);
  const [selectedLocation, setSelectedLocation] = useState(locations[0].id);
  const [selectedModule, setSelectedModule] = useState(locations[0].modules[0].id);

  const handleModuleSelect = (locationId, moduleId) => {
    setSelectedModule(moduleId);
    setSelectedLocation(locationId);
  };

  const handleLocationSelect = (locationId) => {
    setSelectedLocation(locationId);
  }

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
        <ActionPanel />
      </Grid>
    </Grid>
  );
};

export default IrrigationSystem;
