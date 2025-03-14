import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, RefreshCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Call, Contact, insertCallSchema } from "@shared/schema";

function formatDuration(seconds: number | undefined) {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function CallRecording({ url }: { url: string | undefined }) {
  if (!url) return null;
  return (
    <audio controls className="w-full max-w-xs">
      <source src={url} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}

function CallStatus({ status }: { status: string }) {
  const variant = {
    "in-progress": "default",
    "completed": "success",
    "failed": "destructive",
    "no-answer": "warning",
  }[status] || "default";

  return <Badge variant={variant}>{status}</Badge>;
}

function AIInsights({ call }: { call: Call }) {
  if (!call.aiSummary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-medium mb-1">Sentiment</div>
          <div>{call.aiSummary.sentiment}</div>
        </div>
        <div>
          <div className="font-medium mb-1">Next Actions</div>
          <ul className="list-disc pl-4">
            {call.aiSummary.nextActions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium mb-1">Keywords</div>
          <div className="flex flex-wrap gap-2">
            {call.aiSummary.keywords.map((keyword, i) => (
              <Badge key={i} variant="outline">{keyword}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Calls() {
  const [location] = useLocation();
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const { toast } = useToast();
  const contactId = new URLSearchParams(location.split("?")[1]).get("contact");

  const { data: calls, isLoading: isLoadingCalls } = useQuery<Call[]>({
    queryKey: ["/api/calls"],
  });

  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const form = useForm({
    resolver: zodResolver(insertCallSchema),
    defaultValues: {
      contactId: contactId || "",
      status: "pending",
    },
  });

  const initiateCall = useMutation({
    mutationFn: async (data: typeof form.getValues()) => {
      const res = await apiRequest("POST", "/api/calls", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      toast({
        title: "Call initiated",
        description: "The call has been started successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to initiate call",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const refreshCallStatus = useMutation({
    mutationFn: async (callId: number) => {
      const res = await apiRequest("GET", `/api/calls/${callId}/status`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
    },
  });

  if (isLoadingCalls || isLoadingContacts) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calls</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Phone className="h-4 w-4 mr-2" />
                New Call
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Call</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => initiateCall.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="contactId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contacts?.map((contact) => (
                              <SelectItem
                                key={contact.id}
                                value={contact.id.toString()}
                              >
                                {contact.name} ({contact.phone})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={initiateCall.isPending}
                  >
                    {initiateCall.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Start Call"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls?.map((call) => {
                const contact = contacts?.find((c) => c.id === call.contactId);
                return (
                  <TableRow
                    key={call.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedCall(call)}
                  >
                    <TableCell className="font-medium">
                      {contact?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <CallStatus status={call.status} />
                    </TableCell>
                    <TableCell>{formatDuration(call.duration)}</TableCell>
                    <TableCell>
                      {new Date(call.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          refreshCallStatus.mutate(call.id);
                        }}
                        disabled={refreshCallStatus.isPending}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!calls?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No calls found. Start a new call to begin.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {selectedCall && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Call Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium mb-1">Contact</div>
                    <div>
                      {contacts?.find((c) => c.id === selectedCall.contactId)
                        ?.name || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Status</div>
                    <CallStatus status={selectedCall.status} />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Duration</div>
                    <div>{formatDuration(selectedCall.duration)}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Recording</div>
                    <CallRecording url={selectedCall.recordingUrl} />
                  </div>
                  {selectedCall.transcript && (
                    <div>
                      <div className="font-medium mb-1">Transcript</div>
                      <div className="whitespace-pre-wrap text-sm">
                        {selectedCall.transcript}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <AIInsights call={selectedCall} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
