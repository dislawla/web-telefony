import DashboardLayout from "@/components/layout/dashboard-layout";

export default function CRMSettings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">CRM Система</h1>
          <p className="text-muted-foreground">
            Управление интеграцией с CRM системой
          </p>
        </div>

        {/* Здесь будет содержимое страницы CRM */}
      </div>
    </DashboardLayout>
  );
}
