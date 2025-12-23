import React, { useEffect, useState, useMemo, Suspense, lazy, useCallback } from "react";
import { Plus, Filter, Play, Pause, Trash2, Edit, Eye, Loader2, Search, X, Grid, List, Upload, RefreshCw, FileText, ExternalLink } from "lucide-react";

// 🚀 Lazy load heavy form components
const AddSourceForm = lazy(() => import("@/components/forms/AddSourceForm"));
const CrawlSourceTable = lazy(() => import("@/components/features/documents/CrawlSourceTable"));
const CrawlJobs = lazy(() => import("@/components/features/documents/CrawlJobs"));
const UploadDocumentForm = lazy(() => import("@/components/forms/UploadDocumentForm"));
const EditDocumentForm = lazy(() => import("@/components/forms/EditDocumentForm"));
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCrawlSites, useCrawlOperations, useCrawlStats } from "@/hooks/useCrawl";
import { CrawlSiteData, documentAPI, Document, DocumentMetadata } from "@/services/api/api";

export default function Crawl() {
  // Main tab state (Domain or Document)
  const [mainTab, setMainTab] = useState("domain");
  
  // ==================== DOMAIN TAB STATE (Crawl) ====================
  const [activeTab, setActiveTab] = useState("sources");
  const [showAddSourceForm, setShowAddSourceForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [editingSite, setEditingSite] = useState<string | null>(null);

  // Search and filter states for Domain
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cadenceFilter, setCadenceFilter] = useState("all");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  // ==================== DOCUMENT TAB STATE ====================
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all-sources");
  const [typeFilter, setTypeFilter] = useState("all-types");
  const [docStatusFilter, setDocStatusFilter] = useState("all-status");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const { t } = useTranslation();

  // ==================== DOMAIN TAB HOOKS (Crawl) ====================
  const {
    sites,
    isLoading: sitesLoading,
    isRefetching: sitesRefetching,
    isFetching: sitesFetching,
    error: sitesError,
    addSite,
    addSiteAsync,
    updateSite,
    updateSiteAsync,
    deleteSite,
    deleteSiteAsync,
    isAdding,
    isUpdating,
    isDeleting: isDeletingSite,
  } = useCrawlSites();

  useEffect(() => {
    console.log('🔍 Crawl Page - Sites data:', {
      sites,
      sitesType: typeof sites,
      isArray: Array.isArray(sites),
      length: Array.isArray(sites) ? sites.length : 'N/A',
      isLoading: sitesLoading,
      error: sitesError
    });
  }, [sites, sitesLoading, sitesError]);

  const {
    startCrawl,
    isStarting,
    getCrawlStatus,
  } = useCrawlOperations();

  const {
    stats,
    isLoading: statsLoading,
  } = useCrawlStats();

  // ==================== DOCUMENT TAB FUNCTIONS ====================
  const loadDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(false);
      console.log('📄 Loading documents from API...');
      const docs = await documentAPI.getDocuments();
      console.log('📄 Documents loaded:', docs);
      const sortedDocs = Array.isArray(docs) ? [...docs].sort((a, b) => {
        const dateA = new Date(a.lastIndexed).getTime();
        const dateB = new Date(b.lastIndexed).getTime();
        return dateB - dateA;
      }) : docs;
      setDocuments(sortedDocs);
    } catch (error) {
      console.error('❌ Failed to load documents:', error);
      setDocumentsError(true);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (mainTab === "document") {
      loadDocuments();
    }
  }, [mainTab, loadDocuments]);

  const handleDeleteDocument = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      await documentAPI.deleteDocument(id);
      await loadDocuments();
      toast({
        title: "Document Deleted",
        description: "Document has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [loadDocuments, toast]);

  const handleUploadDocument = async (data: any) => {
    try {
      await loadDocuments();
      toast({
        title: "Documents Uploaded",
        description: `Successfully uploaded document(s)`,
      });
    } catch (error) {
      console.error('Failed to refresh documents:', error);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDoc(doc);
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDoc(doc);
    setShowEditForm(true);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('indexed')) {
      return "default";
    } else if (statusLower.includes('processing')) {
      return "secondary";
    } else if (statusLower.includes('error') || statusLower.includes('failed')) {
      return "destructive";
    } else if (statusLower.includes('pending')) {
      return "outline";
    } else {
      return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('pdf')) {
      return "destructive";
    } else if (typeLower.includes('doc') || typeLower.includes('docx')) {
      return "default";
    } else if (typeLower.includes('xls') || typeLower.includes('xlsx')) {
      return "secondary";
    } else if (typeLower.includes('ppt') || typeLower.includes('pptx')) {
      return "outline";
    } else if (typeLower.includes('html') || typeLower.includes('htm')) {
      return "default";
    } else if (typeLower.includes('txt') || typeLower.includes('text')) {
      return "outline";
    } else if (typeLower.includes('image') || typeLower.includes('jpg') || typeLower.includes('png') || typeLower.includes('gif')) {
      return "secondary";
    } else if (typeLower.includes('zip') || typeLower.includes('rar') || typeLower.includes('7z')) {
      return "outline";
    } else {
      return "outline";
    }
  };

  const handleBulkDelete = useCallback(async () => {
    if (selectedDocs.length === 0) return;
    const count = selectedDocs.length;
    const idsToDelete = [...selectedDocs];
    try {
      setIsDeleting(true);
      const deletePromises = idsToDelete.map(id => documentAPI.deleteDocument(id));
      await Promise.all(deletePromises);
      await loadDocuments();
      setSelectedDocs([]);
      toast({
        title: "Documents Deleted",
        description: `Successfully deleted ${count} document${count > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete some documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedDocs, loadDocuments, toast]);

  const handleBulkReindex = useCallback(async () => {
    if (selectedDocs.length === 0) return;
    const count = selectedDocs.length;
    try {
      toast({
        title: "Re-indexing Started",
        description: `Re-indexing ${count} document${count > 1 ? 's' : ''}. This feature may need backend API support.`,
      });
      setSelectedDocs([]);
    } catch (error) {
      console.error('❌ Bulk re-index failed:', error);
      toast({
        title: "Error",
        description: "Failed to re-index documents. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedDocs, toast]);

  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    if (docSearchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
        doc.source.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
        doc.type?.toLowerCase().includes(docSearchQuery.toLowerCase())
      );
    }
    if (sourceFilter !== "all-sources") {
      filtered = filtered.filter(doc => {
        const docSource = doc.source?.toLowerCase() || "";
        switch (sourceFilter) {
          case "docs":
            return docSource.includes("docs.company.com") || docSource.includes("docs");
          case "api":
            return docSource.includes("api.company.com") || docSource.includes("api");
          case "help":
            return docSource.includes("help.company.com") || docSource.includes("help");
          default:
            return true;
        }
      });
    }
    if (typeFilter !== "all-types") {
      filtered = filtered.filter(doc => {
        const docType = doc.type?.toLowerCase() || "";
        switch (typeFilter) {
          case "pdf":
            return docType.includes("pdf");
          case "doc":
            return docType.includes("doc") || docType.includes("docx");
          case "html":
            return docType.includes("html") || docType.includes("htm");
          case "txt":
            return docType.includes("txt") || docType.includes("text");
          default:
            return true;
        }
      });
    }
    if (docStatusFilter !== "all-status") {
      filtered = filtered.filter(doc => {
        const docStatus = doc.status?.toLowerCase() || "";
        switch (docStatusFilter) {
          case "indexed":
            return docStatus.includes("indexed") || docStatus === "ready";
          case "processing":
            return docStatus.includes("processing") || docStatus === "pending";
          case "error":
            return docStatus.includes("error") || docStatus.includes("failed");
          default:
            return true;
        }
      });
    }
    return filtered;
  }, [documents, docSearchQuery, sourceFilter, typeFilter, docStatusFilter]);

  // ==================== DOMAIN TAB FUNCTIONS (Crawl) ====================
  const filteredSites = useMemo(() => {
    const list = Array.isArray(sites) ? sites : [];
    return list.filter(site => {
      if (!site || !site.id) return false;
      const matchesSearch =
        searchQuery === "" ||
        site.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        site.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesCadence =
        cadenceFilter === "all" ||
        site.cadence?.toLowerCase() === cadenceFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesCadence;
    });
  }, [sites, searchQuery, statusFilter, cadenceFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCadenceFilter("all");
    setJobStatusFilter("all");
    setDateFilter("today");
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || cadenceFilter !== "all" || jobStatusFilter !== "all" || dateFilter !== "today";

  const handleAddSite = async (siteData: CrawlSiteData) => {
    try {
      await addSiteAsync(siteData);
      toast({
        title: "Site Added",
        description: `Successfully added ${siteData.name}`,
      });
      setShowAddSourceForm(false);
    } catch (error: any) {
      console.error('❌ Add site error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add site. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSite = async (id: string, siteData: CrawlSiteData) => {
    try {
      await updateSiteAsync({ id, siteData });
      toast({
        title: "Site Updated",
        description: "Site configuration updated successfully",
      });
      setEditingSite(null);
    } catch (error: any) {
      console.error('❌ Update site error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update site. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSite = async (id: string) => {
    try {
      await deleteSiteAsync(id);
      toast({
        title: "Site Deleted",
        description: "Site removed successfully",
      });
    } catch (error: any) {
      console.error('❌ Delete site error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete site. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartCrawl = async (id: string) => {
    try {
      await startCrawl(id);
      toast({
        title: "Crawl Started",
        description: "Crawling job has been initiated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start crawl. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCrawlStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "running":
      case "crawling":
        return "secondary";
      case "failed":
      case "error":
        return "destructive";
      case "active":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="relative">
      <div className="relative z-10 space-y-6 w-full max-w-full overflow-hidden min-w-0 p-0 sm:p-6" style={{ maxWidth: '92vw' }}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('crawl.title')}</h1>
            <p className="text-muted-foreground">
              {t('crawl.description')}
            </p>
          </div>
        </div>

        {/* Main Tabs: Domain and Document */}
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="mb-3">
            <TabsTrigger value="domain" data-testid="tab-domain">Domain</TabsTrigger>
            <TabsTrigger value="document" data-testid="tab-document">Document</TabsTrigger>
          </TabsList>

          {/* ==================== DOMAIN TAB CONTENT ==================== */}
          <TabsContent value="domain" className="space-y-6 w-full overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Domain</h2>
                <p className="text-muted-foreground">
                  Manage crawl sources and jobs
                </p>
              </div>
              <div className="relative">
                <Button
                  onClick={() => setShowAddSourceForm(true)}
                  data-testid="button-add-source"
                  className="group"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="sources" data-testid="tab-sources">Sources</TabsTrigger>
                <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs</TabsTrigger>
              </TabsList>

              <TabsContent value="sources" className="space-y-4 w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-4 mt-3 lg:mt-0">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search sources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-sources"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40" data-testid="select-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={cadenceFilter} onValueChange={setCadenceFilter}>
                    <SelectTrigger className="w-40" data-testid="select-cadence-filter">
                      <SelectValue placeholder="Cadence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cadence</SelectItem>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                      data-testid="button-clear-filters"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
                  <CrawlSourceTable
                    sites={filteredSites}
                    isLoading={sitesLoading}
                    isRefetching={sitesRefetching}
                    isFetching={sitesFetching}
                    onEdit={setEditingSite}
                    onDelete={handleDeleteSite}
                    onStartCrawl={handleStartCrawl}
                    isStarting={isStarting}
                    isDeleting={isDeletingSite}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-4 w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
                  <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40" data-testid="select-job-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  {jobStatusFilter !== "all" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setJobStatusFilter("all");
                      }}
                      className="flex items-center gap-2 w-full sm:w-auto"
                      data-testid="button-clear-job-filters"
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
                <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
                  <CrawlJobs
                    sites={sites || []}
                    statusFilter={jobStatusFilter}
                  />
                </Suspense>
              </TabsContent>
            </Tabs>

            {/* Add Source Form */}
            <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
              <AddSourceForm
                open={showAddSourceForm}
                onOpenChange={setShowAddSourceForm}
                onSubmit={handleAddSite}
              />
            </Suspense>

            {/* Edit Source Form */}
            {editingSite && (
              <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
                <AddSourceForm
                  open={!!editingSite}
                  onOpenChange={(open) => {
                    if (!open) setEditingSite(null);
                  }}
                  onSubmit={(data) => handleUpdateSite(editingSite, data)}
                  editData={sites && Array.isArray(sites) ? (sites.find((s: any) => s?.id === editingSite) as any) : undefined}
                />
              </Suspense>
            )}
          </TabsContent>

          {/* ==================== DOCUMENT TAB CONTENT ==================== */}
          <TabsContent value="document" className="space-y-6 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-0 md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
                <p className="text-muted-foreground">
                  Manage your indexed documents and content
                </p>
              </div>
              <div className="relative">
                <Button
                  onClick={() => setShowUploadForm(true)}
                  data-testid="button-upload-document"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t('documents.upload')}
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-0 md:items-center md:justify-between">
              <div className="flex items-center flex-wrap gap-4">
                <div className="relative">
                  <Search className="absolute -translate-y-[50%] top-[50%] left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="input-search-documents"
                  />
                </div>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-40" data-testid="select-source-filter">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-sources">All Sources</SelectItem>
                    <SelectItem value="docs">docs.company.com</SelectItem>
                    <SelectItem value="api">api.company.com</SelectItem>
                    <SelectItem value="help">help.company.com</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32" data-testid="select-type-filter">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="txt">TXT</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={docStatusFilter} onValueChange={setDocStatusFilter}>
                  <SelectTrigger className="w-32" data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-status">All Status</SelectItem>
                    <SelectItem value="indexed">Indexed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" data-testid="button-advanced-filters">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    data-testid="button-grid-view"
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    data-testid="button-list-view"
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedDocs.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-sidebar-accent" style={{ borderRadius: '2px' }}>
                <span className="text-sm font-medium">
                  {selectedDocs.length} document{selectedDocs.length > 1 ? "s" : ""} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkReindex}
                  disabled={isDeleting}
                  data-testid="button-bulk-reindex"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-index
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  data-testid="button-bulk-delete"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}

            {/* Loading State */}
            {documentsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading documents...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {documentsError && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-destructive mb-2">Failed to load documents</p>
                  <Button onClick={() => loadDocuments()} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!documentsLoading && !documentsError && filteredDocuments.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {docSearchQuery ? 'No documents found matching your search' : 'No documents found'}
                  </p>
                  {!docSearchQuery && (
                    <div className="relative">
                      <Button onClick={() => setShowUploadForm(true)} className="group">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Grid/List */}
            {filteredDocuments.length > 0 && (
              <>
                {viewMode === "grid" ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDocuments.map((doc) => (
                      <GlassCard
                        key={doc.id}
                        className="cursor-pointer hover-elevate"
                        onClick={() => handleViewDocument(doc)}
                        data-testid={`card-document-${doc.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedDocs.includes(doc.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedDocs(prev => [...prev, doc.id]);
                                  } else {
                                    setSelectedDocs(prev => prev.filter(id => id !== doc.id));
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`checkbox-${doc.id}`}
                              />
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant={getTypeColor(doc.type)} className="text-xs">
                                {doc.type}
                              </Badge>
                              <Badge variant={getStatusColor(doc.status)} className="text-xs">
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-base line-clamp-2">{doc.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Type: {doc.type}</p>
                            <p>Size: {doc.size}</p>
                            <p>Source: {doc.source}</p>
                            <p>Language: {doc.language}</p>
                            <p>Indexed: {new Date(doc.lastIndexed).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDocument(doc);
                              }}
                              data-testid={`button-view-${doc.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDocument(doc);
                              }}
                              data-testid={`button-edit-${doc.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc.id);
                              }}
                              disabled={isDeleting}
                              data-testid={`button-delete-${doc.id}`}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </GlassCard>
                    ))}
                  </div>
                ) : (
                  <GlassCard>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {filteredDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 hover-elevate cursor-pointer"
                            onClick={() => setSelectedDoc(doc)}
                            data-testid={`row-document-${doc.id}`}
                          >
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={selectedDocs.includes(doc.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedDocs(prev => [...prev, doc.id]);
                                  } else {
                                    setSelectedDocs(prev => prev.filter(id => id !== doc.id));
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`checkbox-${doc.id}`}
                              />
                              <FileText className="h-4 w-4 hidden md:block text-muted-foreground" />
                              <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-sm text-muted-foreground">{doc.source}</p>
                              </div>
                            </div>
                            <div className="flex flex-col md:flex-row  md:items-center gap-4 text-sm">
                              <div className="text-right">
                                <p>{doc.chunks} chunks</p>
                                <p className="text-muted-foreground">{doc.size}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant={getTypeColor(doc.type)} className="text-xs">
                                  {doc.type}
                                </Badge>
                                <Badge variant={getStatusColor(doc.status)} className="text-xs">
                                  {doc.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </GlassCard>
                )}
              </>
            )}

            {/* Document Detail Sheet */}
            <Sheet open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
              <SheetContent className="w-96 overflow-y-auto">
                {selectedDoc && (
                  <>
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Document Details
                      </SheetTitle>
                      <SheetDescription>
                        View document metadata and processing information
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">{selectedDoc.title}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant={getTypeColor(selectedDoc.type)} className="text-xs">
                            {selectedDoc.type}
                          </Badge>
                          <Badge variant={getStatusColor(selectedDoc.status)} className="text-xs">
                            {selectedDoc.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Source URL</label>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm break-all">{selectedDoc.url}</p>
                            <Button variant="ghost" size="sm" data-testid="button-open-source">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Source Domain</label>
                          <p className="text-sm mt-1">{selectedDoc.source}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Language</label>
                          <p className="text-sm mt-1">{selectedDoc.language}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">File Size</label>
                          <p className="text-sm mt-1">{selectedDoc.size}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Checksum</label>
                          <p className="text-sm mt-1 font-mono">{selectedDoc.checksum}</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Chunks</label>
                          <p className="text-sm mt-1">{selectedDoc.chunks} text chunks created</p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Last Indexed</label>
                          <p className="text-sm mt-1">{selectedDoc.lastIndexed.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid="button-reindex-document"
                          onClick={() => {
                            toast({
                              title: "Re-indexing Started",
                              description: `Re-indexing ${selectedDoc.title}`,
                            });
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Re-index
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          data-testid="button-delete-document"
                          disabled={isDeleting}
                          onClick={async () => {
                            await handleDeleteDocument(selectedDoc.id);
                            setSelectedDoc(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            {/* Upload Document Form */}
            <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
              <UploadDocumentForm
                open={showUploadForm}
                onOpenChange={setShowUploadForm}
                onSubmit={handleUploadDocument}
              />
            </Suspense>

            {/* Edit Document Form */}
            {editingDoc && (
              <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
                <EditDocumentForm
                  open={showEditForm}
                  onOpenChange={(open) => {
                    setShowEditForm(open);
                    if (!open) setEditingDoc(null);
                  }}
                  documentId={editingDoc.id}
                  initialMetadata={{
                    title: editingDoc.title,
                    description: editingDoc.description,
                    language: editingDoc.language,
                    source: editingDoc.source,
                    isPublic: (editingDoc as any).isPublic ?? false,
                    priority: (editingDoc as any).priority ?? "medium",
                    tags: (editingDoc as any).tags ?? [],
                  } as DocumentMetadata}
                  onSubmit={async () => {
                    await loadDocuments();
                    toast({
                      title: "Document Updated",
                      description: "Changes saved successfully",
                    });
                  }}
                />
              </Suspense>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
