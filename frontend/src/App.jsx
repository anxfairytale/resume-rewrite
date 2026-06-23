import React from "react";
import {BrowserRouter,Routes,Route,Navigate,} from "react-router-dom";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Users from "./components/AdminView/Users";
import AdminSettings from "./components/AdminView/AdminSettings";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/login"
              element={<Navigate to="/?auth=login" replace />}
            />
            <Route path="/profile"element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/users" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route path="/free-users" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users view="free" />
                </ProtectedRoute>
              }
            />
            <Route path="/paid-users" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users view="pro" />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;