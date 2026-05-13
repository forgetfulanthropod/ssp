import { create } from 'zustand'

export type TicketStatus = 'triage' | 'in_progress' | 'waiting' | 'resolved'
export type TicketPriority = 'low' | 'medium' | 'high'

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  riskScore?: number
  type: string
  requester: string
  assignee?: string
  createdAt: string
  aiAnalysis?: {
    summary?: string
    redFlags?: string[]
    suggestedAction?: string
    draftResponse?: string
    questions?: string[]
  }
}

interface AppState {
  tickets: Ticket[]
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => Ticket
  updateTicket: (id: string, updates: Partial<Ticket>) => void
  moveTicket: (id: string, status: TicketStatus) => void
}

const mockTickets: Ticket[] = [
  {
    id: "REQ-001",
    title: "Review Acme Corp MSA",
    description: "Need to get this MSA reviewed ASAP before end of quarter. They added some indemnification clauses.",
    status: "in_progress",
    priority: "high",
    riskScore: 85,
    type: "Contract Review",
    requester: "sarah.sales@company.com",
    assignee: "Alex (Legal)",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    aiAnalysis: {
      summary: "Standard MSA but with heavy modifications to mutual indemnification.",
      redFlags: ["Uncapped liability on IP infringement", "Non-standard termination for convenience (30 days)"],
      suggestedAction: "Push back on liability cap. Standardize termination to 90 days.",
    }
  },
  {
    id: "REQ-002",
    title: "Standard NDA for Vendor",
    description: "Sending our standard mutual NDA to a new software vendor (TechFlow).",
    status: "triage",
    priority: "low",
    riskScore: 10,
    type: "NDA",
    requester: "bob.engineering@company.com",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    aiAnalysis: {
      summary: "Standard mutual NDA request using approved template.",
      draftResponse: "Hi Bob, I've generated the standard mutual NDA with TechFlow's details. You can send this out via DocuSign.",
    }
  },
  {
    id: "REQ-003",
    title: "Question about remote work policy in CA",
    description: "Employee is moving to California next month. Do we need to update their contract?",
    status: "waiting",
    priority: "medium",
    riskScore: 45,
    type: "Employment Advice",
    requester: "hr.team@company.com",
    assignee: "Alex (Legal)",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    aiAnalysis: {
      summary: "Inquiry regarding California remote work compliance and contract updates.",
      questions: ["Is the employee changing their primary residence permanently?", "Will they be full-time or part-time in CA?"],
    }
  }
]

export const useStore = create<AppState>((set) => ({
  tickets: mockTickets,
  addTicket: (ticket) => {
    const newTicket: Ticket = {
      ...ticket,
      id: `REQ-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'triage',
      createdAt: new Date().toISOString()
    }
    set((state) => ({ tickets: [newTicket, ...state.tickets] }))
    return newTicket
  },
  updateTicket: (id, updates) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  moveTicket: (id, status) =>
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
}))
