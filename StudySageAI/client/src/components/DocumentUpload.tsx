import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Upload, FileText, File, Loader2, Sparkles, BookOpen, HelpCircle } from "lucide-react";
import type { Document } from "@shared/schema";

interface DocumentUploadProps {
  onUploadComplete?: (doc: Document) => void;
  isPremium?: boolean;
  dailyFlashcardsUsed?: number;
  dailyQuizzesUsed?: number;
}

export function DocumentUpload({ 
  onUploadComplete, 
  isPremium = false,
  dailyFlashcardsUsed = 0,
  dailyQuizzesUsed = 0
}: DocumentUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generating, setGenerating] = useState<"flashcards" | "quiz" | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }

        return response.json() as Promise<Document>;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Document uploaded!",
        description: "Your document is ready for AI processing.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      onUploadComplete?.(data);
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to upload documents.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async ({ documentId, type }: { documentId: number; type: "flashcards" | "quiz" }) => {
      setGenerating(type);
      const endpoint = type === "flashcards" 
        ? `/api/documents/${documentId}/generate-flashcards`
        : `/api/documents/${documentId}/generate-quiz`;
      return apiRequest("POST", endpoint);
    },
    onSuccess: (_, variables) => {
      const type = variables.type;
      toast({
        title: type === "flashcards" ? "Flashcards created!" : "Quiz created!",
        description: `Your ${type} are ready to study.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/flashcard-sets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setGenerating(null);
    },
    onError: (error: Error) => {
      setGenerating(null);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    disabled: uploadMutation.isPending,
  });

  const isUploading = uploadMutation.isPending;
  const uploadedDoc = uploadMutation.data;

  return (
    <Card data-testid="document-upload">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Study Material
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedDoc ? (
          <>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${isDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                }
                ${isUploading ? "pointer-events-none opacity-60" : ""}
              `}
              data-testid="dropzone"
            >
              <input {...getInputProps()} data-testid="input-file" />
              
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                  <p className="text-muted-foreground">Uploading document...</p>
                  <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                </div>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  
                  {isDragActive ? (
                    <p className="text-lg font-medium text-primary">Drop your file here!</p>
                  ) : (
                    <>
                      <p className="text-lg font-medium mb-2">
                        Drag & drop your study material
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                    </>
                  )}
                  
                  <div className="flex items-center justify-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">PDF</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <File className="h-4 w-4" />
                      <span className="text-xs">TXT</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">DOCX</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!isPremium && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Free tier: 10 flashcards & 5 quizzes per day</p>
                <p className="text-xs mt-1">
                  Used today: {dailyFlashcardsUsed}/10 flashcards, {dailyQuizzesUsed}/5 quizzes
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{uploadedDoc.title}</p>
                <p className="text-sm text-muted-foreground capitalize">{uploadedDoc.fileType} Document</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => generateMutation.mutate({ documentId: uploadedDoc.id, type: "flashcards" })}
                disabled={generating !== null}
                className="flex items-center gap-2"
                data-testid="button-generate-flashcards"
              >
                {generating === "flashcards" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Generate</span> Flashcards
              </Button>
              
              <Button
                onClick={() => generateMutation.mutate({ documentId: uploadedDoc.id, type: "quiz" })}
                disabled={generating !== null}
                variant="secondary"
                className="flex items-center gap-2"
                data-testid="button-generate-quiz"
              >
                {generating === "quiz" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <HelpCircle className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Generate</span> Quiz
              </Button>
            </div>

            {generating && (
              <div className="text-center py-4">
                <Sparkles className="h-8 w-8 mx-auto text-primary animate-pulse mb-2" />
                <p className="text-sm text-muted-foreground">
                  AI is creating your {generating}...
                </p>
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => uploadMutation.reset()}
              disabled={generating !== null}
              data-testid="button-upload-another"
            >
              Upload Another Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
