import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronRight,
  Book,
  Users,
  Calendar,
  Shield,
  CreditCard,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics of SkillSwap',
      articles: [
        'How to create your profile',
        'Finding your first skill exchange',
        'Setting up your teaching skills',
        'Understanding the matching system'
      ]
    },
    {
      icon: Users,
      title: 'Skill Exchanges',
      description: 'Everything about skill sharing',
      articles: [
        'How to request a skill exchange',
        'Best practices for teaching',
        'Rating and reviewing sessions',
        'Canceling or rescheduling sessions'
      ]
    },
    {
      icon: Calendar,
      title: 'Sessions & Scheduling',
      description: 'Managing your learning sessions',
      articles: [
        'Scheduling your first session',
        'Virtual vs in-person sessions',
        'Session preparation tips',
        'Technical requirements for virtual sessions'
      ]
    },
    {
      icon: Shield,
      title: 'Safety & Privacy',
      description: 'Staying safe on SkillSwap',
      articles: [
        'Community guidelines',
        'Reporting inappropriate behavior',
        'Privacy settings and controls',
        'Verification and trust features'
      ]
    },
    {
      icon: CreditCard,
      title: 'Payments & Credits',
      description: 'Understanding the credit system',
      articles: [
        'How the credit system works',
        'Earning credits by teaching',
        'Spending credits on learning',
        'Refunds and credit disputes'
      ]
    },
    {
      icon: Settings,
      title: 'Account & Settings',
      description: 'Managing your account',
      articles: [
        'Updating your profile information',
        'Notification preferences',
        'Account security settings',
        'Deleting your account'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How does SkillSwap work?',
      answer: 'SkillSwap is a platform where people exchange skills. You can teach skills you know and learn skills you want to develop. Our credit system ensures fair exchanges - you earn credits by teaching and spend them on learning.'
    },
    {
      question: 'Is SkillSwap free to use?',
      answer: 'Yes! SkillSwap is completely free. You don\'t need to pay money - just share your skills to earn credits that you can use to learn from others.'
    },
    {
      question: 'How do I find someone to teach me a skill?',
      answer: 'Use our search feature to find teachers by skill, location, or availability. You can filter results and read profiles to find the perfect match for your learning goals.'
    },
    {
      question: 'What if I don\'t have any skills to teach?',
      answer: 'Everyone has skills! Think about your hobbies, work experience, languages you speak, or even life experiences. You might be surprised at what others want to learn from you.'
    },
    {
      question: 'How do virtual sessions work?',
      answer: 'Virtual sessions are conducted through video calls. We provide integrated video calling, screen sharing, and session recording features to make online learning effective.'
    },
    {
      question: 'What if I need to cancel a session?',
      answer: 'You can cancel sessions up to 24 hours in advance without penalty. Last-minute cancellations may result in credit penalties to ensure fairness for all users.'
    },
    {
      question: 'How do I report a problem or inappropriate behavior?',
      answer: 'Use the report feature on any user profile or session. Our community team reviews all reports promptly and takes appropriate action to maintain a safe environment.'
    },
    {
      question: 'Can I get a refund for credits?',
      answer: 'Credits are earned through teaching and are not purchased, so traditional refunds don\'t apply. However, if you experience issues with a session, contact support for credit adjustments.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to your questions and get the help you need
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant help from our support team
              </p>
              <Button size="sm">Start Chat</Button>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send us a detailed message
              </p>
              <Button size="sm" variant="outline">
                <a href="mailto:support@skillswap.com">Send Email</a>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Phone className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Call us during business hours
              </p>
              <Button size="sm" variant="outline">
                <a href="tel:+1-555-SKILLSWAP">Call Now</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <category.icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex} className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronRight className="h-3 w-3 mr-2" />
                        <span className="cursor-pointer hover:underline">{article}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQs.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No FAQs found matching "{searchQuery}". Try a different search term or contact support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Footer */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-4">Still need help?</h3>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you succeed on SkillSwap
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline">
              <Book className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
