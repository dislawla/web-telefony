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
      call.createdAt.toISOString().split('T')[0] === date
    ).length
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Calls</CardTitle>
          <CardDescription>All-time calls made</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{calls.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
          <CardDescription>Completed calls percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {successRate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avg Duration</CardTitle>
          <CardDescription>Average call length</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(avgDuration)}s
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Calls</CardTitle>
          <CardDescription>Currently in progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {calls.filter(call => call.status === "in-progress").length}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Call Volume</CardTitle>
          <CardDescription>Last 7 days of activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={callsByDay}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value} calls`, 'Volume']}
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
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
