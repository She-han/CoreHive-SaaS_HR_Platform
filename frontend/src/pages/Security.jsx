import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
	Shield,
	Lock,
	KeyRound,
	Server,
	Eye,
	AlertTriangle,
	CheckCircle2,
	Globe,
	Languages
} from "lucide-react";

const THEME = {
	primary: "#02C39A",
	secondary: "#05668D",
	dark: "#0C397A",
	background: "#F1FDF9"
};

const content = {
	english: {
		label: "English",
		title: "Security at CoreHive",
		subtitle:
			"We protect your organization data with layered controls, secure architecture, and clear operational processes.",
		sections: [
			{
				title: "Security Foundation",
				icon: Shield,
				points: [
					"Multi-tenant data isolation with organization-level boundaries",
					"Role-based access control for SYS_ADMIN, ORG_ADMIN, HR_STAFF, and EMPLOYEE",
					"Authenticated API access with JWT-based session protection",
					"Audit-aware operations for sensitive HR and payroll actions"
				]
			},
			{
				title: "Data Protection",
				icon: Lock,
				points: [
					"Encrypted transport using HTTPS/TLS for client-server communication",
					"Secure password storage with one-way hashing in backend systems",
					"Controlled file handling for profile images and business documents",
					"Optional cloud storage integration with environment-based configuration"
				]
			},
			{
				title: "Access and Identity Controls",
				icon: KeyRound,
				points: [
					"Module-level controls to enable only required business capabilities",
					"Protected routes in frontend based on authenticated role",
					"Organization-scoped backend authorization checks",
					"Session invalidation on logout and token expiry handling"
				]
			},
			{
				title: "Application and Infrastructure Security",
				icon: Server,
				points: [
					"Input validation at API layer to reduce malformed and unsafe requests",
					"Defensive exception handling to avoid leaking internals",
					"Cross-origin configuration aligned to trusted frontend origins",
					"Environment-driven deployment settings for local and cloud runtime"
				]
			},
			{
				title: "Monitoring and Incident Readiness",
				icon: Eye,
				points: [
					"Runtime logging for authentication and critical data workflows",
					"Operational checks for service readiness and dependency health",
					"Controlled remediation for data consistency and cleanup tasks",
					"Rollback-safe transactional operations for HR-critical actions"
				]
			},
			{
				title: "Shared Security Responsibility",
				icon: AlertTriangle,
				points: [
					"Customers should use strong passwords and manage role permissions carefully",
					"Access should be revoked promptly for separated users",
					"Only trusted devices and networks should be used for admin access",
					"Security issues should be reported immediately to support channels"
				]
			}
		],
		note:
			"Security is continuously improved as features evolve. This page describes operational intent and high-level controls, not a formal certification statement."
	},
	sinhala: {
		label: "සිංහල",
		title: "CoreHive ආරක්ෂාව",
		subtitle:
			"ඔබගේ ආයතනික දත්ත ආරක්ෂා කිරීමට අපි ස්ථරගත ආරක්ෂක ක්‍රියාමාර්ග, ස්ථාවර ව්‍යුහය සහ පැහැදිලි ක්‍රියාවලි භාවිතා කරමු.",
		sections: [
			{
				title: "මූලික ආරක්ෂක ව්‍යුහය",
				icon: Shield,
				points: [
					"එක් එක් ආයතනයට දත්ත වෙන් කර තබන multi-tenant isolation",
					"SYS_ADMIN, ORG_ADMIN, HR_STAFF, EMPLOYEE සඳහා role-based access control",
					"JWT භාවිතා කරන authenticated API session protection",
					"HR සහ payroll වැනි සංවේදී ක්‍රියා සඳහා audit-aware පාලන"
				]
			},
			{
				title: "දත්ත ආරක්ෂාව",
				icon: Lock,
				points: [
					"HTTPS/TLS හරහා ගමන් කරන දත්ත ආරක්ෂා කිරීම",
					"මුරපද backend තුළ one-way hashing මගින් ගබඩා කිරීම",
					"profile image සහ business documents සඳහා පාලිත file handling",
					"local/cloud අනුව environment settings මත storage integration"
				]
			},
			{
				title: "ප්‍රවේශ සහ අනන්‍යතා පාලන",
				icon: KeyRound,
				points: [
					"අවශ්‍ය module පමණක් සක්‍රීය කරන module-level controls",
					"frontend protected routes හරහා role අනුව ප්‍රවේශ පාලනය",
					"backend තුළ organization scope authorization checks",
					"logout සහ token expiry වලදී session invalidation"
				]
			},
			{
				title: "Application සහ Infrastructure ආරක්ෂාව",
				icon: Server,
				points: [
					"API input validation මගින් unsafe requests අවම කිරීම",
					"error handling හරහා internal details leak වීම වැළැක්වීම",
					"trusted frontend origins සඳහා CORS alignment",
					"local සහ cloud සඳහා environment-driven deployment settings"
				]
			},
			{
				title: "Monitoring සහ Incident සූදානම",
				icon: Eye,
				points: [
					"authentication සහ critical workflows සඳහා runtime logging",
					"service readiness සහ dependency health checks",
					"data cleanup සහ consistency සඳහා controlled remediation",
					"HR-critical actions සඳහා rollback-safe transactional handling"
				]
			},
			{
				title: "ආරක්ෂාවේ හවුල් වගකීම",
				icon: AlertTriangle,
				points: [
					"ශක්තිමත් මුරපද සහ නිසි role permissions භාවිතා කරන්න",
					"ඉවත් වූ පරිශීලකයින්ගේ access වහා අහෝසි කරන්න",
					"admin access සඳහා විශ්වාසදායක devices සහ networks පමණක් භාවිතා කරන්න",
					"ආරක්ෂක ගැටලු support team වෙත වහා දන්වන්න"
				]
			}
		],
		note:
			"අපගේ ආරක්ෂාව feature වර්ධනය සමඟ නිරන්තරයෙන් වැඩිදියුණු කරයි. මෙය උසස් මට්ටමේ ක්‍රියාකාරී විස්තරයක් වන අතර certification ප්‍රකාශයක් නොවේ."
	}
};

