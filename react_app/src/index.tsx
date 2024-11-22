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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/absence" element={<Absence />}></Route>
          <Route path="/employees" element={<Employees />}></Route>
          <Route path="/absenceTypes" element={<AbsenceTypes />}></Route>

        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
