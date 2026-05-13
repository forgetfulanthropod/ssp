"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore, TicketStatus, Ticket } from "@/lib/store"
import { Bot, Clock, AlertTriangle, MessageSquare, Check, MoreHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const COLUMNS: { id: TicketStatus; label: string }[] = [
  { id: 'triage', label: 'Triage / AI Review' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'waiting', label: 'Waiting on Business' },
  { id: 'resolved', label: 'Resolved' },
]

export default function BoardPage() {
  const { tickets, moveTicket } = useStore()
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  // Basic drag and drop without complex libraries for speed in this demo
  const onDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData("ticketId", ticketId)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (e: React.DragEvent, status: TicketStatus) => {
    const ticketId = e.dataTransfer.getData("ticketId")
    if (ticketId) {
      moveTicket(ticketId, status)
      toast.success(`Moved to ${COLUMNS.find(c => c.id === status)?.label}`)
    }
  }

  const handleFulfill = () => {
    if (selectedTicket) {
      moveTicket(selectedTicket.id, 'resolved')
      toast.success("Request fulfilled & sent via Slack", {
        description: "The business user has been notified of completion."
      })
      setSelectedTicket(null)
    }
  }

  return (
    <div className="p-8 h-screen flex flex-col overflow-hidden">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests Board</h1>
          <p className="text-muted-foreground mt-2">Manage and fulfill active legal requests.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <div
            key={column.id}
            className="flex-1 min-w-[320px] bg-muted/40 rounded-xl p-4 flex flex-col"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-semibold">{column.label}</h3>
              <Badge variant="secondary" className="rounded-full">
                {tickets.filter(t => t.status === column.id).length}
              </Badge>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2">
              {tickets.filter(t => t.status === column.id).map(ticket => (
                <Sheet key={ticket.id}>
                  <SheetTrigger className="w-full text-left block">
                    <Card
                      className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                      draggable
                      onDragStart={(e) => onDragStart(e, ticket.id)}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                          {ticket.riskScore && ticket.riskScore > 50 && (
                            <Badge variant="destructive" className="text-[10px] h-5 px-1.5 flex gap-1">
                              <AlertTriangle className="h-3 w-3" /> High Risk
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm leading-tight">{ticket.title}</p>
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="outline" className="text-xs bg-background">
                            {ticket.type}
                          </Badge>
                          {ticket.aiAnalysis && (
                            <div className="flex items-center text-primary" title="AI Analyzed">
                              <Bot className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </SheetTrigger>

                  {/* TICKET DETAIL SHEET */}
                  <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
                    <SheetHeader className="pb-4 border-b">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{ticket.id}</Badge>
                        <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                          {ticket.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                      <SheetTitle className="text-2xl">{ticket.title}</SheetTitle>
                      <SheetDescription>
                        Requested by {ticket.requester} • {new Date(ticket.createdAt).toLocaleDateString()}
                      </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                      {/* Original Request */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Original Request
                        </h4>
                        <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                          {ticket.description}
                        </div>
                      </div>

                      <Tabs defaultValue="ai">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="ai" className="gap-2">
                            <Bot className="h-4 w-4" />
                            AI Triage
                          </TabsTrigger>
                          <TabsTrigger value="draft" className="gap-2">
                            <Check className="h-4 w-4" />
                            Execution Draft
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="ai" className="space-y-4 pt-4">
                          {ticket.aiAnalysis ? (
                            <>
                              <div className="space-y-1 border-l-2 border-primary pl-4">
                                <h5 className="text-sm font-medium text-muted-foreground">AI Summary</h5>
                                <p className="text-sm">{ticket.aiAnalysis.summary}</p>
                              </div>

                              {ticket.aiAnalysis.redFlags && ticket.aiAnalysis.redFlags.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> Red Flags Identified
                                  </h5>
                                  <ul className="list-disc pl-5 text-sm space-y-1">
                                    {ticket.aiAnalysis.redFlags.map((flag, i) => (
                                      <li key={i}>{flag}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {ticket.aiAnalysis.questions && (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium text-muted-foreground">Suggested Clarifying Questions</h5>
                                  <ul className="list-disc pl-5 text-sm space-y-1">
                                    {ticket.aiAnalysis.questions.map((q, i) => (
                                      <li key={i}>{q}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground py-8 text-center border rounded-md border-dashed">
                              No AI analysis available for this request.
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="draft" className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Draft Response / Document</h5>
                            <textarea
                              className="w-full h-48 p-3 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              defaultValue={ticket.aiAnalysis?.draftResponse || ticket.aiAnalysis?.suggestedAction || "Review the red flags and draft a response."}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <SheetFooter className="mt-auto border-t pt-4 gap-2">
                      <SheetClose className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
                        Close
                      </SheetClose>
                      <SheetClose
                        onClick={() => handleFulfill()}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                      >
                        Approve & Fulfill
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              ))}

              {tickets.filter(t => t.status === column.id).length === 0 && (
                <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                  Drop here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
