import React from "react";
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./components/Profile";
import MainLayout from "./components/MainLayout";
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route element={<ProtectedRoute>
          <MainLayout/>
        </ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;