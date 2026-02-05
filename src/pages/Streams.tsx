import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StreamBoard } from "@/components/streams/StreamBoard";

export default function StreamsPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] -m-6">
        <StreamBoard />
      </div>
    </DashboardLayout>
  );
}
