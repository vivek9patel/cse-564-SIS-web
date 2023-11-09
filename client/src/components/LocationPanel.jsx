import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const LocationPanel = ({ locations, activeModule, selectedLocation, onModuleSelect, onLocationSelect }) => {


  return (
    <Box sx={{ width: '100%', overflow: "scroll", padding: "20px" }}>
      {locations.map((location,index) => {
        return (
        <Accordion
          key={index}
          expanded={(selectedLocation === location.id) || (typeof (location.modules.find((module) => module.id === activeModule)?.name) === "string")}
          onChange={() => {onLocationSelect(location.id)}}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{location.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {location.modules.map((module,index) => (
              <Button
                key={index}
                onClick={() => onModuleSelect(location.id, module.id)}
                variant={activeModule === module.id ? "contained" : "outlined"}
                fullWidth
                style={{marginBottom: "5px"}}
              >
                {module.name}
              </Button>
            ))}
          </AccordionDetails>
        </Accordion>
      )})}
    </Box>
  );
};

export default LocationPanel;