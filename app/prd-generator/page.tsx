'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/feature/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, FileText, Code } from 'lucide-react';

const PRD_GENERATOR_PROMPT = `You are an expert Product Requirements Document (PRD) writer with extensive experience in software development, product management, and technical documentation.

Your role is to create comprehensive, well-structured PRDs based on the user's product concept or requirements.

For each PRD, include these sections:

## Executive Summary
- Brief overview of the product and its purpose
- Key objectives and success metrics
- Target market and user segments

## Problem Statement
- Core problem being solved
- Current market gaps or pain points
- Business opportunity

## Product Goals & Objectives
- Primary objectives (SMART goals)
- Secondary objectives
- Success metrics and KPIs

## User Personas
- Primary and secondary user profiles
- User needs, behaviors, and pain points
- User stories and scenarios

## Functional Requirements
- Core features and capabilities
- User flows and interactions
- Technical specifications where relevant
- Performance requirements

## Non-Functional Requirements
- Security, privacy, and compliance
- Performance and scalability
- Accessibility requirements
- Reliability and uptime

## Technical Considerations
- Technology stack recommendations
- Integration requirements
- Data architecture considerations
- API specifications if applicable

## Project Scope & Timeline
- MVP (Minimum Viable Product) definition
- Phase 1, Phase 2, Phase 3 features
- Estimated development timeline
- Resource requirements

## Success Metrics
- Key performance indicators
- User engagement metrics
- Business impact metrics
- Technical performance metrics

## Risks & Mitigation
- Technical risks
- Business risks
- Market risks
- Mitigation strategies

Your responses should be:
- Professional and comprehensive
- Well-structured with clear headings
- Actionable and specific
- Industry best practices focused
- Tailored to the user's specific product domain

Current product concept: [User will provide their product details]`;

// Download functions
const downloadAsMarkdown = (content: string, filename: string = 'PRD.md') => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const downloadAsPDF = async (content: string, filename: string = 'PRD.pdf') => {
  try {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    const html2canvasImport = await import('html2canvas');
    const html2canvas = html2canvasImport.default;

    // Create a temporary div with markdown content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.padding = '20mm';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.innerHTML = content.replace(/\n/g, '<br>');
    document.body.appendChild(tempDiv);

    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);

    // Clean up
    document.body.removeChild(tempDiv);
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF. Please try downloading as Markdown instead.');
  }
};

export default function PRDGeneratorPage() {
  const [latestAIResponse, setLatestAIResponse] = useState<string>('');

  const handleDownloadPRD = (content: string) => {
    setLatestAIResponse(content);
  };

  const handleDownloadMarkdown = () => {
    if (latestAIResponse) {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadAsMarkdown(latestAIResponse, `PRD-${timestamp}.md`);
      toast.success('PRD downloaded as Markdown file');
    } else {
      toast.error('No PRD content available to download');
    }
  };

  const handleDownloadPDF = async () => {
    if (latestAIResponse) {
      const timestamp = new Date().toISOString().split('T')[0];
      await downloadAsPDF(latestAIResponse, `PRD-${timestamp}.pdf`);
      toast.success('PRD downloaded as PDF file');
    } else {
      toast.error('No PRD content available to download');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ChatInterface
        title="PRD Generator"
        description="Create comprehensive Product Requirements Documents with AI assistance"
        powerPrompt={PRD_GENERATOR_PROMPT}
        showDownloadButton={true}
        onDownloadPRD={handleDownloadPRD}
      />

      {/* Download Options */}
      {latestAIResponse && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Download PRD</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadMarkdown}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download as Markdown
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download as PDF
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Download the latest AI-generated PRD in your preferred format.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}