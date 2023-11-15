import React, { useEffect, useState } from "react";
import { Grid, Paper, Button, Avatar, Tooltip } from "@mui/material";
import ActionPanel from "./components/ActionPanel";
import LocationPanel from "./components/LocationPanel";
import GraphPanel from "./components/GraphPanel";
import { useAuth0 } from "@auth0/auth0-react";

const IrrigationSystem = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedPlantData, setSelectedPlantData] = useState(null);

  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const handleModuleSelect = (locationId, moduleId) => {
    setSelectedModule(moduleId);
    setSelectedLocation(locationId);
  };

  const handleLocationSelect = (locationId) => {
    setSelectedLocation(locationId);
  };

  const fetchLocations = async () => {
    const response = await fetch("http://127.0.0.1:5000/getAllModules");
    const data = await response.json();
    const result = [];
    Object.keys(data.moduleList).forEach((locationId) => {
      result.push({
        id: locationId,
        name: `Location ${locationId}`,
        modules: data.moduleList[locationId].map((module) => ({
          id: module,
          name: `Module ${module}`,
        })),
      });
    });
    setLocations(result);
    setSelectedLocation(result[0].id);
    setSelectedModule(result[0].modules[0].id);
  };

  const fetchPlantData = async () => {
    const response = await fetch(
      `http://127.0.0.1:5000/getPlantData/${selectedModule}`
    );
    const data = await response.json();
    setSelectedPlantData(data);
  };

  const changePlantData = async (newData) => {
    setSelectedPlantData(newData);
    const response = await fetch(`http://127.0.0.1:5000/updatePlantData/${selectedModule}`,{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newData)
    });
    const data = await response.json();
    if(data.message){
      console.log("Data changed successfully");
    }
    else{
      console.log("Data change failed");
    }
  }

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedModule !== null) {
      fetchPlantData();
    }
  }, [selectedModule]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Paper
        elevation={1}
        style={{ padding: "2px 0px", margin: "4px 10px", position: "relative" }}
      >
        <h2 style={{ textAlign: "center" }}>
          Smart irrigation System Dashboard - Team 01
        </h2>
        {isAuthenticated && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {user.name && (
              <Tooltip title={`${user.email}`} arrow>
                <Avatar
                  sx={{ width: 30, height: 30 }}
                  alt={`${user.name}`}
                  src={`${user.picture}`}
                />
              </Tooltip>
            )}
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                logout({ logoutParams: { returnTo: window.location.origin } });
              }}
              style={{ marginLeft: "10px" }}
              size="small"
            >
              Log out
            </Button>
          </div>
        )}
      </Paper>
      {!isAuthenticated ? (
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
            <GraphPanel selectedModule={selectedModule} lowMoistureLevel={selectedPlantData?.ideal_moisture_low}
              highMoistureLevel={selectedPlantData?.ideal_moisture_high} />
          </Grid>
          <Grid item xs={3}>
            <ActionPanel
              selectedModule={selectedModule}
              selectedPlantData={selectedPlantData}
              changePlantData={changePlantData}
            />
          </Grid>
        </Grid>
      ) : (
        <div
          style={{
            width: "100%",
            flex: "1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              loginWithRedirect();
            }}
          >
            Log in to Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default IrrigationSystem;
