import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Search,
  Settings,
  Plus,
  FileText,
  Activity,
  Database,
  MessageSquare,
  BarChart3,
  Users,
  Key,
  Globe,
  Zap,
  HelpCircle,
  Bell,
  History,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface CommandAction {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation();

  const navigationCommands: CommandAction[] = [
    {
      id: "nav-overview",
      title: "Go to Overview",
      description: "View dashboard and analytics",
      icon: BarChart3,
      action: () => setLocation("/"),
      keywords: ["dashboard", "home", "overview"],
    },
    {
      id: "nav-crawl",
      title: "Go to Crawl Sources",
      description: "Manage crawl sources and jobs",
      icon: Globe,
      action: () => setLocation("/crawl"),
      keywords: ["crawl", "sources", "spider"],
    },
    {
      id: "nav-documents",
      title: "Go to Documents",
      description: "Browse document library",
      icon: FileText,
      action: () => setLocation("/documents"),
      keywords: ["documents", "files", "library"],
    },
    {
      id: "nav-rag-tuning",
      title: "Go to RAG Tuning",
      description: "Configure RAG parameters",
      icon: Zap,
      action: () => setLocation("/rag-tuning"),
      keywords: ["rag", "tuning", "playground", "ai"],
    },
    {
      id: "nav-analytics",
      title: "Go to Analytics",
      description: "View performance metrics",
      icon: BarChart3,
      action: () => setLocation("/analytics"),
      keywords: ["analytics", "metrics", "performance"],
    },
    {
      id: "nav-feedback",
      title: "Go to Feedback",
      description: "Review user feedback",
      icon: MessageSquare,
      action: () => setLocation("/feedback"),
      keywords: ["feedback", "reviews", "moderation"],
    },
    {
      id: "nav-settings",
      title: "Go to Settings",
      description: "Configure organization settings",
      icon: Settings,
      action: () => setLocation("/settings"),
      keywords: ["settings", "configuration", "preferences"],
    },
  ];

  const actionCommands: CommandAction[] = [
    {
      id: "create-source",
      title: "Create Crawl Source",
      description: "Add a new website to crawl",
      icon: Plus,
      action: () => {
        setLocation("/crawl");
        setTimeout(() => {
          const addButton = document.querySelector('[data-testid="button-add-source"]') as HTMLElement;
          addButton?.click();
        }, 100);
      },
      keywords: ["create", "add", "new", "source", "crawl"],
    },
    {
      id: "upload-document",
      title: "Upload Documents",
      description: "Upload files to the document library",
      icon: FileText,
      action: () => {
        setLocation("/documents");
        setTimeout(() => {
          const uploadButton = document.querySelector('[data-testid="button-upload-document"]') as HTMLElement;
          uploadButton?.click();
        }, 100);
      },
      keywords: ["upload", "documents", "files"],
    },
    {
      id: "create-api-key",
      title: "Create API Key",
      description: "Generate a new API key",
      icon: Key,
      action: () => {
        setLocation("/settings");
        setTimeout(() => {
          const apiTab = document.querySelector('[data-testid="tab-api-keys"]') as HTMLElement;
          apiTab?.click();
          setTimeout(() => {
            const createButton = document.querySelector('[data-testid="button-create-api-key"]') as HTMLElement;
            createButton?.click();
          }, 100);
        }, 100);
      },
      keywords: ["create", "api", "key", "token"],
    },
    {
      id: "start-crawl",
      title: "Start Manual Crawl",
      description: "Trigger a crawl job manually",
      icon: Activity,
      action: () => {
        setLocation("/crawl");
        console.log("Start crawl action triggered");
      },
      keywords: ["start", "crawl", "manual", "trigger"],
    },
    {
      id: "test-rag",
      title: "Test RAG System",
      description: "Open RAG tuning playground",
      icon: Zap,
      action: () => setLocation("/rag-tuning"),
      keywords: ["test", "rag", "playground", "query"],
    },
  ];

  const systemCommands: CommandAction[] = [
    {
      id: "view-notifications",
      title: "View Notifications",
      description: "See system alerts and updates",
      icon: Bell,
      action: () => console.log("Open notifications"),
      keywords: ["notifications", "alerts", "inbox"],
    },
    {
      id: "view-audit-log",
      title: "View Audit Log",
      description: "See system activity history",
      icon: History,
      action: () => console.log("Open audit log"),
      keywords: ["audit", "log", "history", "activity"],
    },
    {
      id: "help-docs",
      title: "Open Documentation",
      description: "View help and documentation",
      icon: HelpCircle,
      action: () => window.open("https://docs.ragsuite.com", "_blank"),
      keywords: ["help", "docs", "documentation", "support"],
    },
    {
      id: "system-health",
      title: "Check System Health",
      description: "View system status and health",
      icon: Activity,
      action: () => {
        setLocation("/settings");
        setTimeout(() => {
          const healthTab = document.querySelector('[data-testid="tab-health"]') as HTMLElement;
          healthTab?.click();
        }, 100);
      },
      keywords: ["health", "status", "system", "monitoring"],
    },
  ];

  const allCommands = [...navigationCommands, ...actionCommands, ...systemCommands];

  // Keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const handleSelect = (commandId: string) => {
    const command = allCommands.find(cmd => cmd.id === commandId);
    if (command) {
      command.action();
      onOpenChange(false);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." data-testid="command-input" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationCommands.map((command) => (
            <CommandItem
              key={command.id}
              value={`${command.title} ${command.description} ${command.keywords?.join(" ") || ""}`}
              onSelect={() => handleSelect(command.id)}
              data-testid={`command-${command.id}`}
            >
              <command.icon className="mr-2 h-4 w-4" />
              <div>
                <div>{command.title}</div>
                {command.description && (
                  <div className="text-sm text-muted-foreground">{command.description}</div>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Actions">
          {actionCommands.map((command) => (
            <CommandItem
              key={command.id}
              value={`${command.title} ${command.description} ${command.keywords?.join(" ") || ""}`}
              onSelect={() => handleSelect(command.id)}
              data-testid={`command-${command.id}`}
            >
              <command.icon className="mr-2 h-4 w-4" />
              <div>
                <div>{command.title}</div>
                {command.description && (
                  <div className="text-sm text-muted-foreground">{command.description}</div>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="System">
          {systemCommands.map((command) => (
            <CommandItem
              key={command.id}
              value={`${command.title} ${command.description} ${command.keywords?.join(" ") || ""}`}
              onSelect={() => handleSelect(command.id)}
              data-testid={`command-${command.id}`}
            >
              <command.icon className="mr-2 h-4 w-4" />
              <div>
                <div>{command.title}</div>
                {command.description && (
                  <div className="text-sm text-muted-foreground">{command.description}</div>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}