"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { toast } from "sonner"
import { Bot, Loader2 } from "lucide-react"

export default function IntakePage() {
  const router = useRouter()
  const addTicket = useStore((state) => state.addTicket)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // We're using simple controlled state here for the demo instead of react-hook-form to save time,
  // though we installed react-hook-form for potential heavier usage later.
  const [formData, setFormData] = useState({
    title: "",
    type: "Contract Review",
    description: "",
    requester: "demo.user@company.com"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock AI Analysis based on input
    const isNDA = formData.type === "NDA" || formData.title.toLowerCase().includes("nda")
    const isUrgent = formData.description.toLowerCase().includes("urgent") || formData.description.toLowerCase().includes("asap")

    const aiAnalysis = {
      summary: `User is requesting a ${formData.type}. ${isNDA ? "Standard NDA template should be applicable." : "Requires manual review."}`,
      redFlags: isUrgent ? ["User indicated urgency, may need immediate triage"] : [],
      suggestedAction: isNDA ? "Generate standard mutual NDA." : "Assign to legal counsel for review.",
    }

    addTicket({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      requester: formData.requester,
      priority: isUrgent ? 'high' : 'medium',
      riskScore: isNDA ? 15 : 65,
      aiAnalysis
    })

    toast.success("Request submitted successfully", {
      description: "AI has pre-processed your request and routed it to the legal team."
    })

    setIsSubmitting(false)
    router.push("/board")
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 mt-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Legal Request</h1>
        <p className="text-muted-foreground mt-2">Submit a request to the legal team. Our AI will automatically classify and triage it.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>Provide context for your request.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Review Vendor MSA"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Request Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({...formData, type: v || "Other"})}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contract Review">Contract Review</SelectItem>
                  <SelectItem value="NDA">NDA</SelectItem>
                  <SelectItem value="Employment Advice">Employment / HR</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Context / Description *</Label>
              <Textarea
                id="description"
                placeholder="What do you need help with? Please provide context."
                className="min-h-[120px]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Attachments (Optional)</Label>
              <Input id="file" type="file" disabled={isSubmitting} />
            </div>

            <div className="pt-4 border-t flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is Analyzing...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    Submit & Auto-Triage
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
