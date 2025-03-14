import DashboardLayout from "@/components/layout/dashboard-layout";
import { Phone, Database, Building } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Данные о разделах настроек
const settingsSections = [
  {
    id: "telephony",
    href: "/settings/telephony",
    icon: <Phone className="h-6 w-6" />,
    title: "Телефония",
    description: "Настройка параметров телефонии, включая API ключи, маршрутизацию звонков и интеграцию с ИИ",
    features: [
      "Управление API ключами",
      "Настройка входящих и исходящих звонков",
      "Голосовые приветствия",
      "Интеграция с ИИ для анализа разговоров"
    ]
  },
  {
    id: "database",
    href: "/settings/database",
    icon: <Database className="h-6 w-6" />,
    title: "База данных",
    description: "Управление базой данных системы, включая резервное копирование и восстановление",
    features: [
      "Настройка подключения к базе данных",
      "Управление резервными копиями",
      "Мониторинг производительности",
      "Очистка устаревших данных"
    ]
  },
  {
    id: "crm",
    href: "/settings/crm",
    icon: <Building className="h-6 w-6" />,
    title: "CRM",
    description: "Настройка интеграции с CRM системой и управление параметрами синхронизации",
    features: [
      "Подключение к CRM системе",
      "Настройка синхронизации контактов",
      "Управление полями данных",
      "Правила обработки данных"
    ]
  }
];

// Компонент навигации по настройкам
function SettingsNavigation() {
  const [location] = useLocation();

  return (
    <nav className="flex gap-2 border-b mb-6">
      {settingsSections.map((section) => (
        <a
          key={section.href}
          href={section.href}
          className={cn(
            "flex items-center gap-2 px-4 py-2 -mb-px border-b-2 transition-colors",
            location === section.href
              ? "border-primary text-primary"
              : "border-transparent hover:border-border"
          )}
        >
          {section.icon}
          <span>{section.title}</span>
        </a>
      ))}
    </nav>
  );
}

// Компонент карточки раздела настроек
function SettingsSectionCard({ section }: { section: typeof settingsSections[0] }) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <a href={section.href}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {section.icon}
            <CardTitle>{section.title}</CardTitle>
          </div>
          <CardDescription>{section.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {section.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </CardContent>
      </a>
    </Card>
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {settingsSections.map((section) => (
            <SettingsSectionCard key={section.id} section={section} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}