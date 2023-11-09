import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Paper } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Paper elevation={1} style={{padding:"2px 0px", margin: "4px 10px"}}>
      <h2 style={{textAlign: "center"}}>Smart irrigation System Dashboard</h2>
    </Paper>
    <App />
  </React.StrictMode>
);
