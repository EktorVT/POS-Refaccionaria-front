import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Login from "../pages/Login/Login";
import GuestRoute from "./GuestRoute";
import AppLayout from "../layouts/AppLayout/AppLayout";
import Home from "../pages/Home/Home";
import Sale from "../pages/Sale/Sale";
import Inventory from "../pages/Inventory/Inventory";
import Earnings from "../pages/Earnings/Earnings";
import SettingsPage from "../pages/SettingsPage/SettingsPage";
import { ToastProvider } from "../context/Toast/ToastProvider";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/home" replace />}></Route>
              <Route path="/sale" element={<Sale />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/settings" element={<SettingsPage />} />

              <Route path="*" element={<Sale />} />

              <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/earnings" element={<Earnings />} />
                <Route path="/home" element={<Home />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
