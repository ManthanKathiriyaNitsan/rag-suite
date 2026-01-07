import React, { useState, useEffect, useMemo, useCallback } from "react";
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

const CommandPalette = React.memo(function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation();

  // 🧭 Memoized navigation commands - Only show pages from sidebar and user dropdown
  // Sidebar pages: Overview, Crawl, Analytics, Chatbot Configuration, Search Configuration, System Health
  // User dropdown pages: Profile, Settings
  const navigationCommands: CommandAction[] = useMemo(() => [
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
      title: "Go to Crawl",
      description: "Manage crawl sources and jobs",
      icon: Globe,
      action: () => setLocation("/crawl"),
      keywords: ["crawl", "sources", "spider", "documents"],
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
      id: "nav-chatbot-config",
      title: "Go to Chatbot Configuration",
      description: "Configure chatbot settings",
      icon: MessageSquare,
      action: () => setLocation("/chatbot-configuration"),
      keywords: ["chatbot", "chat", "configuration", "config"],
    },
    {
      id: "nav-search-config",
      title: "Go to Search Configuration",
      description: "Configure search settings",
      icon: Search,
      action: () => setLocation("/search-configuration"),
      keywords: ["search", "configuration", "config"],
    },
    {
      id: "nav-system-health",
      title: "Go to System Health",
      description: "View system status and health",
      icon: Activity,
      action: () => setLocation("/system-health"),
      keywords: ["health", "status", "system", "monitoring"],
    },
    {
      id: "nav-profile",
      title: "Go to Profile",
      description: "Manage your account settings",
      icon: Users,
      action: () => setLocation("/profile"),
      keywords: ["profile", "account", "user"],
    },
    {
      id: "nav-settings",
      title: "Go to Settings",
      description: "Configure organization settings",
      icon: Settings,
      action: () => setLocation("/settings"),
      keywords: ["settings", "configuration", "preferences"],
    },
  ], [setLocation]);

  // ⚡ Memoized action commands - Only show actions that actually work
  const actionCommands: CommandAction[] = useMemo(() => [
    {
      id: "create-source",
      title: "Create Crawl Source",
      description: "Add a new website to crawl",
      icon: Plus,
      action: () => {
        setLocation("/crawl");
        // Try to click add source button after navigation
        setTimeout(() => {
          const addButton = document.querySelector('[data-testid="button-add-source"]') as HTMLElement;
          if (addButton) {
            addButton.click();
          }
        }, 300);
      },
      keywords: ["create", "add", "new", "source", "crawl"],
    },
    {
      id: "upload-document",
      title: "Upload Documents",
      description: "Upload files to the document library",
      icon: FileText,
      action: () => {
        setLocation("/crawl");
        // Navigate to documents tab and try to click upload button
        setTimeout(() => {
          const documentTab = document.querySelector('[data-testid="tab-document"]') as HTMLElement;
          if (documentTab) {
            documentTab.click();
            setTimeout(() => {
              const uploadButton = document.querySelector('[data-testid="button-upload-document"]') as HTMLElement;
              if (uploadButton) {
                uploadButton.click();
              }
            }, 200);
          }
        }, 300);
      },
      keywords: ["upload", "documents", "files"],
    },
  ], [setLocation]);

  // 🔧 Memoized system commands - Only show functional commands
  const systemCommands: CommandAction[] = useMemo(() => [
    {
      id: "help-docs",
      title: "Open Documentation",
      description: "View help and documentation",
      icon: HelpCircle,
      action: () => window.open("https://docs.ragsuite.com", "_blank"),
      keywords: ["help", "docs", "documentation", "support"],
    },
  ], []);

  // 🎯 Memoized all commands
  const allCommands = useMemo(() => [...navigationCommands, ...actionCommands, ...systemCommands], [navigationCommands, actionCommands, systemCommands]);

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

  // 🎯 Memoized command selection handler
  const handleSelect = useCallback((commandId: string) => {
    const command = allCommands.find(cmd => cmd.id === commandId);
    if (command) {
      command.action();
      onOpenChange(false);
    }
  }, [allCommands, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." className="px-5" data-testid="command-input" />
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
});

export default CommandPalette;
