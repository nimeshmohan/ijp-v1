import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CheckCircle2, FileEdit, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDashboardSummary } from "@/api/dashboard";
import { ACTIVITY_ACTION_LABELS } from "@/lib/activityLabels";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of job postings and recent activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Jobs"
          value={data?.totalJobs}
          icon={Briefcase}
          loading={isLoading}
        />
        <StatCard
          title="Published Jobs"
          value={data?.publishedJobs}
          icon={CheckCircle2}
          loading={isLoading}
        />
        <StatCard
          title="Draft Jobs"
          value={data?.draftJobs}
          icon={FileEdit}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">
              Could not load recent activity.
            </p>
          ) : data && data.recentActivity.length > 0 ? (
            <ul className="divide-y">
              {data.recentActivity.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {ACTIVITY_ACTION_LABELS[entry.action]}
                    </p>
                    <p className="text-muted-foreground">{entry.userEmail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number | undefined;
  icon: ComponentType<{ className?: string }>;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
