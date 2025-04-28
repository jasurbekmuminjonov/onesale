import React, { useState, useEffect } from "react";
import { Layout, Menu, Modal, Typography } from "antd";
import { MdLogout } from "react-icons/md";
import { NavLink, useLocation } from "react-router-dom";
import { cashierItems } from "../../utils/cashierMenu";
import { adminItems } from "../../utils/adminMenu";

const { Sider } = Layout;
const { confirm } = Modal;
const { Title } = Typography;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425);
  const location = useLocation();
  const role = localStorage.getItem("role");

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth <= 425;
      setIsMobile(isSmall);
      setCollapsed(isSmall);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logOut = () => {
    confirm({
      title: "Tizimdan chiqmoqchimisiz?",
      okText: "Ha",
      okType: "danger",
      cancelText: "Yo'q",
      onOk() {
        localStorage.clear();
        window.location.href = "/login";
      },
    });
  };

  return (
    <Sider
      collapsible={!isMobile}
      collapsed={collapsed}
      onCollapse={() => setCollapsed(!collapsed)}
      width={isMobile ? 80 : 220}
      collapsedWidth={isMobile ? 60 : 80}
      style={{ minHeight: "100vh" }}
    >
      <div style={{ padding: "16px", textAlign: "center" }}>
        {!collapsed && (
          <Title level={5} style={{ color: "white", margin: 0 }}>
            Kompaniya
          </Title>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ borderRight: 0 }}
      >
        {(role === 'cashier' ? cashierItems : adminItems
        ).map((item) => (
          <Menu.Item key={item.path} icon={item.icon}>
            <NavLink to={item.path}>{item.label}</NavLink>
          </Menu.Item>
        ))}


        <Menu.Item
          key="logout"
          icon={<MdLogout size={20} />}
          onClick={logOut}
          style={{ marginTop: "auto", color: "red" }}
        >
          Tizimdan chiqish
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
