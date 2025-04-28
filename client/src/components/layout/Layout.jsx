import React from "react";
import "./Layout.css";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import { Route, Routes } from "react-router-dom";
import Suppliers from "../../pages/Suppliers";
import Customers from "../../pages/Customers";


function Layout() {
  const role = localStorage.getItem("role");
  return (
    <div className="layout">
      <div className="layout_left">
        <Sidebar />
      </div>

      <div className="layout_right">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/customers" element={<Customers />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Layout;
