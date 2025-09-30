import { useEffect, useState } from "react";
import { Plus, Filter } from "lucide-react";
import { AddSourceForm } from "@/components/forms/AddSourceForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrawlSourceTable } from "@/components/CrawlSourceTable";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// todo: remove mock functionality
const crawlJobs = [
  {
    id: "job-001",
    source: "docs.company.com",
    started: new Date(Date.now() - 3 * 60 * 60 * 1000),
    duration: "45m 23s",
    pages: 142,
    errors: 0,
    status: "Completed",
  },
  {
    id: "job-002", 
    source: "help.company.com",
    started: new Date(Date.now() - 6 * 60 * 60 * 1000),
    duration: "23m 12s",
    pages: 89,
    errors: 2,
    status: "Completed",
  },
  {
    id: "job-003",
    source: "blog.company.com",
    started: new Date(Date.now() - 30 * 60 * 1000),
    duration: "30m 45s",
    pages: 67,
    errors: 0,
    status: "Running",
  },
];

export default function Crawl() {
  const [activeTab, setActiveTab] = useState("sources");
  const [showAddSourceForm, setShowAddSourceForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Running":
        return "secondary";
      case "Failed":
        return "destructive";
      default:
        return "outline";
    }
  };


  // useEffect(() => {

  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch('/api/crawl-sources', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           // your data here
  //         })
  //       });
  
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  
  //       const data = await response.json();
  //       console.log('Success:', data);
  //     } catch (error) {
  //       console.error('Error:', error);
  //     }
  //   };
  
  //   fetchData();
  // }, []);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden min-w-0" style={{ maxWidth: '92vw' }}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crawl Management</h1>
          <p className="text-muted-foreground  ">
            Configure and monitor website crawling sources
          </p>
        </div>
        <Button
          onClick={() => setShowAddSourceForm(true)}
          data-testid="button-add-source"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sources" data-testid="tab-sources">Sources</TabsTrigger>
          <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4 w-full overflow-hidden">
          <div className="flex flex-wrap gap-4 mt-3 lg:mt-0 ">
         
            <Select defaultValue="all">
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-40" data-testid="select-cadence-filter">
                <SelectValue placeholder="Cadence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cadence</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
           

            <Button variant="outline" data-testid="button-filters">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          <CrawlSourceTable />
        </TabsContent>




        <TabsContent value="jobs" className="space-y-4 w-full overflow-hidden">
          <div className="flex items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-40" data-testid="select-job-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="today">
              <SelectTrigger className="w-40" data-testid="select-date-filter">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="w-full overflow-hidden">
            <CardHeader>
              <CardTitle>Crawl Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {crawlJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover-elevate cursor-pointer"
                    data-testid={`job-${job.id}`}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      toast({
                        title: "Job Details",
                        description: `Viewing details for crawl job ${job.id}`,
                      });
                    }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{job.id}</p>
                        <Badge variant={getStatusColor(job.status)} className="text-xs">
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.source} • Started {job.started.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">{job.pages} pages</p>
                      <p className="text-xs text-muted-foreground">
                        {job.duration} • {job.errors} errors
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Source Form */}
      <AddSourceForm
        open={showAddSourceForm}
        onOpenChange={setShowAddSourceForm}
        onSubmit={(data) => {
          console.log("Source form submitted:", data);
          toast({
            title: "Source Created",
            description: `Successfully created ${data.name}`,
          });
        }}
      />
    </div>
  );
}