import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App";
import Login from "./admin/Login";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Empresas from "./admin/Empresas";
import Produtos from "./admin/Produtos";
import Categorias from "./admin/Categorias";
import Pedidos from "./admin/Pedidos";
import Usuarios from "./admin/Usuarios";
import Configuracoes from "./admin/Configuracoes";
import Padrao from "./components/telas/Padrao";
import DarkWrapper from "./components/layout/DarkWrapper"; // 👈 aqui

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <DarkWrapper>
        <Routes>
          <Route path="/" element={<Padrao />} />
          <Route path="/:encoded" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
        </Routes>
      </DarkWrapper>
    </BrowserRouter>
    <ToastContainer position="top-right" autoClose={4000} />
  </React.StrictMode>
);
