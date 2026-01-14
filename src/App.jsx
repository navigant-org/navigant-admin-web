import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard";
import Buildings from "./Pages/Buildings";
import Floors from "./Pages/Floors";
import MapEditor from "./Pages/MapEditor";
import ExportData from "./Pages/ExportData";
import Layout from "./Components/Layout";
import BuildingLayout from "./Components/BuildingLayout";
import BuildingNodes from "./Pages/BuildingNodes";
import BuildingEdges from "./Pages/BuildingEdges";
import storage, { KEYS } from "./utils/storage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = storage.load(KEYS.AUTH_TOKEN);
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    storage.remove(KEYS.AUTH_TOKEN);
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Auth onLogin={handleLogin} />
            ) : (
              <Navigate to="/buildings" replace />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/buildings" element={<Buildings />} />

          {/* Building Layout Routes */}
          <Route path="/buildings/:buildingId" element={<BuildingLayout />}>
            <Route index element={<Navigate to="floors" replace />} />
            <Route path="floors" element={<Floors />} />
            <Route path="nodes" element={<BuildingNodes />} />
            <Route path="edges" element={<BuildingEdges />} />
          </Route>

          <Route path="/floors/:floorId/map" element={<MapEditor />} />
          <Route path="/export-data" element={<ExportData />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
