import React, { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useInView,
  useReducedMotion,
  AnimatePresence,
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
 * HomePage Component
 * Professional landing page with smooth animations and enhanced accessibility
 * Optimized for performance with GPU-accelerated transforms
 */
const HomePage = () => {
  const prefersReducedMotion = useReducedMotion();
  
  // 3D Tilt Card Configuration
  const ROTATION_RANGE = 32.5;
  const HALF_ROTATION_RANGE = 32.5 / 2;

  // Memoized animation variants for performance
  const fadeInUpVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing curve
      }
    }
  }), []);

  const staggerContainerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }), []);

  const scaleInVariants = useMemo(() => ({
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1] // Bounce effect
      }
    }
  }), []);

  const TiltCard = React.memo(() => {
    const ref = useRef(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

    const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

    const handleMouseMove = (e) => {
      if (!ref.current || prefersReducedMotion) return;

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
          transform: prefersReducedMotion ? undefined : transform,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-96 w-full max-w-[550px] mx-auto rounded-xl bg-gradient-to-br from-[#02C39A] to-[#05668D] shadow-2xl"
        role="img"
        aria-label="Interactive 3D card showcasing CoreHive platform features"
      >
        <div
          style={{
            transform: prefersReducedMotion ? undefined : "translateZ(75px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute inset-4 grid place-content-center rounded-xl bg-white shadow-lg overflow-hidden"
        >
          {/* Background Pattern */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-[#F1FDF9] to-[#E0F9F4] opacity-40"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
          />
          
          {/* Main Content */}
          <div className="relative z-10 text-center p-6">
            {/* Main Image Container */}
            <motion.div
              style={{
                transform: prefersReducedMotion ? undefined : "translateZ(100px)",
              }}
              className="mx-auto mb-4 relative w-32 h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-[#02C39A]/10 to-[#05668D]/10"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Professional HR Illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="relative w-24 h-24"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  {/* Team/People Icons */}
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { Icon: Users, color: 'bg-[#02C39A]', delay: 0 },
                      { Icon: BarChart3, color: 'bg-[#05668D]', delay: 0.1 },
                      { Icon: DollarSign, color: 'bg-[#1ED292]', delay: 0.2 },
                      { Icon: Clock, color: 'bg-[#0C397A]', delay: 0.3 }
                    ].map(({ Icon, color, delay }, idx) => (
                      <motion.div
                        key={idx}
                        className={`${color} rounded-full flex items-center justify-center aspect-square`}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: delay,
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
              
              {/* Animated pulse effect */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-[#02C39A] rounded-2xl opacity-20"
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
              )}
            </motion.div>
            
            {/* Title */}
            <motion.h3
              style={{
                transform: prefersReducedMotion ? undefined : "translateZ(40px)",
              }}
              className="text-xl font-bold text-text-primary mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Join 500+ Companies
            </motion.h3>
            
            {/* Subtitle */}
            <motion.p
              style={{
                transform: prefersReducedMotion ? undefined : "translateZ(30px)",
              }}
              className="text-xl text-text-secondary mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Leading Sri Lankan SMEs
            </motion.p>
            
            {/* Statistics Grid */}
            <motion.div
              style={{
                transform: prefersReducedMotion ? undefined : "translateZ(25px)",
              }}
              className="grid grid-cols-3 gap-4 text-xs"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { value: '500+', label: 'Companies' },
                { value: '15K+', label: 'Employees' },
                { value: '98%', label: 'Satisfaction' }
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  className="text-center"
                  variants={fadeInUpVariants}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                >
                  <div className="text-2xl font-bold text-[#02C39A]">{stat.value}</div>
                  <div className="text-text-secondary">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  });

  TiltCard.displayName = 'TiltCard';
  
  // Reusable animated section wrapper
  const AnimatedSection = React.memo(({ children, id, className = '', delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
      <motion.section
        ref={ref}
        id={id}
        className={className}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
      >
        {children}
      </motion.section>
    );
  });

  AnimatedSection.displayName = 'AnimatedSection';

  // Feature Card Component with animations
  const FeatureCard = React.memo(({ feature, index }) => {
    const Icon = feature.icon;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
      <motion.div
        ref={ref}
        variants={fadeInUpVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ delay: index * 0.1 }}
        whileHover={{ 
          y: prefersReducedMotion ? 0 : -8,
          transition: { type: "spring", stiffness: 400, damping: 17 }
        }}
      >
        <Card 
          className="text-center h-full transition-shadow duration-300 group hover:shadow-xl"
          role="article"
          aria-label={`${feature.title} feature`}
        >
          <motion.div 
            className="w-16 h-16 bg-[#02C39A]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#02C39A] transition-colors duration-300"
            whileHover={{ rotate: prefersReducedMotion ? 0 : 360 }}
            transition={{ duration: 0.6 }}
          >
            <Icon 
              className="w-8 h-8 text-[#02C39A] group-hover:text-white transition-colors duration-300" 
              aria-hidden="true"
            />
          </motion.div>
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            {feature.title}
          </h3>
          <p className="text-text-secondary">
            {feature.description}
          </p>
        </Card>
      </motion.div>
    );
  });

  FeatureCard.displayName = 'FeatureCard';
  
  // Pricing Card Component
  const PricingCard = React.memo(({ plan, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
      <motion.div
        ref={ref}
        variants={scaleInVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ delay: index * 0.15 }}
        whileHover={{ 
          scale: prefersReducedMotion ? 1 : 1.03,
          transition: { type: "spring", stiffness: 300 }
        }}
      >
        <Card 
          className={`text-center relative h-full ${
            plan.popular 
              ? 'ring-2 ring-[#02C39A] shadow-xl' 
              : 'hover:shadow-lg'
          } transition-all duration-300`}
          role="article"
          aria-label={`${plan.name} pricing plan`}
        >
          <AnimatePresence>
            {plan.popular && (
              <motion.div 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <span className="bg-[#02C39A] text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                  Most Popular
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              {plan.name}
            </h3>
            <p className="text-text-secondary mb-4">
              {plan.description}
            </p>
            <div className="flex items-baseline justify-center">
              <motion.span 
                className="text-4xl font-bold text-text-primary"
                initial={{ scale: 0.8 }}
                animate={isInView ? { scale: 1 } : { scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, delay: index * 0.15 + 0.2 }}
              >
                LKR {plan.price}
              </motion.span>
              <span className="text-text-secondary ml-1">
                {plan.period}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              {plan.employees}
            </p>
          </div>
          
          <ul className="space-y-3 mb-8 text-left">
            {plan.features.map((feature, featureIndex) => (
              <motion.li 
                key={featureIndex} 
                className="flex items-center text-text-primary"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: index * 0.15 + featureIndex * 0.05 }}
              >
                <CheckCircle className="w-5 h-5 text-[#1ED292] mr-3 flex-shrink-0" aria-hidden="true" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          <Button 
            variant={plan.popular ? "primary" : "outline"}
            size="lg"
            className="w-full"
            aria-label={`Get started with ${plan.name} plan`}
          >
            {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
          </Button>
        </Card>
      </motion.div>
    );
  });

  PricingCard.displayName = 'PricingCard';

  // Testimonial Card Component
  const TestimonialCard = React.memo(({ testimonial, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
      <motion.div
        ref={ref}
        variants={fadeInUpVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ delay: index * 0.1 }}
        whileHover={{ 
          y: prefersReducedMotion ? 0 : -5,
          transition: { type: "spring", stiffness: 400 }
        }}
      >
        <Card 
          className="hover:shadow-lg transition-all duration-300 h-full"
          role="article"
          aria-label={`Testimonial from ${testimonial.name}`}
        >
          <div className="flex items-center mb-4" role="img" aria-label={`${testimonial.rating} star rating`}>
            {[...Array(testimonial.rating)].map((_, starIndex) => (
              <motion.div
                key={starIndex}
                initial={{ scale: 0, rotate: -180 }}
                animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                transition={{ 
                  delay: index * 0.1 + starIndex * 0.05,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <Star className="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true" />
              </motion.div>
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
      </motion.div>
    );
  });

  TestimonialCard.displayName = 'TestimonialCard';
  
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
    <div className="bg-[#F1FDF9]">
      {/* Hero Section */}
      <AnimatedSection className="relative overflow-hidden py-20 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Hero content */}
            <motion.div 
              className="lg:col-span-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div>
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Modern HR for{' '}
                  <br/>
                  <motion.span 
                    className="text-[#02C39A]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    Sri Lankan
                  </motion.span>{' '}
                  SMEs
                </motion.h1>
                
                <motion.p 
                  className="mt-6 text-xl text-text-secondary leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  Streamline your workforce management with CoreHive's 
                  cloud-based HR platform. Built specifically for Sri Lankan 
                  small and medium enterprises.
                </motion.p>
                
                <motion.div 
                  className="mt-8 flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <Link to="/signup" aria-label="Start your free trial">
                    <motion.div
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                    >
                      <Button 
                        variant="primary" 
                        size="lg"
                        icon={ArrowRight}
                        iconPosition="right"
                        className="w-full sm:w-auto"
                      >
                        Start Free Trial
                      </Button>
                    </motion.div>
                  </Link>
                  
                  <Link to="/demo" aria-label="Watch product demo">
                    <motion.div
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                    >
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        Watch Demo
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
                
                <motion.div 
                  className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-text-secondary"
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    '14-day free trial',
                    'No credit card required',
                    'Sri Lankan tax compliant'
                  ].map((text, idx) => (
                    <motion.div 
                      key={idx}
                      className="flex items-center"
                      variants={fadeInUpVariants}
                    >
                      <CheckCircle className="w-5 h-5 text-[#1ED292] mr-2" aria-hidden="true" />
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
            {/* Hero image/illustration - 3D Animated Card */}
            <motion.div 
              className="mt-12 lg:mt-0 lg:col-span-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <div className="flex justify-center">
                <TiltCard />
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      <Marquee/>

      {/* Features Section */}
      <AnimatedSection id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything You Need for HR Management
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              From employee onboarding to payroll processing, CoreHive provides 
              comprehensive HR tools designed for Sri Lankan businesses.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Statistics Section */}
      <AnimatedSection className="py-20 bg-[#05668D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Sri Lankan Businesses
            </h2>
            <p className="text-xl text-blue-100">
              See why companies choose CoreHive for their HR needs
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-4 gap-8"
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { value: '500+', label: 'Active Companies' },
              { value: '15,000+', label: 'Employees Managed' },
              { value: '1M+', label: 'Payrolls Processed' },
              { value: '98%', label: 'Customer Satisfaction' }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                className="text-center"
                variants={scaleInVariants}
                whileHover={{ 
                  scale: prefersReducedMotion ? 1 : 1.1,
                  transition: { type: "spring", stiffness: 400 }
                }}
              >
                <div className="text-4xl font-bold text-[#02C39A] mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Pricing Section */}
      <AnimatedSection id="pricing" className="py-20 bg-[#F1FDF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-text-secondary">
              Choose the plan that fits your organization's size and needs
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} plan={plan} index={index} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-text-secondary">
              Hear from Sri Lankan business leaders who trust CoreHive
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-20 bg-[#02C39A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to Transform Your HR Management?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-green-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Join hundreds of Sri Lankan companies already using CoreHive. 
            Start your free trial today and see the difference.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link to="/signup" aria-label="Start your free trial now">
              <motion.div
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              >
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="w-full sm:w-auto bg-white text-[#02C39A] hover:bg-gray-100"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Start Free Trial
                </Button>
              </motion.div>
            </Link>
            
            <Link to="/contact" aria-label="Contact sales team">
              <motion.div
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#02C39A]"
                >
                  Contact Sales
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          
          <motion.div 
            className="mt-8 text-green-100 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            ✓ No setup fees ✓ 14-day free trial ✓ Cancel anytime
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
    <Footer/>
    </>
  );
};

export default HomePage;