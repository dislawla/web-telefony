import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Database, Phone, Building } from "lucide-react";

const tabs = [
  {
    href: "/settings",
    icon: Phone,
    label: "Телефония",
  },
  {
    href: "/settings/crm",
    icon: Building,
    label: "CRM",
  },
  {
    href: "/settings/database",
    icon: Database,
    label: "База данных",
  },
];

export default function Settings() {
  const [location] = useLocation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground">
            Управление настройками системы
          </p>
        </div>

        <div className="flex gap-2 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link key={tab.href} href={tab.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 -mb-px rounded-none border-b-2",
                    location === tab.href
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
