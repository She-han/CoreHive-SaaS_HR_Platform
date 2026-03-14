import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
  Building2,
  Users,
  Briefcase,
  Shield,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Target,
  Workflow,
  Handshake
} from "lucide-react";

const metrics = [
  { label: "Primary Market", value: "Sri Lankan SMEs" },
  { label: "Delivery Model", value: "Multi-tenant SaaS" },
  { label: "Core Focus", value: "Modern HR Operations" },
  { label: "Business Value", value: "Efficiency + Compliance" }
];

const capabilities = [
  "Employee lifecycle management",
  "Attendance, leave, and payroll operations",
  "Hiring workflow and job publishing",
  "Survey and feedback ecosystem",
  "Role-based dashboards and controls",
  "Subscription-driven module expansion"
];

const businessModel = [
  {
    title: "Subscription Revenue",
    icon: Briefcase,
    text:
      "CoreHive operates on recurring subscription plans with modular capabilities, allowing organizations to adopt only what they need and scale over time."
  },
  {
    title: "Operational Efficiency",
    icon: Workflow,
    text:
      "The platform replaces fragmented spreadsheets and manual HR processes with one integrated operational workflow for attendance, leave, payroll, and reporting."
  },
  {
    title: "Trust and Retention",
    icon: Handshake,
    text:
      "Long-term customer value is driven by reliable support, secure data handling, practical automation, and transparent product evolution aligned with local business realities."
  }
];

const values = [
  {
    title: "Clarity",
    icon: Target,
    text: "We design for practical outcomes with simple flows and understandable controls."
  },
  {
    title: "Reliability",
    icon: Shield,
    text: "We prioritize stable operations and predictable behavior in business-critical workflows."
  },
  {
    title: "Progress",
    icon: TrendingUp,
    text: "We continuously improve modules and user experience with real operational feedback."
  }
];

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F1FDF9] text-[#333333]">
        <section className="bg-linear-to-b from-[#0C397A] via-[#05668D] to-[#02C39A] pt-16 pb-24 px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-bold tracking-widest text-[#02C39A] uppercase bg-white/10 rounded-full">
              <Sparkles size={16} /> About CoreHive
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">
              Human-Centered HR Technology for Growing Teams
            </h1>
            <p className="text-gray-200 text-lg max-w-3xl mx-auto">
              CoreHive is a SaaS HR platform built to help organizations run cleaner operations, faster HR processes, and better employee experiences without enterprise complexity.
            </p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {metrics.map((item) => (
              <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                <p className="mt-2 font-bold text-[#0C397A]">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F1FDF9] border border-[#02C39A]/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#05668D]" />
                </div>
                <h2 className="text-xl font-bold text-[#0C397A]">Who We Serve</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                CoreHive is built for organizations that need professional HR operations with less administrative drag. From onboarding and employee records to attendance, payroll, and reporting, our platform supports teams that want control and speed in one place.
              </p>
            </article>

            <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F1FDF9] border border-[#02C39A]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#05668D]" />
                </div>
                <h2 className="text-xl font-bold text-[#0C397A]">Platform Capability</h2>
              </div>
              <ul className="space-y-2">
                {capabilities.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#02C39A] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#0C397A] mb-4">Business Model</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {businessModel.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="w-10 h-10 rounded-xl bg-[#F1FDF9] border border-[#02C39A]/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#05668D]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0C397A] mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#0C397A] mb-4">What We Value</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="w-10 h-10 rounded-xl bg-[#F1FDF9] border border-[#02C39A]/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#05668D]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0C397A] mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;