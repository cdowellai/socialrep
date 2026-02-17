import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentProvidersTab } from "./AgentProvidersTab";
import { AgentRoutingRulesTab } from "./AgentRoutingRulesTab";
import { AgentSafetyPoliciesTab } from "./AgentSafetyPoliciesTab";
import { AgentLogsTab } from "./AgentLogsTab";
import { Cpu, Route, Shield, BarChart3 } from "lucide-react";

export function AgentSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-primary/50 pl-4">
        <p className="text-sm text-muted-foreground">
          Connect external AI providers (OpenClaw, OpenAI, or any compatible endpoint) to power automated responses. 
          All API keys are encrypted at rest and never displayed after saving. All actions are logged.
        </p>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="providers"><Cpu className="h-4 w-4 mr-2" />Providers</TabsTrigger>
          <TabsTrigger value="routing"><Route className="h-4 w-4 mr-2" />Routing</TabsTrigger>
          <TabsTrigger value="safety"><Shield className="h-4 w-4 mr-2" />Safety</TabsTrigger>
          <TabsTrigger value="logs"><BarChart3 className="h-4 w-4 mr-2" />Logs & Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="providers"><AgentProvidersTab /></TabsContent>
        <TabsContent value="routing"><AgentRoutingRulesTab /></TabsContent>
        <TabsContent value="safety"><AgentSafetyPoliciesTab /></TabsContent>
        <TabsContent value="logs"><AgentLogsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
