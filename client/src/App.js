import React, { useEffect, useState } from "react";
import { Grid, Paper, Button, Avatar, Tooltip } from "@mui/material";
import ActionPanel from "./components/ActionPanel";
import LocationPanel from "./components/LocationPanel";
import GraphPanel from "./components/GraphPanel";
import { useAuth0 } from "@auth0/auth0-react";
import logo from "./assets/logo.png";
import graph from "./assets/graph.svg";

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
    try {
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
    } catch (err) {
      console.log(err);
    }
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
    const response = await fetch(
      `http://127.0.0.1:5000/updatePlantData/${selectedModule}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      }
    );
    const data = await response.json();
    if (data.message) {
      console.log("Data changed successfully");
    } else {
      console.log("Data change failed");
    }
  };

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
        style={{
          padding: "0px 20px",
          margin: "4px 10px",
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ padding: "10px" }}>
          <img width={240} src={logo} alt="logo" />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <a
            href="#"
            style={{
              marginLeft: "12px",
              textDecoration: "none",
              color: "black",
              fontSize: "16px",
            }}
          >
            About
          </a>
          <a
            href="#"
            style={{
              marginLeft: "12px",
              textDecoration: "none",
              color: "black",
              fontSize: "16px",
            }}
          >
            Services
          </a>
          <a
            href="#"
            style={{
              marginLeft: "12px",
              textDecoration: "none",
              color: "black",
              fontSize: "16px",
            }}
          >
            Contact
          </a>
          {isAuthenticated ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                // position: "absolute",
                // right: "20px",
                // top: "50%",
                // transform: "translateY(-50%)",
              }}
            >
              {user.name && (
                <Tooltip
                  style={{ marginLeft: "10px" }}
                  title={`${user.email}`}
                  arrow
                >
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
                  logout({
                    logoutParams: { returnTo: window.location.origin },
                  });
                }}
                style={{ marginLeft: "10px" }}
                size="small"
              >
                Log out
              </Button>
            </div>
          ) : (
            // <div
            //   style={{
            //     width: "100%",
            //     flex: "1",
            //     marginLeft: "20px",
            //     display: "flex",
            //     justifyContent: "center",
            //     alignItems: "center",
            //   }}
            // >
            //   <Button
            //     variant="contained"
            //     color="primary"
            //     onClick={() => {
            //       loginWithRedirect();
            //     }}
            //   >
            //     Log in
            //   </Button>
            // </div>
            <></>
          )}
        </div>
      </Paper>
      {isAuthenticated ? (
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
            <GraphPanel
              selectedModule={selectedModule}
              lowMoistureLevel={selectedPlantData?.ideal_moisture_low}
              highMoistureLevel={selectedPlantData?.ideal_moisture_high}
            />
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
        // Home page design
        <div style={{ display: "flex", flex: "1" }}>
          <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "80%",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                marginTop: "40px",
              }}
            >
              <h1
                style={{
                  width: "100%",
                  fontSize: "40px",
                  fontWeight: "bold",
                  textAlign: "left",
                  lineHeight: "1.6",
                  color: "#0F2032",
                }}
              >
                Efficient Irrigation. <br></br> Smarter Farming. <br></br>{" "}
                Sustainable Farming.
              </h1>
              <p
                style={{
                  fontSize: "18px",
                  textAlign: "left",
                  lineHeight: "2",
                  color: "grey",
                }}
              >
                Welcome to AquaPulse. <br></br> Our system represents a new
                approach to irrigation, combining automation with precision.
                {/* Utilizing real-time weather data and daily soil moisture measurements,
                AquaPulse ensures efficient water usage tailored to your plants'
                needs. This method not only helps in water conservation but also
                promotes healthier plant growth. For those who prefer a hands-on
                approach, a manual override option is available, allowing for
                personal adjustments when needed. Additionally, our interface
                provides a clear, graphical representation of soil moisture
                trends over the last 10 days, aiding you in making informed
                decisions for your garden or farm. */}
                <br></br>
                Choose AquaPulse for a smarter and more sustainable irrigation
                solution.
              </p>
              <div
                style={{
                  width: "100%",
                  marginTop: "40px",
                  display: "flex",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    loginWithRedirect();
                  }}
                >
                  Log in to get started
                </Button>
              </div>
            </div>
          </div>
          <div
            style={{
              flex: "1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "80%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                borderRadius: "10px",
                boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
              }}
            >
              <img
                width={"100%"}
                height={"100%"}
                src={graph}
                alt="graph photo"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IrrigationSystem;
