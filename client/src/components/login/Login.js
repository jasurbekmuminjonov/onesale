import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "../../api";
import "./Login.css";
import login_bg from "./login-bg.png";

const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await axios.post("/login", data);

      const { fullname, role, token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("fullname", fullname);
      localStorage.setItem("role", role);
      message.success(res.data.message);
      navigate("/");
    } catch (error) {
      message.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
    reset();
  };

  return (
    <div className="login">
      <img src={login_bg} alt="Kirish foni" className="login__bg" />
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="login__form">
        <h1 className="login__title">Kirish</h1>
        <div className="login__inputs">
          <div>
            <div className="login__box">
              <input
                type="text"
                placeholder="Telefon raqam"
                required
                className="login__input"
                {...register("phone")}
              />
              <i className="ri-mail-fill"></i>
            </div>
            <p style={{ textAlign: "center" }}>Talab etiladigan format: 901234567</p>
          </div>
          <div className="login__box">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Parol"
              required
              className="login__input"
              {...register("password")}
            />
            <i
              className={`fas ${isPasswordVisible ? "fa-eye-slash" : "fa-eye"}`}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            ></i>
          </div>
        </div>
        <div className="login__check"></div>
        <button type="submit" disabled={loading} className="login__button">
          {loading ? "Loading..." : "Kirish"}
        </button>
        {/* <div className="login__register">
          Sumka ishlab chiqarish zavodini avtomatlashtirish tizimiga xush
          kelibsiz!
        </div> */}
      </form>
    </div>
  );
};

export default Login;
