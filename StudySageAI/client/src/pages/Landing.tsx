import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  BookOpen, 
  Brain, 
  Upload, 
  Zap, 
  Flame, 
  Trophy,
  Target,
  Sparkles,
  Check,
  Crown
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Any Document",
    description: "Support for PDF, TXT, and DOCX files. Our AI extracts key concepts automatically.",
  },
  {
    icon: Brain,
    title: "AI-Generated Content",
    description: "Transform your study materials into flashcards and quizzes with one click.",
  },
  {
    icon: Zap,
    title: "Earn XP & Level Up",
    description: "Track your progress with XP rewards for every study session. Unlock achievements!",
  },
  {
    icon: Flame,
    title: "Daily Streaks",
    description: "Build consistency with streak tracking. Keep your learning momentum going!",
  },
  {
    icon: Target,
    title: "Adaptive Learning",
    description: "Quizzes adjust to your performance, focusing on areas where you need more practice.",
  },
  {
    icon: Trophy,
    title: "Achievements & Badges",
    description: "Unlock badges as you reach milestones. Show off your learning accomplishments!",
  },
];

const freeFeatures = [
  "10 AI-generated flashcards per day",
  "5 quizzes per day",
  "XP tracking & levels",
  "Daily streak tracking",
  "Basic progress stats",
];

const premiumFeatures = [
  "Unlimited flashcards",
  "Unlimited quizzes",
  "All question types",
  "Advanced analytics",
  "Detailed AI explanations",
  "Streak freeze items",
  "Priority AI processing",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">StudyBuddy</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                AI-Powered Learning Platform
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Your Study Materials into
                <span className="text-primary"> Interactive Learning</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Upload any document and let AI create flashcards and quizzes. 
                Earn XP, maintain streaks, and level up while mastering your subjects.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="text-lg px-8" data-testid="button-hero-cta">
                  <a href="/api/login">
                    Start Learning Free
                    <Zap className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <a href="#features">See How It Works</a>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16"
          >
            {[
              { value: "10K+", label: "Active Learners" },
              { value: "500K+", label: "Flashcards Created" },
              { value: "1M+", label: "Quizzes Completed" },
              { value: "95%", label: "Satisfaction Rate" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Study Smarter
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform transforms how you learn, making studying more effective and engaging.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-elevate">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Upload Your Material",
                description: "Drag and drop your PDF, TXT, or DOCX study documents",
              },
              {
                step: "2",
                title: "AI Creates Content",
                description: "Our AI analyzes your content and generates flashcards & quizzes",
              },
              {
                step: "3",
                title: "Study & Earn XP",
                description: "Practice with interactive materials and track your progress",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you're ready for unlimited learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Perfect for getting started with AI-powered studying
                  </p>
                  <ul className="space-y-3">
                    {freeFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild data-testid="button-free-signup">
                    <a href="/api/login">Get Started Free</a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Tier */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Crown className="h-3.5 w-3.5" />
                    Most Popular
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Premium
                    <Crown className="h-5 w-5 text-primary" />
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$4</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Unlimited learning with advanced features
                  </p>
                  <ul className="space-y-3">
                    {premiumFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild data-testid="button-premium-signup">
                    <a href="/api/login">Start Premium Trial</a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center bg-primary rounded-2xl p-8 lg:p-12 text-primary-foreground"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of students already using StudyBuddy to ace their exams
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8" data-testid="button-final-cta">
              <a href="/api/login">
                Get Started Now
                <Sparkles className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
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
