import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { Auth } from "./auth/PrivateRoute";
import Login from "./components/login/Login";
import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Outlet />}>
        <Route element={<Auth />}>
          <Route path="/*" element={<Layout />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
