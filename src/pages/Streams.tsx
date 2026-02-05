import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StreamBoard } from "@/components/streams/StreamBoard";

export default function StreamsPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] -mx-6 -mb-6 -mt-0">
        <StreamBoard />
      </div>
    </DashboardLayout>
  );
}
