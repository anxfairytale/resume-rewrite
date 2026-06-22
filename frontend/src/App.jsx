import React from "react";
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile";
import Users from "./components/AdminView/Users";
import MainLayout from "./components/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSettings from "./components/AdminView/AdminSettings";
function App() {
  return (
    <>
     <ToastContainer position="top-right" autoClose={2000} />
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route element={<ProtectedRoute>
          <MainLayout/>
        </ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/users" element={<Users/>}/>
        <Route path="/settings" element={<AdminSettings/>}/>
        <Route path="/free-users" element={<Users view="free"/>}/>
        <Route path="/paid-users" element={<Users view="pro"/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
    
}

export default App;