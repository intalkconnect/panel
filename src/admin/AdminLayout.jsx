import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  LayoutDashboard,
  Building,
  Users,
  Settings,
  ClipboardList,
  Package,
  Tags,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [empresaNome, setEmpresaNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

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

  const menuSections = [
    {
      title: "Gestão",
      items: [
        {
          to: "/admin",
          label: "Dashboard",
          icon: <LayoutDashboard size={18} />,
        },
        {
          label: "Cardápio",
          icon: <ClipboardList size={18} />,
          children: [
            {
              to: "/admin/produtos",
              label: "Produtos",
              icon: <Package size={16} />,
            },
            {
              to: "/admin/categorias",
              label: "Categorias",
              icon: <Tags size={16} />,
            },
          ],
        },
      ],
    },
    {
      title: "Sistema",
      items: [
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
          to: "/admin/configuracoes",
          label: "Configurações",
          icon: <Settings size={18} />,
        },
      ],
    },
  ];

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex transition-all bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-4 flex flex-col justify-between shadow-md z-10">
        <div>
          {userProfile && (
            <div className="flex flex-col items-center mb-6">
              <div className="bg-gray-200 dark:bg-gray-700 text-red-600 p-3 rounded-full mb-2">
                <User size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Bem-vindo</p>
                <p className="font-bold text-gray-900 dark:text-white break-words">
                  {empresaNome}
                </p>
              </div>
            </div>
          )}

          <nav className="space-y-6">
            {menuSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                  {section.title}
                </h4>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    if (
                      item.requiredProfile &&
                      item.requiredProfile !== userProfile?.perfilNome
                    ) {
                      return null;
                    }

                    if (item.children) {
                      const isOpen = openMenus[item.label];
                      return (
                        <div key={item.label}>
                          <button
                            onClick={() => toggleMenu(item.label)}
                            className="flex w-full items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </div>
                            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                          {isOpen && (
                            <div className="ml-6 mt-2 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.to}
                                  to={child.to}
                                  className={`flex items-center gap-2 px-2 py-1 rounded-lg transition text-sm font-medium ${
    location.pathname === child.to
      ? "bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-indigo-400"
      : "hover:bg-gray-300 dark:hover:bg-gray-700"
  }`}
                                >
                                  {child.icon}
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition font-medium ${
    location.pathname === item.to
      ? "bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-indigo-400"
      : "hover:bg-gray-300 dark:hover:bg-gray-700"
  }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 transition rounded-lg font-semibold text-white justify-center"
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
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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
