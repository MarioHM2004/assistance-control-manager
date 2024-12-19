import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/navBar/Layout';
import { AuthProvider } from './components/auth/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import reportWebVitals from './reportWebVitals';
import { Spinner } from './components/utils/Spinner';

const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Absence = React.lazy(() => import('./pages/Absence'));
const Employees = React.lazy(() => import('./pages/Employees'));
const AbsenceTypes = React.lazy(() => import('./pages/AbsenceTypes'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Layout always visible*/}
          <Route element={<Layout />}>
            <Route
              path="/login"
              element={
                <Suspense fallback={<Spinner />}>
                  <Login />
                </Suspense>
              }
            />

            {/*Protected routes*/}
            <Route path="/" element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <>
                    <Navigate to="/dashboard" replace />
                    <Suspense fallback={<Spinner />}>
                      <Dashboard />
                    </Suspense>
                  </>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<Spinner />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="/absence"
                element={
                  <Suspense fallback={<Spinner />}>
                    <Absence />
                  </Suspense>
                }
              />
              <Route
                path="/employees"
                element={
                  <Suspense fallback={<Spinner />}>
                    <Employees />
                  </Suspense>
                }
              />
              <Route
                path="/absenceTypes"
                element={
                  <Suspense fallback={<Spinner />}>
                    <AbsenceTypes />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
