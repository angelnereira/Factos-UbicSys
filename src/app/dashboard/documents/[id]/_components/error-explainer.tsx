'use client';

import { useState } from 'react';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type {
  IntelligentErrorExplanationInput,
  IntelligentErrorExplanationOutput,
} from '@/ai/flows/intelligent-error-explanation';
import { intelligentErrorExplanation } from '@/ai/flows/intelligent-error-explanation';
import type { Document } from '@/lib/types';

export default function ErrorExplainer({ document }: { document: Document }) {
  const [explanation, setExplanation] =
    useState<IntelligentErrorExplanationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplainError = async () => {
    if (!document.errorDetails) return;

    setIsLoading(true);
    setError(null);
    setExplanation(null);

    const input: IntelligentErrorExplanationInput = {
      documentId: document.id,
      clientId: document.clientId,
      erpType: document.erpType,
      errorDetails: document.errorDetails,
    };

    try {
      const result = await intelligentErrorExplanation(input);
      setExplanation(result);
    } catch (e) {
      console.error(e);
      setError('Failed to get explanation from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary" />
          Intelligent Error Handling
        </CardTitle>
        <CardDescription>
          Use AI to understand the root cause and get suggested actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!explanation && !isLoading && (
          <Button onClick={handleExplainError} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Explain Error
              </>
            )}
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             <span>AI is analyzing the error...</span>
          </div>
        )}

        {error && <p className="text-destructive">{error}</p>}

        {explanation && (
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Root Cause Explanation</AccordionTrigger>
              <AccordionContent className="prose dark:prose-invert max-w-none">
                <p>{explanation.rootCauseExplanation}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Suggested Actions</AccordionTrigger>
              <AccordionContent className="prose dark:prose-invert max-w-none">
                <p>{explanation.suggestedActions}</p>
              </AccordionContent>
            </AccordionItem>
            {explanation.relevantDocumentation && (
                <AccordionItem value="item-3">
                    <AccordionTrigger>Relevant Documentation</AccordionTrigger>
                    <AccordionContent className="prose dark:prose-invert max-w-none">
                        <a href={explanation.relevantDocumentation} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            View Documentation
                        </a>
                    </AccordionContent>
                </AccordionItem>
            )}
            {explanation.relevantCodeSnippet && (
                <AccordionItem value="item-4">
                    <AccordionTrigger>Relevant Code Snippet</AccordionTrigger>
                    <AccordionContent className="prose dark:prose-invert max-w-none">
                        <pre className="bg-muted p-4 rounded-md text-foreground overflow-x-auto"><code>{explanation.relevantCodeSnippet}</code></pre>
                    </AccordionContent>
                </AccordionItem>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
