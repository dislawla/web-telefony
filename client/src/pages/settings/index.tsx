import DashboardLayout from "@/components/layout/dashboard-layout";

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
      </div>
    </DashboardLayout>
  );
}