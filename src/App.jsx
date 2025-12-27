import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Pages/Auth'
import Dashboard from './Pages/Dashboard'
import UploadMap from './Pages/UploadMap';
import MapEditor from './Pages/MapEditor';
import ManageNodes from './Pages/ManageNodes';
import ExportData from './Pages/ExportData';
import Layout from './Components/Layout';
import storage, { KEYS } from './utils/storage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = storage.load(KEYS.AUTH_TOKEN);
    if (token) {
        setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
      storage.save(KEYS.AUTH_TOKEN, 'dummy-token');
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
                    <Navigate to="/dashboard" replace />
                )
            } 
        />

        {/* Protected Routes */}
        <Route element={isAuthenticated ? <Layout onLogout={handleLogout} /> : <Navigate to="/" replace />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload-map" element={<UploadMap />} />
            <Route path="/map-editor" element={<MapEditor />} />
            <Route path="/manage-nodes" element={<ManageNodes />} />
            <Route path="/export-data" element={<ExportData />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
