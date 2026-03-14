import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
	Scale,
	FileSignature,
	UserCog,
	CreditCard,
	ShieldAlert,
	Ban,
	AlertCircle,
	Languages,
	CalendarDays,
	CheckCircle2
} from "lucide-react";

const termsContent = {
	english: {
		title: "Terms of Service",
		subtitle:
			"These terms govern use of CoreHive HR platform, subscription services, and related modules.",
		updated: "Last updated: March 15, 2026",
		sections: [
			{
				title: "Acceptance of Terms",
				icon: FileSignature,
				points: [
					"By using CoreHive, you agree to these Terms and applicable laws",
					"Organization admins are responsible for account-level decisions",
					"If you disagree with terms, you should discontinue platform usage"
				]
			},
			{
				title: "Account and Access",
				icon: UserCog,
				points: [
					"Users must provide accurate information for account setup",
					"Login credentials must be protected and not shared",
					"Role permissions must be assigned and maintained responsibly",
					"We may suspend access if suspicious or abusive activity is detected"
				]
			},
			{
				title: "Subscriptions and Billing",
				icon: CreditCard,
				points: [
					"Paid plans are governed by selected billing cycle and features",
					"Module availability depends on active subscription level",
					"Late or failed payments may cause service restrictions",
					"Billing disputes should be raised through official support channels"
				]
			},
			{
				title: "Acceptable Use",
				icon: ShieldAlert,
				points: [
					"You must not misuse APIs, data exports, or access controls",
					"You must not upload malicious content or attempt unauthorized access",
					"You must not use the service to violate labor or privacy regulations",
					"You remain responsible for data entered by your organization users"
				]
			},
			{
				title: "Suspension and Termination",
				icon: Ban,
				points: [
					"CoreHive may suspend or terminate services for severe policy violations",
					"Organizations may request account closure based on support procedure",
					"Some records may be retained for legal and audit obligations",
					"Service restoration after suspension is subject to review"
				]
			},
			{
				title: "Liability and Legal",
				icon: AlertCircle,
				points: [
					"Service is provided with commercially reasonable operational standards",
					"CoreHive is not liable for indirect losses due to misuse or third-party failures",
					"Local law and contractual agreements apply to dispute resolution",
					"Terms may be updated; continued usage indicates acceptance of updates"
				]
			}
		],
		note:
			"This summary is for clear understanding. The enforceable legal relationship is defined by the complete agreement, invoices, and governing law."
	},
	sinhala: {
		title: "සේවා නියම සහ කොන්දේසි",
		subtitle:
			"CoreHive HR platform භාවිතය, subscription සේවා සහ modules සඳහා බලපාන නියමයන් මෙහි සඳහන් වේ.",
		updated: "අවසන් යාවත්කාලීන කිරීම: 2026 මාර්තු 15",
		sections: [
			{
				title: "නියම පිළිගැනීම",
				icon: FileSignature,
				points: [
					"CoreHive භාවිතා කිරීමෙන් මෙම Terms සහ අදාල නීති පිළිගන්නා බව සලකයි",
					"account මට්ටමේ තීරණ සඳහා organization admin වගකිව යුතුය",
					"මෙම නියමවලට එකඟ නොවේ නම් platform භාවිතය නවත්වන්න"
				]
			},
			{
				title: "ගිණුම් සහ ප්‍රවේශය",
				icon: UserCog,
				points: [
					"account setup සඳහා නිවැරදි තොරතුරු ලබාදිය යුතුය",
					"login credentials ආරක්ෂා කර තබාගත යුතුය",
					"role permissions වගකීම් සහිතව කළමනාකරණය කළ යුතුය",
					"සැක සහිත හෝ අනිසි ක්‍රියාකාරකම් තිබේ නම් access තාවකාලිකව නවත්විය හැක"
				]
			},
			{
				title: "Subscription සහ ගෙවීම්",
				icon: CreditCard,
				points: [
					"paid plans තෝරාගත් billing cycle සහ feature set අනුව ක්‍රියාත්මක වේ",
					"module availability සෘජුවම active subscription plan එකට අදාල වේ",
					"ගෙවීම් ප්‍රමාද/අසාර්ථක වීමේදී සේවාව සීමා විය හැක",
					"billing ගැටලු official support channels හරහා ඉදිරිපත් කරන්න"
				]
			},
			{
				title: "අනුමත භාවිතය",
				icon: ShieldAlert,
				points: [
					"API, data export, access controls අනිසි ලෙස භාවිතා නොකළ යුතුය",
					"malicious files upload කිරීම හෝ unauthorized access උත්සාහ නොකළ යුතුය",
					"labor/privacy නීති උල්ලංඝනය වන ලෙස සේවාව භාවිතා නොකළ යුතුය",
					"ඔබගේ ආයතනය ඇතුළත් කරන දත්ත සඳහා වගකීම ඔබගේ පාර්ශවය සතුය"
				]
			},
			{
				title: "Suspension සහ Termination",
				icon: Ban,
				points: [
					"දරුණු policy උල්ලංඝනවලදී සේවාව තාවකාලික හෝ ස්ථිරව නවත්විය හැක",
					"account closure ඉල්ලීම් support process අනුව ඉදිරිපත් කළ හැක",
					"නීතිමය සහ audit අවශ්‍යතා සඳහා සමහර දත්ත තබාගත හැක",
					"suspension පසු access නැවත ලබාදීම review මත තීරණය වේ"
				]
			},
			{
				title: "වගකීම සහ නීතිමය කොටස්",
				icon: AlertCircle,
				points: [
					"සේවාව වාණිජමය වශයෙන් සාධාරණ ක්‍රියාකාරී මට්ටමින් සපයයි",
					"misuse හෝ third-party failures නිසා ඇතිවන अप्रत्यक्ष පාඩු සඳහා CoreHive වගකිව නොහැක",
					"ගැටලු විසඳීම සඳහා අදාල නීති සහ ගිවිසුම් කොන්දේසි බලපායි",
					"Terms යාවත්කාලීන විය හැකි අතර දිගටම භාවිතය නව Terms පිළිගැනීම ලෙස සැලකේ"
				]
			}
		],
		note:
			"මෙය පැහැදිලි අවබෝධයක් සඳහා සාරාංශ ආකාරයේ පිටුවකි. බලාත්මක නීතිමය සම්බන්ධතාවය සම්පූර්ණ ගිවිසුම් සහ අදාල නීති මගින් තීරණය වේ."
	}
};

const TermsOfService = () => {
	const [activeTab, setActiveTab] = useState("english");
	const current = termsContent[activeTab];

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-[#F1FDF9] text-[#333333]">
				<section className="bg-linear-to-b from-[#0C397A] via-[#05668D] to-[#02C39A] pt-16 pb-20 px-6 text-center">
					<div className="max-w-5xl mx-auto">
						<span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-bold tracking-widest text-[#02C39A] uppercase bg-white/10 rounded-full">
							<Scale size={16} /> Legal
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
						<p>{current.note}</p>
					</div>
				</main>
			</div>
			<Footer />
		</>
	);
};

export default TermsOfService;
