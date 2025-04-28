import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function Auth() {
  let location = useLocation();
  let token = localStorage.getItem("token");

  return !token ? (
    <Navigate to="/login" state={{ from: location }} />
  ) : (
    <Outlet />
  );
}
