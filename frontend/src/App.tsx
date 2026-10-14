import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

import { AppLayout } from './layouts/AppLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Farms } from './pages/Farms';
import { Fields } from './pages/Fields';
import { Crops } from './pages/Crops';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { DiseaseHistory } from './pages/DiseaseHistory';
import { Weather } from './pages/Weather';
import { SoilAnalysis } from './pages/SoilAnalysis';
import { MarketPrices } from './pages/MarketPrices';
import { Expenses } from './pages/Expenses';
import { Harvests } from './pages/Harvests';
import { Calendar } from './pages/Calendar';
import { PestManagement } from './pages/PestManagement';
import { Knowledge } from './pages/Knowledge';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Authenticated Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/farms" element={<Farms />} />
                  <Route path="/fields" element={<Fields />} />
                  <Route path="/crops" element={<Crops />} />
                  <Route path="/disease-detection" element={<DiseaseDetection />} />
                  <Route path="/disease-history" element={<DiseaseHistory />} />
                  <Route path="/weather" element={<Weather />} />
                  <Route path="/soil-analysis" element={<SoilAnalysis />} />
                  <Route path="/market-prices" element={<MarketPrices />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/harvests" element={<Harvests />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/pest-management" element={<PestManagement />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Admin Only Route */}
                  <Route element={<ProtectedRoute adminOnly={true} />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                </Route>
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
