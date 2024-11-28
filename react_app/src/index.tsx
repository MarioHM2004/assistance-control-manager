import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { Layout } from './components/navBar/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Absence } from './pages/Absence';
import { Employees } from './pages/Employees';
import { AbsenceTypes } from './pages/AbsenceTypes';
import { AuthProvider } from './components/auth/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Rutas no protegidas */}
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/absence" element={<Absence />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/absenceTypes" element={<AbsenceTypes />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
