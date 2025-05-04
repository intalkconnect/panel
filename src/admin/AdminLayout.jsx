import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
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
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [empresaNome, setEmpresaNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [collapsed, setCollapsed] = useState(false);

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

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const menuSections = [
    {
      title: "Gestão",
      items: [
        { to: "/admin", label: "Central de Dados", icon: <LayoutDashboard size={18} /> },
        {
          label: "Cardápio",
          icon: <ClipboardList size={18} />,
          children: [
            { to: "/admin/produtos", label: "Produtos", icon: <Package size={16} /> },
            { to: "/admin/categorias", label: "Categorias", icon: <Tags size={16} /> },
            { to: "/admin/pdv", label: "PDV", icon: <LayoutDashboard size={18} /> },
          ],
        },
        { to: "/admin/pedidos", label: "Pedidos", icon: <Receipt size={18} /> },
      ],
    },
    {
      title: "Sistema",
      items: [
        { to: "/admin/empresas", label: "Empresas", requiredProfile: "master", icon: <Building size={18} /> },
        { to: "/admin/usuarios", label: "Usuários", requiredProfile: "master", icon: <Users size={18} /> },
        { to: "/admin/configuracoes", label: "Configurações", icon: <Settings size={18} /> },
      ],
    },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        className="h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 shadow-sm overflow-y-auto transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <span className="text-lg font-semibold text-gray-700 dark:text-white">
              {empresaNome || "Sistema"}
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 dark:text-gray-300"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="space-y-6 text-sm">
          {menuSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h4 className="text-xs text-gray-400 uppercase mb-2 tracking-wide">{section.title}</h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  if (item.requiredProfile && item.requiredProfile !== userProfile?.perfilNome) return null;

                  if (item.children) {
                    const isOpen = openMenus[item.label];
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className="flex items-center justify-between w-full px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            {!collapsed && <span>{item.label}</span>}
                          </div>
                          {!collapsed && (isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
                        </button>
                        {!collapsed && isOpen && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.to}
                                to={child.to}
                                className={clsx(
                                  "flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium transition",
                                  location.pathname === child.to
                                    ? "bg-gray-100 dark:bg-gray-700 text-blue-600"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
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
                      className={clsx(
                        "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition",
                        location.pathname === item.to
                          ? "bg-gray-100 dark:bg-gray-700 text-blue-600"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      {item.icon}
                      {!collapsed && item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {!collapsed && (
            <div className="mt-6">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md justify-center"
              >
                <LogOut size={18} />
                Sair
              </button>
            </div>
          )}
        </nav>
      </motion.aside>

      {/* Conteúdo principal */}
      <main className={clsx("flex-1 min-h-screen p-6 transition-all", collapsed ? "pl-20" : "pl-64")}>        
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modal logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Deseja realmente sair?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
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
