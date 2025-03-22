import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { apiRequest } from "@/lib/queryClient";

const userInputSchema = z.object({
  query: z.string().min(1, "Please enter a query"),
});

type FormValues = z.infer<typeof userInputSchema>;

const AIPage = () => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(userInputSchema),
    defaultValues: { query: "" },
  });
  
  const [response, setResponse] = useState<string | null>(null);

  const submitQuery = useMutation<unknown, Error, FormValues>({
    mutationFn: async (data) => {
      const payload = { ...data, userId: 1 }; // Replace 1 with the actual user ID if available
      const res = await apiRequest("POST", "/api/ai/ask", payload);
      return res.json();
    },
    onSuccess: (result: any) => {
      setResponse(result.response || "Error: No response received");
      toast({
        title: "Query Processed",
        description: "Your query has been successfully processed.",
      });
    },
    onError: (error: Error) => {
      setResponse("Error connecting to API: " + error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive", 
      });
    }
  });

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Chat with ChatGPT</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit((data) => submitQuery.mutate(data))}
              className="space-y-4"
            >
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>Enter your question</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="What would you like to know?" />
                      </FormControl>
                      {error && <FormMessage>{error.message}</FormMessage>}
                    </FormItem>
                  )}
                />
              </Form>
              <Button type="submit" disabled={submitQuery.isLoading}>
                {submitQuery.isLoading ? "Please wait..." : "Send"}
              </Button>
            </form>
            
            {response && (
              <div className="mt-4 p-4 border rounded-lg">
                <h2 className="font-bold">AI Response:</h2>
                <p>{response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIPage;

