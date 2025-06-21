import { Button } from "@/components/ui/button";
import { ArrowRight, HeartHandshake, BookOpen, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <HeartHandshake className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            HopeBridge
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
            How It Works
          </a>
          <a href="#about" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
            About Us
          </a>
          <Link href="/dashboard/volunteer" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
            Be a Volunteer
          </Link>
          <Link href="/donate" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            Donate
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/orphanage/register">
            <Button variant="ghost">Sign In As Orphanage</Button>
          </Link>
          <Link href="/dashboard/orphanage/register">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Get Started As Orphanage <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Bridging the Gap for <span className="text-blue-600">Orphaned Children</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Connecting orphaned children with life-changing opportunities for education, mentorship, and personal growth to help them build a brighter future.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard/orphanage/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg">
                Join Our Community
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How We Make a Difference
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform provides comprehensive support to help orphaned children thrive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-10 w-10 text-blue-600" />,
                title: "Education Support",
                description: "Access to quality education resources, scholarships, and learning opportunities tailored to each child's needs."
              },
              {
                icon: <Users className="h-10 w-10 text-blue-600" />,
                title: "Mentorship Programs",
                description: "Matching children with caring mentors who provide guidance, support, and positive role models."
              },
              {
                icon: <ShieldCheck className="h-10 w-10 text-blue-600" />,
                title: "Safe Environment",
                description: "A secure platform ensuring the safety and privacy of every child in our community."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join us in making a difference in a few simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-blue-200 dark:bg-blue-900 transform -translate-x-1/2"></div>
              
              {/* Steps */}
              {[
                { number: "1", title: "Create an Account", description: "Sign up as a guardian, mentor, or supporter to get started." },
                { number: "2", title: "Complete Your Profile", description: "Share information about yourself or the child you're registering." },
                { number: "3", title: "Explore Opportunities", description: "Browse and apply for educational programs, mentorships, and more." },
                { number: "4", title: "Make Connections", description: "Connect with mentors, educators, and other members of our community." }
              ].map((step, index) => (
                <div key={index} className={`relative mb-12 md:flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="md:w-1/2 md:px-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl mb-4">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Join our community today and help us provide opportunities for orphaned children to thrive and succeed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-500 hover:border-blue-500 px-8 py-6 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <HeartHandshake className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">HopeBridge</span>
              </div>
              <p className="text-gray-400">
                Bridging the gap for orphaned children through education, mentorship, and opportunity.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Get Involved</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Donate</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Volunteer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partner With Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <p className="mb-4">Follow us on social media for updates and stories.</p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                  <a key={social} href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">{social}</span>
                    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                      {social[0]}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} HopeBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
