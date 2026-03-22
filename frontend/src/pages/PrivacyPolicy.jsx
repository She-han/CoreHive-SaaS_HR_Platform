import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
	ShieldCheck,
	Database,
	Lock,
	FileText,
	Users,
	Eye,
	Languages,
	CalendarDays,
	CheckCircle2
} from "lucide-react";

const policyContent = {
	english: {
		title: "Privacy Policy",
		subtitle:
			"How CoreHive collects, uses, stores, and protects personal and organizational data.",
		updated: "Last updated: March 15, 2026",
		sections: [
			{
				title: "Information We Collect",
				icon: Database,
				points: [
					"Organization profile and subscription details",
					"User account data such as name, email, role, and login metadata",
					"Employee records including attendance, leave, payroll, and HR-related entries",
					"Uploaded files such as profile images and business verification documents"
				]
			},
			{
				title: "How We Use Information",
				icon: FileText,
				points: [
					"To provide HR management workflows and role-based dashboards",
					"To process subscription billing and service operations",
					"To improve product reliability, analytics, and feature quality",
					"To support compliance, auditability, and security monitoring"
				]
			},
			{
				title: "Data Sharing and Disclosure",
				icon: Users,
				points: [
					"CoreHive does not sell personal data to third parties",
					"Data may be processed by trusted infrastructure and service providers",
					"Information may be disclosed when legally required",
					"Organization administrators control internal access by role"
				]
			},
			{
				title: "Security and Retention",
				icon: Lock,
				points: [
					"Data is protected with transport security and access controls",
					"Retention periods depend on legal, operational, and contractual needs",
					"Backups and logs are maintained for continuity and investigation",
					"Deprecated or unnecessary data is removed through controlled cleanup"
				]
			},
			{
				title: "Your Controls and Rights",
				icon: Eye,
				points: [
					"Organizations can update employee and account information",
					"Users can request corrections for inaccurate profile data",
					"Account owners may request deactivation or deletion support",
					"Privacy questions can be raised through official support channels"
				]
			}
		],
		notice:
			"This policy is intended for general transparency. Specific contractual commitments are governed by your subscription agreement and applicable law."
	},
	sinhala: {
		title: "රහස්‍යතා ප්‍රතිපත්තිය",
		subtitle:
			"CoreHive තුළ පුද්ගලික සහ ආයතනික දත්ත එකතු කිරීම, භාවිතය, ගබඩා කිරීම සහ ආරක්ෂාව පිළිබඳ පැහැදිලි කිරීම.",
		updated: "අවසන් යාවත්කාලීන කිරීම: 2026 මාර්තු 15",
		sections: [
			{
				title: "අපි එකතු කරන තොරතුරු",
				icon: Database,
				points: [
					"ආයතනික තොරතුරු සහ subscription විස්තර",
					"නම, email, role සහ login metadata වැනි user account දත්ත",
					"attendance, leave, payroll සහ HR දත්ත ඇතුළත් employee records",
					"profile images සහ business verification documents වැනි upload කරන ගොනු"
				]
			},
			{
				title: "දත්ත භාවිතා කරන ආකාරය",
				icon: FileText,
				points: [
					"HR workflows සහ role-based dashboards ලබාදීමට",
					"subscription billing සහ සේවා ක්‍රියාකාරීත්වය සැකසීමට",
					"product reliability සහ feature quality වැඩිදියුණු කිරීමට",
					"security monitoring සහ auditability සහාය සඳහා"
				]
			},
			{
				title: "දත්ත බෙදාහැරීම",
				icon: Users,
				points: [
					"CoreHive පුද්ගලික දත්ත තෙවන පාර්ශවයට විකුණන්නේ නැත",
					"විශ්වාසදායක infrastructure/service providers මගින් data process විය හැක",
					"නීතිමය අවශ්‍යතාවයන් යටතේ තොරතුරු හෙළිදරව් කළ හැක",
					"ආයතනය තුළ role permissions අනුව access පාලනය කරන්නේ admin පාර්ශවයයි"
				]
			},
			{
				title: "ආරක්ෂාව සහ ගබඩා කාලය",
				icon: Lock,
				points: [
					"data transport security සහ access controls යටතේ ආරක්ෂා කරයි",
					"retention කාලය නීතිමය සහ සේවාමය අවශ්‍යතා මත තීරණය වේ",
					"continuity සහ investigation සඳහා backups සහ logs භාවිතා කරයි",
					"අවශ්‍ය නොවන දත්ත පාලිත cleanup ක්‍රියාවලියකින් ඉවත් කරයි"
				]
			},
			{
				title: "ඔබගේ අයිතිවාසිකම් සහ පාලනය",
				icon: Eye,
				points: [
					"ආයතනයට employee සහ account දත්ත යාවත්කාලීන කළ හැක",
					"වැරදි profile දත්ත සඳහා නිවැරදි කිරීම් ඉල්ලා සිටිය හැක",
					"account deactivation හෝ deletion සඳහා support ඉල්ලීම් කළ හැක",
					"රහස්‍යතා සම්බන්ධ ගැටලු official support channels හරහා දන්වන්න"
				]
			}
		],
		notice:
			"මෙය සාමාන්‍ය පැහැදිලි කිරීමක් සඳහාය. සවිස්තරාත්මක නියමයන් subscription agreement සහ අදාල නීති අනුව ක්‍රියාත්මක වේ."
	}
};

const PrivacyPolicy = () => {
	const [activeTab, setActiveTab] = useState("english");
	const current = policyContent[activeTab];

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-[#F1FDF9] text-[#333333]">
				<section className="bg-linear-to-b from-[#0C397A] via-[#05668D] to-[#02C39A] pt-16 pb-20 px-6 text-center">
					<div className="max-w-5xl mx-auto">
						<span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-bold tracking-widest text-[#02C39A] uppercase bg-white/10 rounded-full">
							<ShieldCheck size={16} /> Legal
						</span>
						<h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">{current.title}</h1>
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
					<div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-6 flex items-center gap-2 text-sm text-gray-600">
						<CalendarDays size={16} className="text-[#05668D]" /> {current.updated}
					</div>

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
						<p>{current.notice}</p>
					</div>
				</main>
			</div>
			<Footer />
		</>
	);
};

export default PrivacyPolicy;
