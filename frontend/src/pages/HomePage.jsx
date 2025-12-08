import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Clock, 
  Zap,
  Star
  
} from 'lucide-react';

import Marquee from '../components/common/Marquee';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/**
 * Homepage Component
 * Main landing page for CoreHive platform
 */
const HomePage = () => {
  
  // 3D Tilt Card Configuration
  const ROTATION_RANGE = 32.5;
  const HALF_ROTATION_RANGE = 32.5 / 2;

  const TiltCard = () => {
    const ref = useRef(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x);
    const ySpring = useSpring(y);

    const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

    const handleMouseMove = (e) => {
      if (!ref.current) return [0, 0];

      const rect = ref.current.getBoundingClientRect();

      const width = rect.width;
      const height = rect.height;

      const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
      const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

      const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
      const rY = mouseX / width - HALF_ROTATION_RANGE;

      x.set(rX);
      y.set(rY);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          transform,
        }}
        className="relative h-96 w-[550px] mx-auto rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 shadow-2xl"
      >
        <div
          style={{
            transform: "translateZ(75px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute inset-4 grid place-content-center rounded-xl bg-white shadow-lg overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-30" />
          
          {/* Main Content */}
          <div className="relative z-10 text-center p-6">
            {/* Main Image Container */}
            <div
              style={{
                transform: "translateZ(100px)",
              }}
              className="mx-auto mb-4 relative w-32 h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100"
            >
              {/* Professional HR Illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-24 h-24">
                  {/* Team/People Icons */}
                  <div className="absolute inset-0 grid grid-cols-2 gap-1">
                    <div className="bg-primary-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-secondary-500 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-green-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-blue-500 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                 {/*  {/* Central connecting element 
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center z-10">
                    <Building2 className="w-3 h-3 text-primary-500" />
                  </div> */}
                </div>
              </div>
              
              {/* Animated pulse effect */}
              <motion.div
                className="absolute inset-0 bg-primary-500 rounded-2xl opacity-20"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.1, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            {/* Title */}
            <h3
              style={{
                transform: "translateZ(40px)",
              }}
              className="text-xl font-bold text-text-primary mb-2"
            >
              Join 500+ Companies
            </h3>
            
            {/* Subtitle */}
            <p
              style={{
                transform: "translateZ(30px)",
              }}
              className="text-xl text-text-secondary mb-6"
            >
              Leading Sri Lankan SMEs
            </p>
            
            {/* Statistics Grid */}
            <div
              style={{
                transform: "translateZ(25px)",
              }}
              className="grid grid-cols-3 gap-4 text-xs"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">500+</div>
                <div className="text-text-secondary">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">15K+</div>
                <div className="text-text-secondary">Employees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-500">98%</div>
                <div className="text-text-secondary">Satisfaction</div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
      
        </div>
      </motion.div>
    );
  };
  
  
  // Feature highlights
  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Complete employee lifecycle management with digital records and profiles'
    },
    {
      icon: DollarSign,
      title: 'Payroll Processing',
      description: 'Automated payroll calculations with tax compliance and payslip generation'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive HR analytics and customizable reporting dashboard'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with Sri Lankan labor law compliance'
    },
    {
      icon: Clock,
      title: 'Time & Attendance',
      description: 'Smart attendance tracking with multiple check-in methods'
    },
    {
      icon: Zap,
      title: 'Easy to Use',
      description: 'Intuitive interface designed specifically for Sri Lankan SMEs'
    }
  ];

  // Pricing tiers
  const pricingPlans = [
    {
      name: 'Starter',
      price: '2,500',
      period: '/month',
      description: 'Perfect for small teams getting started',
      employees: 'Up to 25 employees',
      features: [
        'Employee Management',
        'Basic Payroll',
        'Leave Management',
        'Attendance Tracking',
        'Basic Reports',
        'Email Support'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '5,500',
      period: '/month',
      description: 'Ideal for growing businesses',
      employees: 'Up to 100 employees',
      features: [
        'All Starter features',
        'Advanced Payroll',
        'Performance Tracking',
        'Employee Feedback',
        'Advanced Analytics',
        'Priority Support',
        'API Access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      employees: 'Unlimited employees',
      features: [
        'All Professional features',
        'Hiring Management',
        'Custom Integrations',
        'Advanced Security',
        'Dedicated Support',
        'Training & Onboarding'
      ],
      popular: false
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Priya Mendis',
      position: 'HR Manager',
      company: 'TechCorp Lanka',
      content: 'CoreHive has transformed how we manage our 80+ employees. The payroll automation alone saves us 10 hours every month!',
      rating: 5
    },
    {
      name: 'Kasun Perera',
      position: 'CEO',
      company: 'Green Solutions Pvt Ltd',
      content: 'Finally, an HR system that understands Sri Lankan businesses. The local tax compliance features are excellent.',
      rating: 5
    },
    {
      name: 'Dilani Fernando',
      position: 'Operations Director',
      company: 'Retail Plus',
      content: 'User-friendly interface and excellent customer support. Our team adapted to CoreHive within just two days.',
      rating: 5
    }
  ];

  return (
    <>
    <Navbar/>
    <div className="bg-background-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Hero content */}
            <div className="lg:col-span-6">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
                  Modern HR for{' '}
                  <br/>
                  <span className="text-primary-500">Sri Lankan</span>{' '}
                  SMEs
                </h1>
                
                <p className="mt-6 text-xl text-text-secondary leading-relaxed">
                  Streamline your workforce management with CoreHive's 
                  cloud-based HR platform. Built specifically for Sri Lankan 
                  small and medium enterprises.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button 
                      variant="primary" 
                      size="lg"
                      icon={ArrowRight}
                      iconPosition="right"
                      className="w-full sm:w-auto"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                  
                  <Link to="/demo">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Watch Demo
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-8 flex items-center space-x-6 text-sm text-text-secondary">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    14-day free trial
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    No credit card required
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Sri Lankan tax compliant
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hero image/illustration - 3D Animated Card */}
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="animate-slide-up flex justify-center">
                <TiltCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee/>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything You Need for HR Management
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              From employee onboarding to payroll processing, CoreHive provides 
              comprehensive HR tools designed for Sri Lankan businesses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="text-center hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-primary-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-secondary-500 text-text-inverse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Sri Lankan Businesses
            </h2>
            <p className="text-xl text-blue-100">
              See why companies choose CoreHive for their HR needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">500+</div>
              <div className="text-blue-100">Active Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">15,000+</div>
              <div className="text-blue-100">Employees Managed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">1M+</div>
              <div className="text-blue-100">Payrolls Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">98%</div>
              <div className="text-blue-100">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-text-secondary">
              Choose the plan that fits your organization's size and needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 ">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`text-center relative ${
                  plan.popular 
                    ? 'ring-2 ring-primary-500 shadow-xl scale-105' 
                    : 'hover:shadow-lg'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-text-primary">
                      LKR {plan.price}
                    </span>
                    <span className="text-text-secondary ml-1">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {plan.employees}
                  </p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-text-primary">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.popular ? "primary" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-text-secondary">
              Hear from Sri Lankan business leaders who trust CoreHive
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-text-primary mb-6 italic">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-text-primary">
                    {testimonial.name}
                  </div>
                  <div className="text-text-secondary text-sm">
                    {testimonial.position}, {testimonial.company}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-500 text-text-inverse">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your HR Management?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Join hundreds of Sri Lankan companies already using CoreHive. 
            Start your free trial today and see the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                variant="secondary" 
                size="lg"
                className="w-full sm:w-auto bg-white text-primary-500 hover:bg-gray-100"
                icon={ArrowRight}
                iconPosition="right"
              >
                Start Free Trial
              </Button>
            </Link>
            
            <Link to="/contact">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-500"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 text-green-100 text-sm">
            ✓ No setup fees ✓ 14-day free trial ✓ Cancel anytime
          </div>
        </div>
      </section>
    </div>
    <Footer/>
    </>
  );
};

export default HomePage;