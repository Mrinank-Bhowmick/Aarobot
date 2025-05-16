"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  summarizeClinicalReport,
  SummarizeClinicalReportOutput,
} from "@/ai/flows/summarize-clinical-report";
import { FileText, Loader2, AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ReportSummary extends SummarizeClinicalReportOutput {
  fileName: string;
  uploadDate: Date;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [summary, setSummary] = React.useState<ReportSummary | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setSummary(null);
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSummarize = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a clinical report file to summarize.",
        variant: "destructive",
      });
      return;
    }

    setIsSummarizing(true);
    setSummary(null);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const reportDataUri = reader.result as string;
        if (!reportDataUri) {
          throw new Error("Failed to read file as data URI.");
        }

        if (
          !reportDataUri.startsWith("data:") ||
          !reportDataUri.includes(";base64,")
        ) {
          throw new Error(
            "Invalid file format. Only files readable as Base64 data URIs are supported."
          );
        }

        const result = await summarizeClinicalReport({ reportDataUri });

        setSummary({
          ...result,
          fileName: selectedFile.name,
          uploadDate: new Date(),
        });

        toast({
          title: "Summarization Complete",
          description: `Summary generated for ${selectedFile.name}.`,
        });
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        throw new Error("Failed to read the selected file.");
      };
    } catch (err: unknown) {
      console.error("Summarization failed:", err);
      let errorMessage = "An unexpected error occurred during summarization.";
      if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
        errorMessage = (err as { message: string }).message;
      }
      setError(errorMessage);
      toast({
        title: "Summarization Failed",
        description:
          errorMessage ||
          "Could not summarize the report. Please check the file or try again.",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" /> Clinical Report
              Summarization
            </CardTitle>
            <CardDescription>
              Upload a clinical report (PDF, text, image) to get an AI-powered
              summary in plain language.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Input
                id="report-file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="flex-grow"
                accept=".pdf,.txt,.jpg,.jpeg,.png"
              />
              <Button
                onClick={handleSummarize}
                disabled={isSummarizing || !selectedFile}
                className="w-full sm:w-auto"
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  "Summarize Report"
                )}
              </Button>
            </div>
            {selectedFile && !isSummarizing && !summary && !error && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}. Click `Summarize Report`.
              </p>
            )}
          </CardContent>
        </Card>

        {isSummarizing && (
          <Card className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Generating summary...</p>
          </Card>
        )}

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Error Summarizing Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">{error}</p>
              <p className="text-sm text-destructive/80 mt-2">
                Please ensure the file is a valid clinical report and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {summary && !isSummarizing && (
          <Card className="shadow-lg animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle>Summary for: {summary.fileName}</CardTitle>
              <CardDescription>
                Generated on: {summary.uploadDate.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion
                type="single"
                collapsible
                defaultValue="item-1"
                className="w-full"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium">
                    Plain Language Summary
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none text-foreground/90 pt-2">
                    {summary.summary || "No summary provided."}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-medium">
                    Diagnoses
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 space-y-2">
                    {summary.diagnoses && summary.diagnoses.length > 0 ? (
                      summary.diagnoses.map((diag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="mr-2 mb-2"
                        >
                          {diag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No diagnoses extracted.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-medium">
                    Medications
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 space-y-2">
                    {summary.medications && summary.medications.length > 0 ? (
                      summary.medications.map((med, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="mr-2 mb-2"
                        >
                          {med}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No medications extracted.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg font-medium">
                    Next Steps
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none text-foreground/90 pt-2">
                    {summary.nextSteps || "No next steps provided."}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator className="my-6" />

              <div className="mt-4 text-xs text-muted-foreground">
                <p>
                  <strong>Disclaimer:</strong> This summary is generated by AI
                  and should not replace professional medical advice. Always
                  consult with your healthcare provider regarding your health
                  and treatment.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Previous Summaries</CardTitle>
            <CardDescription>
              Access your past report summaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground"></CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
