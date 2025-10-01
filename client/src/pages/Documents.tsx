import React, { useState } from "react";
import { Grid, List, Filter, Search, Upload, Trash2, RefreshCw, FileText, ExternalLink, Loader2, Eye, Edit } from "lucide-react";
import { UploadDocumentForm } from "@/components/forms/UploadDocumentForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
// 📄 Import API and types
import { documentAPI, Document, DocumentMetadata } from "@/lib/api";


export default function Documents() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { toast } = useToast();

  // 📄 Real API state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 📄 Load documents from API
  const loadDocuments = async () => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(false);
      console.log('📄 Loading documents from API...');
      const docs = await documentAPI.getDocuments();
      console.log('📄 Documents loaded:', docs);
      setDocuments(docs);
    } catch (error) {
      console.error('❌ Failed to load documents:', error);
      setDocumentsError(true);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // 📄 Load documents on component mount
  React.useEffect(() => {
    loadDocuments();
  }, []);


  // 📄 Simple stats
  const stats = {
    totalDocuments: documents.length,
    newThisWeek: 3,
    totalSize: "2.4 MB",
    avgChunks: 8
  };
  
  // 📄 Simple search
  const searchResults = searchQuery 
    ? documents.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.source.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // 📄 Document operation handlers
  const handleDeleteDocument = async (id: string) => {
    try {
      setIsDeleting(true);
      await documentAPI.deleteDocument(id);
      await loadDocuments(); // Reload documents after delete
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
  };

  // 📄 Handle document upload (just refresh the list, upload is handled in form)
  const handleUploadDocument = async (data: any) => {
    // The upload is already handled in the form component
    // Just refresh the documents list and show success message
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
    // TODO: Implement edit functionality
    toast({
      title: "Edit Document",
      description: "Edit functionality coming soon",
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('indexed')) {
      return "default"; // Green for indexed (ready to use)
    } else if (statusLower.includes('processing')) {
      return "secondary"; // Blue for processing
    } else if (statusLower.includes('error') || statusLower.includes('failed')) {
      return "destructive"; // Red for errors
    } else if (statusLower.includes('pending')) {
      return "outline"; // Gray for pending
    } else {
      return "outline"; // Default gray for unknown status
    }
  };

  const getTypeColor = (type: string) => {
    // Handle different file types with better colors
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes('pdf')) {
      return "destructive"; // Red for PDF
    } else if (typeLower.includes('doc') || typeLower.includes('docx')) {
      return "default"; // Blue for Word docs
    } else if (typeLower.includes('xls') || typeLower.includes('xlsx')) {
      return "secondary"; // Green for Excel
    } else if (typeLower.includes('ppt') || typeLower.includes('pptx')) {
      return "outline"; // Orange for PowerPoint
    } else if (typeLower.includes('html') || typeLower.includes('htm')) {
      return "default"; // Blue for HTML
    } else if (typeLower.includes('txt') || typeLower.includes('text')) {
      return "outline"; // Gray for text files
    } else if (typeLower.includes('image') || typeLower.includes('jpg') || typeLower.includes('png') || typeLower.includes('gif')) {
      return "secondary"; // Green for images
    } else if (typeLower.includes('zip') || typeLower.includes('rar') || typeLower.includes('7z')) {
      return "outline"; // Gray for archives
    } else {
      return "outline"; // Default gray for unknown types
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`${action} action for documents:`, selectedDocs);
    setSelectedDocs([]);
  };

  // 📄 Use search results or filter documents
  const filteredDocuments = searchQuery ? searchResults : documents;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-0 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Library</h1>
          <p className="text-muted-foreground">
            Manage your indexed documents and content
          </p>
        </div>
        <Button
          onClick={() => setShowUploadForm(true)}
          data-testid="button-upload-document"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-0 md:items-center md:justify-between">
        <div className="flex items-center flex-wrap gap-4">
          <div className="relative ">
            <Search className="absolute -translate-y-[50%] top-[50%] left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-documents"
            />
          </div>

          <Select defaultValue="all-sources">
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

          <Select defaultValue="all-types">
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

          <Select defaultValue="all-status">
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
        <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
          <span className="text-sm font-medium">
            {selectedDocs.length} document{selectedDocs.length > 1 ? "s" : ""} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleBulkAction("re-index");
              toast({
                title: "Re-indexing Started",
                description: `Re-indexing ${selectedDocs.length} documents`,
              });
            }}
            data-testid="button-bulk-reindex"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-index
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleBulkAction("delete");
              toast({
                title: "Documents Deleted",
                description: `Deleted ${selectedDocs.length} documents`,
                variant: "destructive",
              });
            }}
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
              {searchQuery ? 'No documents found matching your search' : 'No documents found'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowUploadForm(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
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
            <Card
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
            </Card>
          ))}
        </div>
      ) : (
        <Card>
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
        </Card>
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
                  <Button variant="outline" size="sm" data-testid="button-reindex-document">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-index
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-delete-document">
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
      <UploadDocumentForm
        open={showUploadForm}
        onOpenChange={setShowUploadForm}
        onSubmit={handleUploadDocument}
      />
    </div>
  );
}