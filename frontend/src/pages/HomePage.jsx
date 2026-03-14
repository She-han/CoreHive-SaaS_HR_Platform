import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useInView,
  useReducedMotion
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
import { getAllBillingPlans } from '../api/billingPlansApi';
import { getActiveModules } from '../api/extendedModulesApi';
import heroVideo from '../assets/videos/hero-video.mp4';

/**
 * HomePage Component
 * Professional landing page with smooth animations and enhanced accessibility
 * Optimized for performance with GPU-accelerated transforms
 */
const HomePage = () => {
  const prefersReducedMotion = useReducedMotion();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [availableModules, setAvailableModules] = useState([]);
  
  // Fetch billing plans and modules on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingPlans(true);
        
        // Fetch plans and modules in parallel
        const [plansData, modulesResponse] = await Promise.all([
          getAllBillingPlans(),
          getActiveModules().catch(() => ({ success: false, data: [] }))
        ]);
        
        setPricingPlans(plansData || []);
        
        // Set modules if fetch was successful
        if (modulesResponse.success && Array.isArray(modulesResponse.data)) {
          setAvailableModules(modulesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setPricingPlans([]);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchData();
  }, []);
  
  // Memoized animation variants for performance
  const fadeInUpVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94] // Custom easing curve
        }
      }
    }),
    []
  );

  const staggerContainerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    }),
    []
  );

  const scaleInVariants = useMemo(
    () => ({
      hidden: { scale: 0.8, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1] // Bounce effect
        }
      }
    }),
    []
  );


  // Reusable animated section wrapper
  const AnimatedSection = React.memo(
    ({ children, id, className = "", delay = 0 }) => {
      const ref = useRef(null);
      const isInView = useInView(ref, { once: true, margin: "-100px" });

      return (
        <motion.section
          ref={ref}
          id={id}
          className={className}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
          animate={
            isInView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: prefersReducedMotion ? 0 : 50 }
          }
          transition={{ duration: 0.6, delay, ease: "easeOut" }}
        >
          {children}
        </motion.section>
      );
    }
  );

  AnimatedSection.displayName = "AnimatedSection";

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
          <p className="text-text-secondary">{feature.description}</p>
        </Card>
      </motion.div>
    );
  });

  FeatureCard.displayName = 'FeatureCard';
  
  // Pricing Card Component - Matching SignupPage.jsx UI
  const PricingCard = React.memo(({ plan, index, availableModules }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const getModuleById = (moduleId) => {
      return availableModules.find(m => m.moduleId === moduleId);
    };

    return (
      <motion.div
        ref={ref}
        variants={scaleInVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ delay: index * 0.15 }}
      >
        <div
          className={`relative border-2 rounded-xl p-6 transition-all duration-200 h-full flex flex-col hover:shadow-lg ${
            plan.popular
              ? 'ring-1 ring-emerald-500 border-primary-500 shadow-lg'
              : 'border-gray-200 hover:border-primary-300 shadow-lg'
          }`}
        >
          {/* Popular badge */}
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </span>
            </div>
          )}

          {/* Plan header */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {plan.name}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {plan.description}
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-text-primary">
                LKR {plan.price}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              {plan.period}
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-2 mb-4 border-t border-gray-200 pt-4 mt-4 flex-grow">
            <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1">
              Basic Features
            </h4>
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary">{feature}</span>
              </div>
            ))}
          </div>

          {/* Extended Modules list */}
          {plan.moduleIds && plan.moduleIds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1">
                Extended Features ({plan.moduleIds.length})
              </h4>
              <div className="space-y-2.5">
                {plan.moduleIds.map((moduleId, idx) => {
                  const module = getModuleById(moduleId);
                  return module ? (
                    <div key={idx} className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-text-primary">{module.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Get Started Button - Aligned to bottom */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link to="/signup" className="block">
              <Button
                variant={plan.popular ? "primary" : "outline"}
                size="lg"
                className="w-full"
                icon={ArrowRight}
                iconPosition="right"
                aria-label={`Get started with ${plan.name} plan`}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  });

  PricingCard.displayName = "PricingCard";

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
          <div
            className="flex items-center mb-4"
            role="img"
            aria-label={`${testimonial.rating} star rating`}
          >
            {[...Array(testimonial.rating)].map((_, starIndex) => (
              <motion.div
                key={starIndex}
                initial={{ scale: 0, rotate: -180 }}
                animate={
                  isInView
                    ? { scale: 1, rotate: 0 }
                    : { scale: 0, rotate: -180 }
                }
                transition={{
                  delay: index * 0.1 + starIndex * 0.05,
                  type: "spring",
                  stiffness: 300
                }}
              >
                <Star
                  className="w-5 h-5 text-yellow-400 fill-current"
                  aria-hidden="true"
                />
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

  TestimonialCard.displayName = "TestimonialCard";

  // Feature highlights
  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description:
        "Complete employee lifecycle management with digital records and profiles"
    },
    {
      icon: DollarSign,
      title: "Payroll Processing",
      description:
        "Automated payroll calculations with tax compliance and payslip generation"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description:
        "Comprehensive HR analytics and customizable reporting dashboard"
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description:
        "Enterprise-grade security with Sri Lankan labor law compliance"
    },
    {
      icon: Clock,
      title: "Time & Attendance",
      description: "Smart attendance tracking with multiple check-in methods"
    },
    {
      icon: Zap,
      title: "Easy to Use",
      description:
        "Intuitive interface designed specifically for Sri Lankan SMEs"
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Priya Mendis",
      position: "HR Manager",
      company: "TechCorp Lanka",
      content:
        "CoreHive has transformed how we manage our 80+ employees. The payroll automation alone saves us 10 hours every month!",
      rating: 5
    },
    {
      name: "Kasun Perera",
      position: "CEO",
      company: "Green Solutions Pvt Ltd",
      content:
        "Finally, an HR system that understands Sri Lankan businesses. The local tax compliance features are excellent.",
      rating: 5
    },
    {
      name: "Dilani Fernando",
      position: "Operations Director",
      company: "Retail Plus",
      content:
        "User-friendly interface and excellent customer support. Our team adapted to CoreHive within just two days.",
      rating: 5
    }
  ];

  return (
    <>
      <Navbar />
      <div className="bg-[#F1FDF9]">
        {/* Hero Section */}
        <motion.section
          className="relative overflow-hidden py-20 lg:py-24 min-h-[78vh] flex items-center"
        >
          <motion.div
            className="absolute inset-0"
            aria-hidden="true"
          >
            {prefersReducedMotion ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(5, 0, 0, 0.9) 45%, rgba(2, 0, 0, 0.85) 100%)"
                }}
              />
            ) : (
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
            )}
          </motion.div>

          <motion.div
            className="absolute inset-0"
            aria-hidden="true"
          >
            <div className="h-full w-full bg-gradient-to-br from-[#000000]/85 via-[#000000]/75 to-[#000000]/70" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(2,195,154,0.28),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(30,210,146,0.2),transparent_30%)]" />
          </motion.div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white/90 text-sm font-semibold mx-auto"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Zap className="w-4 h-4 text-[#1ED292]" />
              AI-Powered and Cloud Based HR
            </motion.div>

            <motion.h1
              className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Modern HR for
              
              <motion.span
                className="text-[#02C39A]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                {" "} Sri Lankan
              </motion.span>{" "}
              SMEs
            </motion.h1>

            <motion.p
              className="mt-6 text-xl text-white/85 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Streamline your workforce management with CoreHive's cloud-based HR platform. Built specifically for Sri Lankan small and medium enterprises.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
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

              <Link to="/Guide" aria-label="Watch product demo">
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
              className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:mx-12"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {[{ value: "50+", label: "Active Companies" }, { value: "1000+", label: "Employees Can be Managed" }, { value: "99.9%", label: "Uptime SLA" }].map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeInUpVariants}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05, rotateX: -4, rotateY: 4 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  className="rounded-xl border border-white/25 bg-white/10 backdrop-blur-lg px-4 py-4 shadow-lg"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-sm text-white/80">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm text-white/85"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {["30-day free trial", "Most Affordable", "Zero Setup Fees"].map((text, idx) => (
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
        </motion.section>

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
                From employee onboarding to payroll processing, CoreHive
                provides comprehensive HR tools designed for Sri Lankan
                businesses.
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
                { value: "500+", label: "Active Companies" },
                { value: "15,000+", label: "Employees Managed" },
                { value: "1M+", label: "Payrolls Processed" },
                { value: "98%", label: "Customer Satisfaction" }
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
                  <div className="text-4xl font-bold text-[#02C39A] mb-2">
                    {stat.value}
                  </div>
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
          
          {isLoadingPlans ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : pricingPlans.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-4">
              {pricingPlans.map((plan, index) => (
                <PricingCard key={plan.id || index} plan={plan} index={index} availableModules={availableModules} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No pricing plans available at the moment.</p>
            </div>
          )}
        </div>
      </AnimatedSection>

      <Marquee />
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
      <Footer />
    </>
  );
};

export default HomePage;
