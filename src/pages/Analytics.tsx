import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RefreshCw, FileText } from "lucide-react";
import { useAnalytics, type Granularity, type DateRange } from "@/hooks/useAnalytics";
import { useToast } from "@/hooks/use-toast";
import { subDays } from "date-fns";
import {
  AnalyticsDateFilter,
  AnalyticsKPICards,
  InteractionVolumeChart,
  ResponsePerformanceChart,
  SentimentAnalysisChart,
  TeamPerformanceTable,
  PlatformBreakdownChart,
  TopInteractionsList,
} from "@/components/analytics";

export default function AnalyticsPage() {
  const { data, loading, error, fetchAnalytics } = useAnalytics();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [granularity, setGranularity] = useState<Granularity>("daily");

  useEffect(() => {
    fetchAnalytics(dateRange, granularity);
  }, [dateRange, granularity, fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics(dateRange, granularity);
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    setExporting(true);
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default;

      const element = reportRef.current;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `analytics-report-${dateRange.startDate.toISOString().split("T")[0]}-to-${dateRange.endDate.toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          windowWidth: 1200,
        },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt as any).from(element).save();
      
      toast({
        title: "Export Complete",
        description: "Your analytics report has been downloaded.",
      });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-muted-foreground">
              Track performance and insights across all platforms
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AnalyticsDateFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={exporting || !data}
            >
              {exporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Report Content - wrapped in ref for PDF export */}
        <div ref={reportRef} className="space-y-6">
          {/* Report Header for PDF */}
          <div className="hidden print:block mb-6 pb-4 border-b">
            <h1 className="text-2xl font-bold">Analytics Report</h1>
            <p className="text-muted-foreground">
              {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
            </p>
          </div>

          {/* Section 1: Key Metrics */}
          <section>
            <AnalyticsKPICards summary={data?.summary || null} loading={loading} />
          </section>

          {/* Section 2: Interaction Volume */}
          <section>
            <InteractionVolumeChart
              platformTrends={data?.platformTrends || null}
              loading={loading}
              granularity={granularity}
              onGranularityChange={setGranularity}
            />
          </section>

          {/* Section 3: Response Performance */}
          <section>
            <ResponsePerformanceChart
              platformBreakdown={data?.platformBreakdown || null}
              loading={loading}
            />
          </section>

          {/* Section 4: Sentiment Analysis */}
          <section>
            <SentimentAnalysisChart
              sentiment={data?.sentiment || null}
              sentimentTrend={data?.sentimentTrend || null}
              granularity={granularity}
              loading={loading}
            />
          </section>

          {/* Section 5: Team Performance */}
          <section>
            <TeamPerformanceTable
              teamPerformance={data?.teamPerformance || null}
              loading={loading}
            />
          </section>

          {/* Section 6: Platform Breakdown */}
          <section>
            <PlatformBreakdownChart
              platformBreakdown={data?.platformBreakdown || null}
              loading={loading}
            />
          </section>

          {/* Section 7: Top Interactions */}
          <section>
            <TopInteractionsList
              interactions={data?.topInteractions || null}
              loading={loading}
            />
          </section>
        </div>

        {/* No Data State */}
        {data && !loading && data.summary.totalInteractions === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Data Available</h3>
            <p className="text-muted-foreground max-w-md">
              Start by adding interactions in the Smart Inbox or connect your
              social media platforms to see analytics here.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/dashboard/inbox">Go to Inbox</a>
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium mb-2">Error Loading Analytics</h3>
            <p className="text-muted-foreground max-w-md mb-4">{error}</p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
