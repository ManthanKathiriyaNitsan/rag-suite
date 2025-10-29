import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { Bell, Filter, ExternalLink, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { safeStringConversion } from "@/utils/safeStringConversion";

interface Notification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

// todo: remove mock functionality
const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "success",
    title: "Crawl Job Completed",
    message: "Successfully crawled 142 pages from docs.company.com",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionUrl: "/crawl",
    actionText: "View Results",
    metadata: { crawlId: "crawl-123", pages: 142, duration: "3m 42s" },
  },
  {
    id: "notif-002",
    type: "warning",
    title: "API Key Expiring Soon",
    message: "Your Production API Key will expire in 7 days",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionUrl: "/settings",
    actionText: "Renew Key",
    metadata: { keyName: "Production API Key", expiryDate: "2024-02-01" },
  },
  {
    id: "notif-003",
    type: "error",
    title: "Webhook Delivery Failed",
    message: "Failed to deliver webhook to https://api.yourapp.com/webhooks",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/settings",
    actionText: "Check Webhook",
    metadata: { webhookUrl: "https://api.yourapp.com/webhooks", retries: 3 },
  },
  {
    id: "notif-004",
    type: "info",
    title: "System Maintenance Scheduled",
    message: "Scheduled maintenance on Jan 15, 2024 from 2:00-4:00 AM UTC",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    metadata: { maintenanceStart: "2024-01-15T02:00:00Z", maintenanceEnd: "2024-01-15T04:00:00Z" },
  },
  {
    id: "notif-005",
    type: "success",
    title: "Integration Published",
    message: "Your API integration v2.1 has been successfully published",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/integrations",
    actionText: "View Integration",
    metadata: { integrationId: "int-456", version: "v2.1" },
  },
];

interface NotificationInboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationInbox = React.memo(function NotificationInbox({ open, onOpenChange }: NotificationInboxProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");

  const getIcon = useCallback((type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  }, []);

  const getBadgeVariant = useCallback((type: string) => {
    switch (type) {
      case "success":
        return "default";
      case "warning":
        return "secondary";
      case "error":
        return "destructive";
      case "info":
      default:
        return "outline";
    }
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (typeFilter !== "all" && notification.type !== typeFilter) return false;
      if (readFilter === "unread" && notification.read) return false;
      if (readFilter === "read" && !notification.read) return false;
      return true;
    });
  }, [notifications, typeFilter, readFilter]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handleActionClick = (notification: Notification) => {
    if (notification.actionUrl) {
      // Navigate to action URL
      onOpenChange(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto ">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              System alerts, updates, and important notifications
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="flex-1" data-testid="select-type-filter">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="flex-1" data-testid="select-read-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full"
                data-testid="button-mark-all-read"
              >
                Mark All as Read
              </Button>
            )}

            {/* Notifications List */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer hover-elevate transition-colors ${
                    !notification.read ? "border-primary/50 bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-${notification.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                              Math.floor((notification.timestamp.getTime() - Date.now()) / (1000 * 60)),
                              "minute"
                            )}
                          </span>
                          <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                            {notification.type}
                          </Badge>
                        </div>
                        {notification.actionText && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(notification);
                            }}
                            data-testid={`button-action-${notification.id}`}
                          >
                            {notification.actionText}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications found</p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <Sheet
          open={!!selectedNotification}
          onOpenChange={() => setSelectedNotification(null)}
        >
          <SheetContent className="w-96">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {getIcon(selectedNotification.type)}
                {selectedNotification.title}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Badge variant={getBadgeVariant(selectedNotification.type)}>
                  {selectedNotification.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedNotification.timestamp.toLocaleString()}
                </span>
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Message</h4>
                <p className="text-sm text-muted-foreground">{selectedNotification.message}</p>
              </div>

              {selectedNotification.metadata && (
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <span className="font-mono">
                          {value === null || value === undefined 
                            ? 'N/A' 
                            : typeof value === 'object' 
                              ? JSON.stringify(value)
                              : safeStringConversion(value)
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNotification.actionUrl && (
                <Button
                  onClick={() => handleActionClick(selectedNotification)}
                  className="w-full  "
                  data-testid="button-detail-action"
                >
                  {selectedNotification.actionText}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
});

export default NotificationInbox;
