import React, { useState } from "react";
import CategoryPage from "../../../page/Admin/Category/CategoryPage";
import {
  Activity,
  Server,
  Settings,
  FileText,
  Code,
  Coffee,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("overview");
  const menuItems = [
    { id: "overview", icon: Server, label: "Overview" },
    { id: "users", icon: Settings, label: "Quản lý khách hàng" },
    { id: "categories", icon: FileText, label: "Quản lý danh mục" },
    { id: "orders", icon: Activity, label: "Quản lý đơn hàng" },
    { id: "products", icon: Code, label: "Quản lý sản phẩm" },
    { id: "payments", icon: Coffee, label: "Quản lý thanh toán" },
    { id: "shipping", icon: Settings, label: "Quản lý vận chuyển" },
  ];
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <aside className="w-72 bg-gradient-to-b from-slate-900/90 to-slate-800/50 border-r border-blue-500/10 p-6 flex flex-col sticky top-0 h-screen backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-10 p-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              QUẦN ÁO
            </h1>
            <p className="text-xs text-slate-500 tracking-[0.2em] font-semibold">
              MANAGER
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 mb-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeMenu === item.id
                    ? "bg-gradient-to-r from-blue-500/20 to-blue-500/5 text-blue-400 border-l-4 border-blue-500 shadow-lg shadow-blue-500/10"
                    : "text-slate-400 hover:bg-blue-500/10 hover:text-blue-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8"></header>
        <div>
          <CategoryPage />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