const Security = () => {
	const [activeTab, setActiveTab] = useState("english");
	const current = content[activeTab];

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-[#F1FDF9] text-[#333333]">
				<section className="bg-linear-to-b from-[#0C397A] via-[#05668D] to-[#02C39A] pt-16 pb-20 px-6 text-center">
					<div className="max-w-5xl mx-auto">
						<span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-bold tracking-widest text-[#02C39A] uppercase bg-white/10 rounded-full">
							<Shield size={16} /> Trust Center
						</span>
						<h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">
							{current.title}
						</h1>
						<p className="text-gray-200 text-lg max-w-3xl mx-auto">{current.subtitle}</p>
						<div className="mt-8 inline-flex p-1 rounded-xl bg-white/10 border border-white/20">
							<button
								className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
									activeTab === "english" ? "bg-white text-[#0C397A]" : "text-white"
								}`}
								onClick={() => setActiveTab("english")}
							>
								<Languages size={14} className="inline mr-2" /> English
							</button>
							<button
								className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
									activeTab === "sinhala" ? "bg-white text-[#0C397A]" : "text-white"
								}`}
								onClick={() => setActiveTab("sinhala")}
							>
								සිංහල
							</button>
						</div>
					</div>
				</section>

				<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{current.sections.map((section) => {
							const Icon = section.icon;
							return (
								<article key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
									<div className="flex items-center gap-3 mb-4">
										<div className="w-10 h-10 rounded-xl bg-[#F1FDF9] flex items-center justify-center border border-[#02C39A]/20">
											<Icon className="w-5 h-5 text-[#05668D]" />
										</div>
										<h2 className="text-lg font-bold text-[#0C397A]">{section.title}</h2>
									</div>
									<ul className="space-y-2">
										{section.points.map((point) => (
											<li key={point} className="flex items-start gap-2 text-sm text-gray-700">
												<CheckCircle2 className="w-4 h-4 text-[#02C39A] mt-0.5 shrink-0" />
												<span>{point}</span>
											</li>
										))}
									</ul>
								</article>
							);
						})}
					</div>

					<div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-600">
						<div className="flex items-center gap-2 text-[#0C397A] font-semibold mb-2">
							<Globe size={16} /> Operational Note
						</div>
						<p>{current.note}</p>
					</div>
				</main>
			</div>
			<Footer />
		</>
	);
};

export default Security;
