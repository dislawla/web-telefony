import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Call } from "@shared/schema";

interface CallStatsProps {
  calls: Call[];
}

export function CallStats({ calls }: CallStatsProps) {
  // Calculate success rate
  const successRate = calls.length > 0
    ? (calls.filter(call => call.status === "completed").length / calls.length) * 100
    : 0;

  // Calculate average duration
  const avgDuration = calls.length > 0
    ? calls.reduce((acc, call) => acc + (call.duration || 0), 0) / calls.length
    : 0;

  // Group calls by day for the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const callsByDay = last7Days.map(date => ({
    date: date,
    calls: calls.filter(call => 
      // added null check here
      call.createdAt && call.createdAt.toISOString().split('T')[0] === date
    ).length
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Всего звонков</CardTitle>
          <CardDescription>За все время</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{calls.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Успешные звонки</CardTitle>
          <CardDescription>Процент завершенных</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {successRate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Средняя длительность</CardTitle>
          <CardDescription>Длительность звонка</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(avgDuration)}с
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Активные звонки</CardTitle>
          <CardDescription>В процессе</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {calls.filter(call => call.status === "in-progress").length}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Количество звонков</CardTitle>
          <CardDescription>За последние 7 дней</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callsByDay}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { weekday: 'short' })}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value} звонков`, 'Количество']}
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString('ru-RU')}
                />
                <Bar
                  dataKey="calls"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}