import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  LayoutDashboard,
  Building,
  Users,
  Boxes,
  Folder,
  Sun,
  Moon,
  Settings,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [empresaNome, setEmpresaNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    const empresaId = localStorage.getItem("empresa_id");
    const perfilId = localStorage.getItem("perfil_id");
    const perfilNome = localStorage.getItem("perfil_nome");
    const empresaNomeLS = localStorage.getItem("empresa_nome");

    if (!empresaId || !perfilId) {
      navigate("/login");
    } else {
      setUserProfile({ perfilId, perfilNome });
      setEmpresaNome(empresaNomeLS);
    }

    setLoading(false);
  }, [navigate]);

  const confirmLogout = () => {
    localStorage.clear();
    localStorage.setItem("logout_msg", "Sessão encerrada com sucesso!");
    navigate("/login");
  };

  const navItems = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: "/admin/empresas",
      label: "Empresas",
      requiredProfile: "master",
      icon: <Building size={18} />,
    },
    {
      to: "/admin/usuarios",
      label: "Usuários",
      requiredProfile: "master",
      icon: <Users size={18} />,
    },
    {
      to: "/admin/produtos",
      label: "Produtos",
      icon: <Boxes size={18} />,
    },
    {
      to: "/admin/categorias",
      label: "Categorias",
      icon: <Folder size={18} />,
    },
    {
      to: "/admin/configuracoes",
      label: "Configurações",
      icon: <Settings size={18} />,
    },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen flex transition-all bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="relative"></div>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#F74036] text-white p-4 flex flex-col justify-between shadow-md z-10">
        {/* Botão de tema */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-500"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div>
          <div className="flex items-center justify-center mb-6">
            <img
              src="https://onyedkfjdkplbaxpetln.supabase.co/storage/v1/object/public/zapediu//logoWP.png"
              alt="Zapediu Logo"
              className="w-24 h-auto"
            />
          </div>

          {userProfile && (
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="bg-white text-[#F74036] p-2 rounded-full">
                <User size={20} />
              </div>
              <div className="leading-tight text-center">
                <p className="text-sm">Bem-vindo</p>
                <p className="font-bold">{empresaNome}</p>
              </div>
            </div>
          )}

          <nav className="space-y-2 mt-4">
            {navItems.map((item) => {
              if (
                item.requiredProfile &&
                item.requiredProfile !== userProfile?.perfilNome
              ) {
                return null;
              }

              const active = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition font-medium ${
                    active
                      ? "bg-white text-[#F74036] shadow"
                      : "hover:bg-red-500"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-100 text-[#F74036] transition rounded-lg font-semibold justify-center"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 pl-64 overflow-y-auto h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Outlet />
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full shadow-lg text-center">
            <h3 className="text-lg font-bold mb-4">Deseja realmente sair?</h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="bg-[#F74036] text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
