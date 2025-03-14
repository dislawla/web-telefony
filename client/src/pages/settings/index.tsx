import DashboardLayout from "@/components/layout/dashboard-layout";
import { Phone, Database, Building } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import TelephonySettings from "./telephony";

// Компонент навигации по настройкам
function SettingsNavigation() {
  const [location] = useLocation();

  const items = [
    {
      href: "/settings",
      icon: <Phone className="h-4 w-4" />,
      label: "Телефония",
    },
    {
      href: "/settings/database",
      icon: <Database className="h-4 w-4" />,
      label: "База данных",
    },
    {
      href: "/settings/crm",
      icon: <Building className="h-4 w-4" />,
      label: "CRM",
    },
  ];

  return (
    <nav className="flex gap-2 border-b mb-6">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-4 py-2 -mb-px border-b-2 transition-colors",
            location === item.href
              ? "border-primary text-primary"
              : "border-transparent hover:border-border"
          )}
        >
          {item.icon}
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground">
            Управление настройками системы
          </p>
        </div>

        <SettingsNavigation />

        {/* По умолчанию показываем настройки телефонии */}
        <TelephonySettings />
      </div>
    </DashboardLayout>
  );
}