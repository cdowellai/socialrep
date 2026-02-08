import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostComposer } from "@/components/content/PostComposer";
import { ContentCalendar } from "@/components/content/ContentCalendar";
import { ContentQueue } from "@/components/content/ContentQueue";
import { ContentAnalytics } from "@/components/content/ContentAnalytics";
import { PenLine, Calendar, ListTodo, BarChart3 } from "lucide-react";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("compose");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-muted-foreground">
            Create, schedule, and manage your social media posts
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="compose" className="gap-2">
              <PenLine className="h-4 w-4" />
              <span className="hidden sm:inline">Compose</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="gap-2">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Queue</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="mt-6">
            <PostComposer />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <ContentCalendar />
          </TabsContent>

          <TabsContent value="queue" className="mt-6">
            <ContentQueue />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <ContentAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
