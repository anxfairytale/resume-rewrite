import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children,allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  let user=null;
  try{
    user=storedUser?JSON.parse(storedUser):null;
  }catch(err){
    console.log("Invalid user data in localStorage");
  }
  if (!token || !user) {
    return (
      <Navigate
        to="/?auth=login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }
  if(allowedRoles && !allowedRoles.includes(user.role)){
    return(
      <Navigate to={user.role==="admin"?"/admin/users":"/home"} replace/>
    )
  }
  return children;
}

export default ProtectedRoute;