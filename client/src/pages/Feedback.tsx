import { useState } from "react";
import { Filter, ExternalLink, Copy, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/contexts/I18nContext";
import { PointerTypes } from "@/components/ui/AnimatedPointer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import ResponsiveDarkVeil from "@/components/ui/ResponsiveDarkVeil";
import GlassGlassCard from "@/components/ui/GlassGlassCard";

const feedbackData = [
  {
    id: "fb-001",
    query: "How to configure SSL certificates for my domain?",
    excerpt: "To configure SSL certificates for your domain, you'll need to follow these steps...",
    vote: "up",
    reasons: ["helpful", "accurate"],
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    sessionId: "sess-abc123",
    fullAnswer: "To configure SSL certificates for your domain, you'll need to follow these steps:\n\n1. **Generate a Certificate**: You can use Let's Encrypt for free SSL certificates\n2. **Configure your web server**: Update your Nginx or Apache configuration\n3. **Set up automatic renewal**: Ensure certificates renew before expiry\n\nThe process varies depending on your hosting provider and web server configuration.",
    citations: [
      { title: "SSL Setup Guide", url: "https://docs.example.com/ssl" },
      { title: "Let's Encrypt Tutorial", url: "https://docs.example.com/letsencrypt" }
    ],
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    ipAddress: "192.168.1.100",
  },
  {
    id: "fb-002",
    query: "API rate limits documentation",
    excerpt: "Our API implements rate limiting to ensure fair usage across all clients...",
    vote: "down",
    reasons: ["outdated", "missing sources"],
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    sessionId: "sess-def456",
    fullAnswer: "Our API implements rate limiting to ensure fair usage across all clients. The current limits are:\n\n- Free tier: 100 requests per hour\n- Pro tier: 1000 requests per hour\n- Enterprise: Custom limits\n\nNote: These limits may be subject to change.",
    citations: [
      { title: "API Documentation", url: "https://api.example.com/docs" }
    ],
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
    ipAddress: "10.0.0.45",
  },
  {
    id: "fb-003",
    query: "Database backup procedures",
    excerpt: "Regular database backups are crucial for data protection. Here's our recommended approach...",
    vote: "up",
    reasons: ["complete", "clear"],
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    sessionId: "sess-ghi789",
    fullAnswer: "Regular database backups are crucial for data protection. Here's our recommended approach:\n\n1. **Automated daily backups**: Set up cron jobs for daily database dumps\n2. **Off-site storage**: Store backups in a separate location\n3. **Test restores regularly**: Verify backup integrity monthly\n4. **Document the process**: Keep detailed restore procedures\n\nFor PostgreSQL, use pg_dump for logical backups and pg_basebackup for physical backups.",
    citations: [
      { title: "Backup Best Practices", url: "https://docs.example.com/backup" },
      { title: "PostgreSQL Backup Guide", url: "https://docs.example.com/postgres-backup" }
    ],
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    ipAddress: "172.16.0.12",
  },
  {
    id: "fb-004",
    query: "Performance optimization for large datasets",
    excerpt: "When working with large datasets, consider these optimization strategies...",
    vote: "down",
    reasons: ["not helpful", "too technical"],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    sessionId: "sess-jkl012",
    fullAnswer: "When working with large datasets, consider these optimization strategies:\n\n1. **Indexing**: Create appropriate database indexes\n2. **Pagination**: Implement cursor-based pagination\n3. **Caching**: Use Redis for frequently accessed data\n4. **Query optimization**: Analyze and optimize slow queries\n\nProfile your application to identify bottlenecks.",
    citations: [
      { title: "Performance Guide", url: "https://docs.example.com/performance" }
    ],
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124",
    ipAddress: "203.0.113.15",
  },
];

export default function Feedback() {
  const [selectedFeedback, setSelectedFeedback] = useState<typeof feedbackData[0] | null>(null);
  const [timeRange, setTimeRange] = useState("all");
  const [voteFilter, setVoteFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const { t } = useTranslation();

  const getVoteIcon = (vote: string) => {
    return vote === "up" ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />;
  };

  const getVoteColor = (vote: string) => {
    return vote === "up" ? "default" : "destructive";
  };

  const filteredFeedback = feedbackData.filter(item => {
    if (voteFilter !== "all" && item.vote !== voteFilter) return false;
    if (reasonFilter !== "all" && !item.reasons.includes(reasonFilter)) return false;
    return true;
  });

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Copied to clipboard
  };

  return (
    <div className="relative min-h-screen">
      {/* Theme-aware Background */}
      <div className="fixed inset-0 -z-10">
        <ResponsiveDarkVeil 
          className="w-full h-full"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 space-y-6 w-full max-w-full overflow-hidden min-w-0 p-6" style={{ maxWidth: '92vw' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('feedback.title')}</h1>
          <p className="text-muted-foreground">
            {t('feedback.description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40" data-testid="select-time-range">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <PointerTypes.Time className="absolute inset-0" />
            </div>

            <div className="relative">
              <Select value={voteFilter} onValueChange={setVoteFilter}>
                <SelectTrigger className="w-32" data-testid="select-vote-filter">
                  <SelectValue placeholder="Vote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Votes</SelectItem>
                  <SelectItem value="up">👍 Positive</SelectItem>
                  <SelectItem value="down">👎 Negative</SelectItem>
                </SelectContent>
              </Select>
              <PointerTypes.Favorite className="absolute inset-0" />
            </div>

            <div className="relative">
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-40" data-testid="select-reason-filter">
                  <SelectValue placeholder="Reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="helpful">Helpful</SelectItem>
                  <SelectItem value="accurate">Accurate</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="not helpful">Not Helpful</SelectItem>
                  <SelectItem value="outdated">Outdated</SelectItem>
                  <SelectItem value="missing sources">Missing Sources</SelectItem>
                  <SelectItem value="too technical">Too Technical</SelectItem>
                </SelectContent>
              </Select>
              <PointerTypes.Filter className="absolute inset-0" />
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Feedback Table */}
      <GlassCard className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback ({filteredFeedback.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-w-full" style={{ maxWidth: '100%' }}>
            <Table className="min-w-[800px] w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Query</TableHead>
                <TableHead className="w-[15%]">Vote</TableHead>
                <TableHead className="w-[20%]">Reasons</TableHead>
                <TableHead className="w-[15%]">Time</TableHead>
                <TableHead className="w-[20%]">Session</TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.map((feedback) => (
                <TableRow
                  key={feedback.id}
                  className="cursor-pointer hover-elevate"
                  onClick={() => setSelectedFeedback(feedback)}
                  data-testid={`row-feedback-${feedback.id}`}
                >
                  <TableCell className="w-[25%]">
                    <div>
                      <p className="font-medium line-clamp-1">{feedback.query}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {feedback.excerpt}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="w-[15%]">
                    <Badge variant={getVoteColor(feedback.vote)} className="flex items-center gap-1 w-fit">
                      {getVoteIcon(feedback.vote)}
                      {feedback.vote}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <div className="flex flex-wrap gap-1">
                      {feedback.reasons.map((reason, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="w-[15%] text-sm text-muted-foreground">
                    {new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                      Math.floor((feedback.createdAt.getTime() - Date.now()) / (1000 * 60)),
                      "minute"
                    )}
                  </TableCell>
                  <TableCell className="w-[20%] text-sm text-muted-foreground font-mono">
                    {feedback.sessionId}
                  </TableCell>
                  <TableCell className="w-[5%]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("View session:", feedback.sessionId);
                      }}
                      data-testid={`button-view-session-${feedback.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </GlassCard>

      {/* Feedback Detail Sheet */}
      <Sheet open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <SheetContent className="w-[600px] max-w-[90vw] overflow-y-auto">
          {selectedFeedback && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Feedback Details
                </SheetTitle>
                <SheetDescription>
                  Full conversation and feedback analysis
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Query */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Query</label>
                  <div className="mt-2 p-3 bg-secondary rounded-lg">
                    <p className="text-sm">{selectedFeedback.query}</p>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleCopyToClipboard(selectedFeedback.query)}
                      data-testid="button-copy-query"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Query
                    </Button>
                    <PointerTypes.Copy className="absolute inset-0" />
                  </div>
                </div>

                {/* Answer */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">AI Response</label>
                  <div className="mt-2 p-3 bg-card border rounded-lg">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-sm">{selectedFeedback.fullAnswer}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleCopyToClipboard(selectedFeedback.fullAnswer)}
                      data-testid="button-copy-answer"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Answer
                    </Button>
                    <PointerTypes.Copy className="absolute inset-0" />
                  </div>
                </div>

                {/* Citations */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sources Used</label>
                  <div className="mt-2 space-y-2">
                    {selectedFeedback.citations.map((citation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-lg hover-elevate"
                      >
                        <span className="text-sm">{citation.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log("Open:", citation.url)}
                          data-testid={`button-open-citation-${index}`}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Feedback</label>
                  <div className="mt-2 flex items-center gap-4">
                    <Badge variant={getVoteColor(selectedFeedback.vote)} className="flex items-center gap-1">
                      {getVoteIcon(selectedFeedback.vote)}
                      {selectedFeedback.vote === "up" ? "Positive" : "Negative"}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {selectedFeedback.reasons.map((reason, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                    <p className="text-sm font-mono mt-1">{selectedFeedback.sessionId}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                    <p className="text-sm mt-1">{selectedFeedback.createdAt.toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                    <p className="text-xs mt-1 break-all">{selectedFeedback.userAgent}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                    <p className="text-sm font-mono mt-1">{selectedFeedback.ipAddress}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(JSON.stringify(selectedFeedback, null, 2))}
                    data-testid="button-copy-all"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log("View full session:", selectedFeedback.sessionId)}
                    data-testid="button-view-full-session"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Session
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      </div>
    </div>
  );
}
