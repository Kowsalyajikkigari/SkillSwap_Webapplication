import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Mail, MessageCircle, Phone, MapPin, Clock, HelpCircle, AlertCircle, ChevronRight, Users } from "lucide-react";

// Mock FAQ data
const mockFaqs = [
  {
    id: "faq-1",
    question: "How does skill swapping work on SkillSwap?",
    answer: "SkillSwap is a platform where members can exchange skills without money changing hands. You list the skills you can teach and the skills you want to learn. When there's a match, you connect through our platform to arrange the exchange. Our system helps you find compatible skill swap partners, schedule sessions, and provide feedback after exchanges."
  },
  {
    id: "faq-2",
    question: "Is membership really free?",
    answer: "Yes! Basic membership is completely free and gives you access to all essential features. We also offer premium tiers with additional features like priority matching, advanced search filters, and featured profile placement for those who want to enhance their experience."
  },
  {
    id: "faq-3",
    question: "How do I know if someone is reliable?",
    answer: "All members have ratings and reviews from previous exchanges. We also verify identities through a secure process and have a robust reporting system to maintain a trustworthy community. You can view a member's verification badges, ratings, and exchange history before connecting."
  },
  {
    id: "faq-4",
    question: "What if the skills exchanged aren't equal in value?",
    answer: "Members can negotiate the terms of their exchange. Our platform includes a point system to track value, allowing for fair exchanges even when skills differ in market value. Many members also agree on multiple sessions or additional skills to balance the exchange. The platform helps facilitate these negotiations."
  },
  {
    id: "faq-5",
    question: "Can I exchange skills virtually or only in-person?",
    answer: "SkillSwap supports both virtual and in-person skill exchanges. When setting up your profile, you can specify your preferences. Many skills can be effectively taught online, while others may benefit from in-person interaction. Our platform allows you to filter potential matches based on your preferred exchange method."
  },
  {
    id: "faq-6",
    question: "What happens if I'm not satisfied with a skill exchange?",
    answer: "We encourage open communication between members to resolve any issues. If you're not satisfied with an exchange, you can provide feedback to the other member. For unresolved issues, our support team is available to mediate. We also have a refund policy for premium features if they don't meet your expectations."
  },
  {
    id: "faq-7",
    question: "How do I report inappropriate behavior?",
    answer: "We take community safety seriously. You can report inappropriate behavior through the 'Report' button on member profiles or in chat conversations. Our moderation team reviews all reports promptly and takes appropriate action according to our community guidelines."
  },
  {
    id: "faq-8",
    question: "Can I delete my account?",
    answer: "Yes, you can delete your account at any time through your account settings. When you delete your account, your personal information will be removed from our system according to our privacy policy, though some information may be retained for legal purposes or to prevent fraud."
  }
];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCategory("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Support & Contact</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Get help, find answers, and connect with our support team
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="contact">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <div className="text-center py-8">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                          Thank you for reaching out. We've received your message and will respond within 24-48 hours.
                        </p>
                        <Button onClick={() => setIsSubmitted(false)}>
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select value={category} onValueChange={setCategory} required>
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="technical">Technical Support</SelectItem>
                              <SelectItem value="billing">Billing & Payments</SelectItem>
                              <SelectItem value="account">Account Issues</SelectItem>
                              <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                              <SelectItem value="report">Report a Problem</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[150px]"
                            required
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Reach out to us through these channels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Email</h3>
                        <p className="text-muted-foreground mb-1">For general inquiries:</p>
                        <a href="mailto:support@skillswap.com" className="text-primary hover:underline">
                          support@skillswap.com
                        </a>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Phone</h3>
                        <p className="text-muted-foreground mb-1">Customer support:</p>
                        <a href="tel:+11234567890" className="text-primary hover:underline">
                          +1 (123) 456-7890
                        </a>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Live Chat</h3>
                        <p className="text-muted-foreground mb-2">Chat with our support team:</p>
                        <Button variant="outline" size="sm">
                          Start Chat
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Office</h3>
                        <p className="text-muted-foreground">
                          123 SkillSwap Avenue<br />
                          Learning City, LC 12345<br />
                          United States
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Hours</h3>
                        <p className="text-muted-foreground">
                          Monday - Friday: 9AM - 6PM EST<br />
                          Saturday: 10AM - 4PM EST<br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Need Help Fast?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link to="/faq" className="flex items-center p-3 rounded-lg hover:bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <HelpCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Visit our Help Center</h3>
                        <p className="text-sm text-muted-foreground">Find answers to common questions</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>

                    <Link to="/community" className="flex items-center p-3 rounded-lg hover:bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Community Forum</h3>
                        <p className="text-sm text-muted-foreground">Ask questions and share experiences</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>

                    <Link to="/report" className="flex items-center p-3 rounded-lg hover:bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <AlertCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Report an Issue</h3>
                        <p className="text-sm text-muted-foreground">Report bugs or inappropriate behavior</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq">
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find answers to common questions about SkillSwap
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {mockFaqs.map(faq => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <p className="text-center text-muted-foreground max-w-md">
                    Can't find what you're looking for?
                    <Button
                      variant="link"
                      className="px-1"
                      onClick={() => document.querySelector('[data-value="contact"]')?.click()}
                    >
                      Contact our support team
                    </Button>
                    for assistance.
                  </p>
                </CardFooter>
              </Card>

              <div className="mt-8 bg-muted/30 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Have a Suggestion?</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  We're always looking to improve SkillSwap. If you have ideas or feedback, we'd love to hear from you!
                </p>
                <Button onClick={() => document.querySelector('[data-value="contact"]')?.click()}>
                  Share Feedback
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Contact;
