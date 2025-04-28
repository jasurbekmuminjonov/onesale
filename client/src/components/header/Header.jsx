import React from "react";
import "./Header.css";

function Header() {
  const adminFullname = localStorage.getItem("fullname");
  const Role = localStorage.getItem("role");
  const roles = {
    admin: "Admin",
    cashier: "Kassir",
    manager: "Ish boshqaruvchi",
  }

  return (
    <header>
      <h4>{Role === 'admin' ? "Do'kon" : "Ism"}: {adminFullname} Rol: {roles[Role]}</h4>
    </header>
  );
}

export default Header;
