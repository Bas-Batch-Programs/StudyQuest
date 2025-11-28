import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  BookOpen, 
  Check, 
  Crown, 
  ArrowLeft,
  Zap,
  Sparkles,
  Shield,
  HeartHandshake
} from "lucide-react";

const freeFeatures = [
  { feature: "AI-generated flashcards", limit: "10 per day" },
  { feature: "AI-generated quizzes", limit: "5 per day" },
  { feature: "XP tracking & leveling", limit: "Full access" },
  { feature: "Daily streak tracking", limit: "Full access" },
  { feature: "Basic progress stats", limit: "Full access" },
  { feature: "Multiple choice questions", limit: "Included" },
  { feature: "True/False questions", limit: "Included" },
];

const premiumFeatures = [
  { feature: "AI-generated flashcards", limit: "Unlimited" },
  { feature: "AI-generated quizzes", limit: "Unlimited" },
  { feature: "XP tracking & leveling", limit: "Full access" },
  { feature: "Daily streak tracking", limit: "Full access" },
  { feature: "Advanced analytics", limit: "Full access" },
  { feature: "All question types", limit: "Included" },
  { feature: "Detailed AI explanations", limit: "Included" },
  { feature: "Streak freeze items", limit: "Coming soon" },
  { feature: "Priority AI processing", limit: "Included" },
  { feature: "Custom study modes", limit: "Coming soon" },
];

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and PayPal through our secure Stripe payment system.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption and never share your study materials or personal data with third parties.",
  },
  {
    question: "What happens to my progress if I downgrade?",
    answer: "Your XP, level, and streaks are preserved. You'll just be limited to the free tier usage limits.",
  },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const isPremium = user?.isPremium;

  // Get the Stripe payment link from environment or use a placeholder
  const stripePaymentLink = "/api/upgrade"; // This will redirect to Stripe

  return (
    <div className="min-h-screen bg-background" data-testid="pricing-page">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:inline">StudyBuddy</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <a href="/api/login">Get Started</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Choose Your Learning Journey
            </h1>
            <p className="text-xl text-muted-foreground">
              Start free and upgrade when you're ready for unlimited learning potential
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Perfect for getting started with AI-powered studying
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-4 flex-1">
                  {freeFeatures.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">{item.feature}</span>
                        <span className="text-sm text-muted-foreground ml-2">({item.limit})</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {isAuthenticated && !isPremium ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : !isAuthenticated ? (
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/api/login">Get Started Free</a>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Tier */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full flex flex-col border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <Crown className="h-4 w-4" />
                  Recommended
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Premium
                  <Crown className="h-5 w-5 text-primary" />
                </CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$4</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Unlock your full learning potential with unlimited access
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-4 flex-1">
                  {premiumFeatures.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">{item.feature}</span>
                        <span className={`text-sm ml-2 ${
                          item.limit === "Coming soon" 
                            ? "text-orange-500" 
                            : "text-muted-foreground"
                        }`}>
                          ({item.limit})
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {isPremium ? (
                    <Button className="w-full" disabled>
                      <Crown className="h-4 w-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button className="w-full" asChild data-testid="button-upgrade-premium">
                      <a href={stripePaymentLink}>
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-20"
        >
          {[
            { icon: Shield, title: "Secure Payments", desc: "Powered by Stripe" },
            { icon: HeartHandshake, title: "Cancel Anytime", desc: "No questions asked" },
            { icon: Zap, title: "Instant Access", desc: "Start learning immediately" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center mt-20 bg-primary rounded-2xl p-8 lg:p-12 text-primary-foreground"
          >
            <Crown className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to Supercharge Your Learning?
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Join thousands of students learning smarter with StudyBuddy Premium
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <a href={isAuthenticated ? stripePaymentLink : "/api/login"}>
                Get Premium Now
                <Sparkles className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">StudyBuddy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Made with AI to help you learn smarter
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
