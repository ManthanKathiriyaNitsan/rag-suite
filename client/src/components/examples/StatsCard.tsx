import { Activity, Users, Search, AlertTriangle } from "lucide-react";
import { StatsCard } from "../StatsCard";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <StatsCard
        title="Queries Today"
        value="1,234"
        description="from yesterday"
        trend={{ value: 12, isPositive: true }}
        icon={<Search className="h-4 w-4" />}
      />
      <StatsCard
        title="p95 Latency"
        value="245ms"
        description="avg response time"
        trend={{ value: 5, isPositive: false }}
        icon={<Activity className="h-4 w-4" />}
      />
      <StatsCard
        title="Thumbs-up Rate"
        value="89%"
        description="user satisfaction"
        trend={{ value: 3, isPositive: true }}
        icon={<Users className="h-4 w-4" />}
      />
      <StatsCard
        title="Crawl Errors"
        value="3"
        description="need attention"
        icon={<AlertTriangle className="h-4 w-4" />}
      />
    </div>
  );
}