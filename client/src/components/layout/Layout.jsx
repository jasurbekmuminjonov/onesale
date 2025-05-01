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
import SaleHistory from "../../pages/SaleHistory";
import Debtors from "../../pages/Debtors";
import ReturnProduct from "../../pages/ReturnProduct";
import Employees from "../../pages/Employees";
import Statistics from "../../pages/Statistics";


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
            <Route path="/" element={role === "cashier" ? <Sale /> : <Products />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/import" element={<Import />} />
            <Route path="/sale" element={<Sale />} />
            <Route path="/import-history" element={<ImportHistory />} />
            <Route path="/sale-history" element={<SaleHistory />} />
            <Route path="/return" element={<ReturnProduct />} />
            <Route path="/debt" element={<Debtors />} />
            <Route path="/employee" element={<Employees />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Layout;
