import DashboardLayout from "@/components/layout/dashboard-layout";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки телефонии</h1>
          <p className="text-muted-foreground">
            Управление настройками телефонной системы
          </p>
        </div>

        {/* Здесь будет форма настроек телефонии */}
      </div>
    </DashboardLayout>
  );
}