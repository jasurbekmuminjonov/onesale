import React from "react";
import "./Layout.css";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import { Route, Routes } from "react-router-dom";
import Suppliers from "../../pages/Suppliers";
import Customers from "../../pages/Customers";
import Products from "../../pages/Products";
import Import from "../../pages/Import";
import ImportHistory from "../../pages/ImportHistory";
import Sale from "../../pages/Sale";


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
            <Route path="/" element={<Products />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/import" element={<Import />} />
            <Route path="/sale" element={<Sale />} />
            <Route path="/import-history" element={<ImportHistory />} />
            <Route path="/sale-history" element={<p>Endi bitadi</p>} />
            <Route path="/debt" element={<p>Endi bitadi</p>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Layout;
