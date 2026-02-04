import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  BookOpen,
  Building2,
  Users,
  UserCircle,
  Briefcase,
  CheckCircle,
  CreditCard,
  Settings,
  Calendar,
  ClipboardList,
  TrendingUp,
  Shield,
  Zap,
  QrCode,
  Camera,
  MessageSquare,
  FileText,
  DollarSign,
  Clock,
  Award,
  Target,
  ChevronRight,
  Globe,
  Languages
} from 'lucide-react';

const THEME = {
  primary: '#02C39A',
  secondary: '#05668D',
  dark: '#0C397A',
  background: '#F1FDF9',
  success: '#1ED292',
};

const UserGuide = () => {
  const [activeTab, setActiveTab] = useState('english');
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const content = {
    english: {
      hero: {
        title: 'CoreHive User Guide',
        subtitle: 'Your Complete Guide to Streamlined HR Management',
        description: 'Learn how to maximize your CoreHive experience with our comprehensive step-by-step guide'
      },
      sections: [
        {
          id: 'what-is-corehive',
          icon: Building2,
          title: 'What is CoreHive?',
          content: [
            {
              heading: 'Overview',
              text: 'CoreHive is a comprehensive, cloud-based Human Resource Management System (HRMS) designed to streamline and automate your organization\'s HR processes. Built as a multi-tenant SaaS platform, CoreHive offers scalable solutions for businesses of all sizes.'
            },
            {
              heading: 'Why Choose CoreHive?',
              points: [
                {
                  icon: Zap,
                  title: 'Time & Cost Savings',
                  desc: 'Automate repetitive HR tasks, reduce paperwork by 80%, and save up to 15 hours per week on administrative work'
                },
                {
                  icon: Shield,
                  title: 'Data Security & Compliance',
                  desc: 'Enterprise-grade security with encrypted data storage, role-based access control, and audit trails for complete compliance'
                },
                {
                  icon: TrendingUp,
                  title: 'Real-Time Insights',
                  desc: 'Make data-driven decisions with comprehensive analytics, attendance reports, and performance metrics'
                },
                {
                  icon: Users,
                  title: 'Employee Empowerment',
                  desc: 'Self-service portal for employees to manage leaves, view payslips, mark attendance, and provide feedback'
                },
                {
                  icon: Globe,
                  title: 'Cloud-Based Accessibility',
                  desc: 'Access from anywhere, anytime on any device - perfect for remote and hybrid work environments'
                },
                {
                  icon: Settings,
                  title: 'Customizable & Scalable',
                  desc: 'Flexible modules and configurations that grow with your organization\'s needs'
                }
              ]
            }
          ]
        },
        {
          id: 'registration',
          icon: ClipboardList,
          title: 'Organization Registration Process',
          content: [
            {
              heading: 'Step-by-Step Registration',
              steps: [
                {
                  number: '01',
                  title: 'Visit CoreHive Website',
                  desc: 'Navigate to corehive.com and click "Get Started" or "Sign Up"',
                  icon: Globe
                },
                {
                  number: '02',
                  title: 'Fill Organization Details',
                  desc: 'Provide organization name, email, contact number, and employee count range',
                  icon: Building2
                },
                {
                  number: '03',
                  title: 'Business Verification',
                  desc: 'Upload business registration document (BR) for verification purposes',
                  icon: FileText
                },
                {
                  number: '04',
                  title: 'Admin Account Setup',
                  desc: 'Create your Organization Admin credentials with a secure password',
                  icon: UserCircle
                },
                {
                  number: '05',
                  title: 'Select Billing Plan',
                  desc: 'Choose from Bronze, Silver, Gold, or Platinum plans based on your needs',
                  icon: CreditCard
                },
                {
                  number: '06',
                  title: 'Payment Processing',
                  desc: 'Complete secure payment through our integrated payment gateway',
                  icon: DollarSign
                },
                {
                  number: '07',
                  title: 'Configure Modules',
                  desc: 'Select extended modules like QR Attendance, Face Recognition, Feedback Management, etc.',
                  icon: Settings
                },
                {
                  number: '08',
                  title: 'System Access',
                  desc: 'Login with your credentials and start managing your organization',
                  icon: CheckCircle
                }
              ]
            }
          ]
        },
        {
          id: 'org-admin',
          icon: Shield,
          title: 'Organization Admin Guide',
          content: [
            {
              heading: 'Role & Responsibilities',
              text: 'As an Organization Admin, you have complete control over your organization\'s HR system. You can manage HR staff, configure modules, view reports, and oversee all organizational activities.'
            },
            {
              heading: 'Core Features',
              features: [
                {
                  icon: Users,
                  title: 'HR Staff Management',
                  desc: 'Create and manage HR staff accounts, assign permissions, and monitor activities',
                  steps: ['Navigate to HR Staff Management', 'Click "Add HR Staff"', 'Fill in staff details', 'Set permissions and save']
                },
                {
                  icon: Building2,
                  title: 'Department Management',
                  desc: 'Create, edit, and organize company departments',
                  steps: ['Go to Department Management', 'Add new departments', 'Assign department heads', 'Link employees to departments']
                },
                {
                  icon: Briefcase,
                  title: 'Designation Management',
                  desc: 'Define job roles and positions within your organization',
                  steps: ['Access Designation Management', 'Create designation levels', 'Set salary ranges', 'Define responsibilities']
                },
                {
                  icon: Settings,
                  title: 'Module Configuration',
                  desc: 'Enable or disable extended modules based on subscription',
                  steps: ['Navigate to Module Configuration', 'Toggle modules on/off', 'Configure module settings', 'Save changes']
                },
                {
                  icon: DollarSign,
                  title: 'Payroll Configuration',
                  desc: 'Set up payroll components, deductions, and allowances',
                  steps: ['Access Payroll Config', 'Define salary components', 'Set tax deductions', 'Configure EPF/ETF']
                },
                {
                  icon: Calendar,
                  title: 'Leave & Attendance Config',
                  desc: 'Configure leave types, annual quotas, and attendance policies',
                  steps: ['Go to Leave Config', 'Define leave types', 'Set annual quotas', 'Configure approval workflow']
                },
                {
                  icon: CreditCard,
                  title: 'Subscription Management',
                  desc: 'Upgrade plans, manage payments, and view billing history',
                  steps: ['Visit Subscription Management', 'View current plan', 'Upgrade/downgrade plan', 'Manage payment methods']
                },
                {
                  icon: TrendingUp,
                  title: 'Reports & Analytics',
                  desc: 'Access comprehensive reports on employees, attendance, leaves, and payroll',
                  steps: ['Navigate to Reports', 'Select report type', 'Filter by date/department', 'Export to PDF/Excel']
                }
              ]
            }
          ]
        },
        {
          id: 'hr-staff',
          icon: Users,
          title: 'HR Staff Guide',
          content: [
            {
              heading: 'Role & Responsibilities',
              text: 'HR Staff members handle day-to-day HR operations including employee management, attendance tracking, leave approvals, and payroll generation.'
            },
            {
              heading: 'Core Features',
              features: [
                {
                  icon: Users,
                  title: 'Employee Management',
                  desc: 'Complete employee lifecycle management from onboarding to exit',
                  steps: ['Go to Employee Management', 'Add new employee', 'Fill employee details', 'Assign department & designation', 'Set salary and benefits', 'Generate credentials']
                },
                {
                  icon: Calendar,
                  title: 'Leave Management',
                  desc: 'Review, approve, or reject employee leave requests',
                  steps: ['Navigate to Leave Management', 'View pending requests', 'Review leave details', 'Approve or reject with comments', 'Track leave balances']
                },
                {
                  icon: Clock,
                  title: 'Attendance Management',
                  desc: 'Monitor employee attendance, mark manual attendance, and generate reports',
                  steps: ['Access Attendance Management', 'View daily attendance', 'Mark manual attendance', 'Generate attendance reports', 'Export data']
                },
                {
                  icon: DollarSign,
                  title: 'Payroll Generation',
                  desc: 'Generate monthly payslips with automatic calculations',
                  steps: ['Go to Payroll Management', 'Select month and year', 'Review salary components', 'Generate payslips', 'Distribute to employees']
                },
                {
                  icon: Briefcase,
                  title: 'Hiring Management',
                  desc: 'Post job openings and manage recruitment process',
                  steps: ['Navigate to Hiring Management', 'Create job posting', 'Review applications', 'Schedule interviews', 'Send offers']
                },
                {
                  icon: MessageSquare,
                  title: 'Feedback Management',
                  desc: 'Create surveys and collect employee feedback',
                  steps: ['Access Feedback Management', 'Create new survey', 'Add questions', 'Distribute to employees', 'Analyze responses']
                },
                {
                  icon: FileText,
                  title: 'Notice Management',
                  desc: 'Post company announcements and notices',
                  steps: ['Go to Notice Management', 'Create new notice', 'Add title and content', 'Publish to employees']
                },
                {
                  icon: TrendingUp,
                  title: 'HR Reports',
                  desc: 'Generate detailed HR reports and analytics',
                  steps: ['Navigate to HR Reports', 'Select report type', 'Apply filters', 'View insights', 'Export report']
                }
              ]
            }
          ]
        },
        {
          id: 'employee',
          icon: UserCircle,
          title: 'Employee Guide',
          content: [
            {
              heading: 'Role & Access',
              text: 'As an employee, you have access to self-service features to manage your attendance, leaves, view payslips, and provide feedback.'
            },
            {
              heading: 'Core Features',
              features: [
                {
                  icon: UserCircle,
                  title: 'Profile Management',
                  desc: 'View and update your personal information',
                  steps: ['Go to Profile', 'View personal details', 'Edit contact information', 'Update emergency contacts', 'Save changes']
                },
                {
                  icon: Clock,
                  title: 'Attendance Marking',
                  desc: 'Mark your daily attendance using various methods',
                  steps: ['Access Attendance page', 'Choose method (Manual/QR/Face)', 'Check-in when arriving', 'Check-out when leaving', 'View attendance history']
                },
                {
                  icon: Calendar,
                  title: 'Leave Requests',
                  desc: 'Apply for leaves and track their status',
                  steps: ['Navigate to Leave Request', 'Select leave type', 'Choose dates', 'Add reason', 'Submit request', 'Track approval status']
                },
                {
                  icon: TrendingUp,
                  title: 'View Leave & Attendance',
                  desc: 'Check your attendance records and leave balance',
                  steps: ['Go to View Attendance', 'See daily attendance', 'Check leave balance', 'View leave history', 'Download reports']
                },
                {
                  icon: DollarSign,
                  title: 'Payslips',
                  desc: 'Access and download your monthly payslips',
                  steps: ['Navigate to Payslips', 'Select month', 'View payslip details', 'Download PDF']
                },
                {
                  icon: MessageSquare,
                  title: 'Feedback & Surveys',
                  desc: 'Provide feedback and complete surveys',
                  steps: ['Go to Feedback', 'Submit feedback', 'Complete surveys', 'View past submissions']
                },
                {
                  icon: FileText,
                  title: 'Company Notices',
                  desc: 'View important company announcements',
                  steps: ['Access Notices', 'Read new notices', 'Mark as read', 'Archive old notices']
                }
              ]
            }
          ]
        },
        {
          id: 'extended-modules',
          icon: Zap,
          title: 'Extended Modules',
          content: [
            {
              heading: 'Premium Features',
              text: 'Enhance your HR operations with powerful extended modules available in higher-tier plans.'
            },
            {
              heading: 'Available Modules',
              modules: [
                {
                  icon: QrCode,
                  title: 'QR Code Attendance',
                  benefits: ['Contactless attendance marking', 'Faster check-in/check-out', 'Reduced time theft', 'Real-time attendance tracking'],
                  usage: 'Employees scan QR codes displayed at office entrance to mark attendance instantly'
                },
                {
                  icon: Camera,
                  title: 'Face Recognition Attendance',
                  benefits: ['Biometric security', 'Eliminates buddy punching', '99% accuracy rate', 'Touchless and hygienic'],
                  usage: 'AI-powered facial recognition marks attendance by simply looking at the camera'
                },
                {
                  icon: MessageSquare,
                  title: 'Employee Feedback System',
                  benefits: ['Improve employee engagement', 'Collect anonymous feedback', 'Measure satisfaction', 'Data-driven improvements'],
                  usage: 'Create custom surveys and collect feedback from employees to improve workplace culture'
                },
                {
                  icon: Briefcase,
                  title: 'Hiring Management',
                  benefits: ['Streamlined recruitment', 'Applicant tracking', 'Centralized job postings', 'Faster hiring process'],
                  usage: 'Post jobs, track applications, schedule interviews, and manage the complete hiring workflow'
                },
                {
                  icon: Award,
                  title: 'Performance Reviews',
                  benefits: ['Structured evaluation process', 'Track employee growth', 'Set goals and KPIs', 'Performance analytics'],
                  usage: 'Conduct periodic performance reviews, set goals, and track employee development'
                }
              ]
            }
          ]
        }
      ]
    },
    sinhala: {
      hero: {
        title: 'CoreHive පරිශීලක මාර්ගෝපදේශය',
        subtitle: 'ඔබේ HR කළමනාකරණය සඳහා සම්පූර්ණ මාර්ගෝපදේශය',
        description: 'අපගේ සවිස්තරාත්මක මාර්ගෝපදේශය සමඟ ඔබේ CoreHive අත්දැකීම උපරිම කර ගන්න'
      },
      sections: [
        {
          id: 'what-is-corehive',
          icon: Building2,
          title: 'CoreHive යනු කුමක්ද?',
          content: [
            {
              heading: 'දළ විශ්ලේෂණය',
              text: 'CoreHive යනු ඔබේ ආයතනයේ HR ක්‍රියාවලීන් සරල කිරීමට සහ ස්වයංක්‍රීය කිරීමට නිර්මාණය කරන ලද විස්තීර්ණ, cloud-based මානව සම්පත් කළමනාකරණ පද්ධතියකි (HRMS). Multi-tenant SaaS වේදිකාවක් ලෙස නිර්මාණය කර ඇති CoreHive සියලු ප්‍රමාණයේ ව්‍යාපාර සඳහා scalable විසඳුම් ලබා දෙයි.'
            },
            {
              heading: 'CoreHive තෝරා ගන්නේ ඇයි?',
              points: [
                {
                  icon: Zap,
                  title: 'කාලය සහ පිරිවැය ඉතිරිකිරීම්',
                  desc: 'පුනරාවර්තන HR කාර්යයන් ස්වයංක්‍රීය කරන්න, කඩදාසි වැඩ 80%කින් අඩු කරන්න, සහ පරිපාලන කටයුතු සඳහා සතියකට පැය 15ක් දක්වා ඉතිරි කරන්න'
                },
                {
                  icon: Shield,
                  title: 'දත්ත ආරක්ෂාව සහ අනුකූලතාව',
                  desc: 'සම්පූර්ණ අනුකූලතාව සඳහා encrypted දත්ත ගබඩාව, role-based ප්‍රවේශ පාලනය සහ audit trails සමඟ enterprise-grade ආරක්ෂාව'
                },
                {
                  icon: TrendingUp,
                  title: 'තත්‍ය-කාලීන තොරතුරු',
                  desc: 'විස්තීර්ණ analytics, පැමිණීම් වාර්තා සහ කාර්ය සාධන මෙට්‍රික්ස් සමඟ දත්ත-මෙහෙයවන තීරණ ගන්න'
                },
                {
                  icon: Users,
                  title: 'සේවක සවිබල ගැන්වීම',
                  desc: 'සේවකයන්ට නිවාඩු කළමනාකරණය කිරීමට, payslips බැලීමට, පැමිණීම සලකුණු කිරීමට සහ feedback ලබා දීමට self-service portal'
                },
                {
                  icon: Globe,
                  title: 'Cloud-Based ප්‍රවේශය',
                  desc: 'ඕනෑම උපාංගයක ඕනෑම තැනක, ඕනෑම වේලාවක ප්‍රවේශ වන්න - දුරස්ථ සහ hybrid වැඩ පරිසර සඳහා පරිපූර්ණයි'
                },
                {
                  icon: Settings,
                  title: 'අභිරුචිකරණය කළ හැකි සහ පරිමාණය',
                  desc: 'ඔබේ ආයතනයේ අවශ්‍යතා සමඟ වර්ධනය වන නම්‍යශීලී modules සහ වින්‍යාසයන්'
                }
              ]
            }
          ]
        },
        {
          id: 'registration',
          icon: ClipboardList,
          title: 'ආයතනය ලියාපදිංචි කිරීමේ ක්‍රියාවලිය',
          content: [
            {
              heading: 'පියවරෙන් පියවර ලියාපදිංචිය',
              steps: [
                {
                  number: '01',
                  title: 'CoreHive වෙබ් අඩවියට පිවිසෙන්න',
                  desc: 'corehive.com වෙත යන්න සහ "Get Started" හෝ "Sign Up" click කරන්න',
                  icon: Globe
                },
                {
                  number: '02',
                  title: 'ආයතන විස්තර පුරවන්න',
                  desc: 'ආයතන නම, email, දුරකථන අංකය සහ සේවක සංඛ්‍යාව ලබා දෙන්න',
                  icon: Building2
                },
                {
                  number: '03',
                  title: 'ව්‍යාපාර සත්‍යාපනය',
                  desc: 'සත්‍යාපනය සඳහා ව්‍යාපාර ලියාපදිංචි ලේඛනය (BR) උඩුගත කරන්න',
                  icon: FileText
                },
                {
                  number: '04',
                  title: 'පරිපාලක ගිණුම සැකසීම',
                  desc: 'ආරක්ෂිත මුරපදයක් සමඟ ඔබේ Organization Admin credentials නිර්මාණය කරන්න',
                  icon: UserCircle
                },
                {
                  number: '05',
                  title: 'බිල්පත් සැලැස්ම තෝරන්න',
                  desc: 'ඔබේ අවශ්‍යතා මත පදනම්ව Bronze, Silver, Gold, හෝ Platinum සැලැස්ම් වලින් තෝරන්න',
                  icon: CreditCard
                },
                {
                  number: '06',
                  title: 'ගෙවීම් ක්‍රියාවලිය',
                  desc: 'අපගේ integrated payment gateway හරහා ආරක්ෂිත ගෙවීම සම්පූර්ණ කරන්න',
                  icon: DollarSign
                },
                {
                  number: '07',
                  title: 'Modules වින්‍යාස කරන්න',
                  desc: 'QR Attendance, Face Recognition, Feedback Management වැනි extended modules තෝරන්න',
                  icon: Settings
                },
                {
                  number: '08',
                  title: 'පද්ධති ප්‍රවේශය',
                  desc: 'ඔබේ credentials සමඟ login වී ඔබේ ආයතනය කළමනාකරණය කිරීම ආරම්භ කරන්න',
                  icon: CheckCircle
                }
              ]
            }
          ]
        },
        {
          id: 'org-admin',
          icon: Shield,
          title: 'ආයතන පරිපාලක මාර්ගෝපදේශය',
          content: [
            {
              heading: 'භූමිකාව සහ වගකීම්',
              text: 'ආයතන පරිපාලකයෙකු ලෙස, ඔබේ ආයතනයේ HR පද්ධතිය මත ඔබට සම්පූර්ණ පාලනය ඇත. ඔබට HR කාර්ය මණ්ඩලය කළමනාකරණය කිරීමට, modules වින්‍යාස කිරීමට, වාර්තා බැලීමට සහ සියලුම ආයතනික ක්‍රියාකාරකම් අධීක්ෂණය කිරීමට හැකිය.'
            },
            {
              heading: 'ප්‍රධාන විශේෂාංග',
              features: [
                {
                  icon: Users,
                  title: 'HR කාර්ය මණ්ඩල කළමනාකරණය',
                  desc: 'HR කාර්ය මණ්ඩල ගිණුම් සාදන්න සහ කළමනාකරණය කරන්න, අවසර පවරන්න සහ ක්‍රියාකාරකම් අධීක්ෂණය කරන්න',
                  steps: ['HR Staff Management වෙත යන්න', '"Add HR Staff" click කරන්න', 'කාර්ය මණ්ඩල විස්තර පුරවන්න', 'අවසර සකසා save කරන්න']
                },
                {
                  icon: Building2,
                  title: 'දෙපාර්තමේන්තු කළමනාකරණය',
                  desc: 'සමාගම් දෙපාර්තමේන්තු නිර්මාණය කරන්න, සංස්කරණය කරන්න සහ සංවිධානය කරන්න',
                  steps: ['Department Management වෙත යන්න', 'නව දෙපාර්තමේන්තු එක් කරන්න', 'දෙපාර්තමේන්තු ප්‍රධානීන් පවරන්න', 'සේවකයන් දෙපාර්තමේන්තු වෙත link කරන්න']
                },
                {
                  icon: Briefcase,
                  title: 'තනතුරු කළමනාකරණය',
                  desc: 'ඔබේ ආයතනය තුළ රැකියා භූමිකාවන් සහ තනතුරු නිර්වචනය කරන්න',
                  steps: ['Designation Management වෙත ප්‍රවේශ වන්න', 'තනතුරු මට්ටම් සාදන්න', 'වැටුප් පරාස සකසන්න', 'වගකීම් නිර්වචනය කරන්න']
                },
                {
                  icon: Settings,
                  title: 'Module වින්‍යාසය',
                  desc: 'subscription මත පදනම්ව extended modules සක්‍රීය හෝ අක්‍රීය කරන්න',
                  steps: ['Module Configuration වෙත යන්න', 'Modules on/off toggle කරන්න', 'Module settings වින්‍යාස කරන්න', 'වෙනස්කම් save කරන්න']
                },
                {
                  icon: DollarSign,
                  title: 'වැටුප් වින්‍යාසය',
                  desc: 'වැටුප් සංරචක, අඩු කිරීම් සහ දීමනා සකසන්න',
                  steps: ['Payroll Config වෙත ප්‍රවේශ වන්න', 'වැටුප් සංරචක නිර්වචනය කරන්න', 'බදු අඩු කිරීම් සකසන්න', 'EPF/ETF වින්‍යාස කරන්න']
                },
                {
                  icon: Calendar,
                  title: 'නිවාඩු සහ පැමිණීම් වින්‍යාසය',
                  desc: 'නිවාඩු වර්ග, වාර්ෂික කෝටා සහ පැමිණීම් ප්‍රතිපත්ති වින්‍යාස කරන්න',
                  steps: ['Leave Config වෙත යන්න', 'නිවාඩු වර්ග නිර්වචනය කරන්න', 'වාර්ෂික කෝටා සකසන්න', 'අනුමත කිරීමේ workflow වින්‍යාස කරන්න']
                },
                {
                  icon: CreditCard,
                  title: 'Subscription කළමනාකරණය',
                  desc: 'සැලැස්ම් උත්ශ්‍රේණි කරන්න, ගෙවීම් කළමනාකරණය කරන්න සහ බිල්පත් ඉතිහාසය බලන්න',
                  steps: ['Subscription Management වෙත යන්න', 'වත්මන් සැලැස්ම බලන්න', 'සැලැස්ම upgrade/downgrade කරන්න', 'ගෙවීම් ක්‍රම කළමනාකරණය කරන්න']
                },
                {
                  icon: TrendingUp,
                  title: 'වාර්තා සහ විශ්ලේෂණ',
                  desc: 'සේවකයන්, පැමිණීම්, නිවාඩු සහ වැටුප් පිළිබඳ විස්තීර්ණ වාර්තා වෙත ප්‍රවේශ වන්න',
                  steps: ['Reports වෙත යන්න', 'වාර්තා වර්ගය තෝරන්න', 'දිනය/දෙපාර්තමේන්තුව අනුව filter කරන්න', 'PDF/Excel වෙත export කරන්න']
                }
              ]
            }
          ]
        },
        {
          id: 'hr-staff',
          icon: Users,
          title: 'HR කාර්ය මණ්ඩල මාර්ගෝපදේශය',
          content: [
            {
              heading: 'භූමිකාව සහ වගකීම්',
              text: 'HR කාර්ය මණ්ඩල සාමාජිකයන් සේවක කළමනාකරණය, පැමිණීම් අනුගමනය, නිවාඩු අනුමත කිරීම සහ වැටුප් උත්පාදනය ඇතුළු දෛනික HR මෙහෙයුම් හසුරුවයි.'
            },
            {
              heading: 'ප්‍රධාන විශේෂාංග',
              features: [
                {
                  icon: Users,
                  title: 'සේවක කළමනාකරණය',
                  desc: 'Onboarding සිට exit දක්වා සම්පූර්ණ සේවක ජීවන චක්‍ර කළමනාකරණය',
                  steps: ['Employee Management වෙත යන්න', 'නව සේවකයා එක් කරන්න', 'සේවක විස්තර පුරවන්න', 'දෙපාර්තමේන්තුව සහ තනතුර පවරන්න', 'වැටුප සහ ප්‍රතිලාභ සකසන්න', 'Credentials උත්පාදනය කරන්න']
                },
                {
                  icon: Calendar,
                  title: 'නිවාඩු කළමනාකරණය',
                  desc: 'සේවක නිවාඩු ඉල්ලීම් සමාලෝචනය කරන්න, අනුමත කරන්න හෝ ප්‍රතික්ෂේප කරන්න',
                  steps: ['Leave Management වෙත යන්න', 'පොරොත්තු ඉල්ලීම් බලන්න', 'නිවාඩු විස්තර සමාලෝචනය කරන්න', 'අදහස් සමඟ අනුමත හෝ ප්‍රතික්ෂේප කරන්න', 'නිවාඩු ශේෂ track කරන්න']
                },
                {
                  icon: Clock,
                  title: 'පැමිණීම් කළමනාකරණය',
                  desc: 'සේවක පැමිණීම අධීක්ෂණය කරන්න, manual පැමිණීම සලකුණු කරන්න සහ වාර්තා උත්පාදනය කරන්න',
                  steps: ['Attendance Management වෙත ප්‍රවේශ වන්න', 'දෛනික පැමිණීම බලන්න', 'Manual පැමිණීම සලකුණු කරන්න', 'පැමිණීම් වාර්තා උත්පාදනය කරන්න', 'දත්ත export කරන්න']
                },
                {
                  icon: DollarSign,
                  title: 'වැටුප් උත්පාදනය',
                  desc: 'ස්වයංක්‍රීය ගණනය කිරීම් සමඟ මාසික payslips උත්පාදනය කරන්න',
                  steps: ['Payroll Management වෙත යන්න', 'මාසය සහ වර්ෂය තෝරන්න', 'වැටුප් සංරචක සමාලෝචනය කරන්න', 'Payslips උත්පාදනය කරන්න', 'සේවකයන්ට බෙදා හරින්න']
                },
                {
                  icon: Briefcase,
                  title: 'බඳවා ගැනීම් කළමනාකරණය',
                  desc: 'රැකියා පළ කරන්න සහ බඳවා ගැනීමේ ක්‍රියාවලිය කළමනාකරණය කරන්න',
                  steps: ['Hiring Management වෙත යන්න', 'Job posting සාදන්න', 'Applications සමාලෝචනය කරන්න', 'Interviews කාල සටහන් කරන්න', 'Offers යවන්න']
                },
                {
                  icon: MessageSquare,
                  title: 'Feedback කළමනාකරණය',
                  desc: 'Surveys සාදන්න සහ සේවක feedback එකතු කරන්න',
                  steps: ['Feedback Management වෙත ප්‍රවේශ වන්න', 'නව survey සාදන්න', 'ප්‍රශ්න එක් කරන්න', 'සේවකයන්ට බෙදා හරින්න', 'ප්‍රතිචාර විශ්ලේෂණය කරන්න']
                },
                {
                  icon: FileText,
                  title: 'දැන්වීම් කළමනාකරණය',
                  desc: 'සමාගම් නිවේදන සහ දැන්වීම් පළ කරන්න',
                  steps: ['Notice Management වෙත යන්න', 'නව දැන්වීම සාදන්න', 'මාතෘකාව සහ අන්තර්ගතය එක් කරන්න', 'සේවකයන්ට publish කරන්න']
                },
                {
                  icon: TrendingUp,
                  title: 'HR වාර්තා',
                  desc: 'විස්තීර්ණ HR වාර්තා සහ විශ්ලේෂණ උත්පාදනය කරන්න',
                  steps: ['HR Reports වෙත යන්න', 'වාර්තා වර්ගය තෝරන්න', 'Filters යොදන්න', 'තීක්ෂ්ණතා බලන්න', 'වාර්තාව export කරන්න']
                }
              ]
            }
          ]
        },
        {
          id: 'employee',
          icon: UserCircle,
          title: 'සේවක මාර්ගෝපදේශය',
          content: [
            {
              heading: 'භූමිකාව සහ ප්‍රවේශය',
              text: 'සේවකයෙකු ලෙස, ඔබේ පැමිණීම්, නිවාඩු කළමනාකරණය කිරීමට, payslips බැලීමට සහ feedback ලබා දීමට ඔබට self-service විශේෂාංග වෙත ප්‍රවේශය ඇත.'
            },
            {
              heading: 'ප්‍රධාන විශේෂාංග',
              features: [
                {
                  icon: UserCircle,
                  title: 'Profile කළමනාකරණය',
                  desc: 'ඔබේ පුද්ගලික තොරතුරු බලන්න සහ යාවත්කාලීන කරන්න',
                  steps: ['Profile වෙත යන්න', 'පුද්ගලික විස්තර බලන්න', 'සම්බන්ධතා තොරතුරු සංස්කරණය කරන්න', 'හදිසි සම්බන්ධතා යාවත්කාලීන කරන්න', 'වෙනස්කම් save කරන්න']
                },
                {
                  icon: Clock,
                  title: 'පැමිණීම සලකුණු කිරීම',
                  desc: 'විවිධ ක්‍රම භාවිතයෙන් ඔබේ දෛනික පැමිණීම සලකුණු කරන්න',
                  steps: ['Attendance පිටුවට ප්‍රවේශ වන්න', 'ක්‍රමය තෝරන්න (Manual/QR/Face)', 'පැමිණෙන විට Check-in', 'පිටවන විට Check-out', 'පැමිණීම් ඉතිහාසය බලන්න']
                },
                {
                  icon: Calendar,
                  title: 'නිවාඩු ඉල්ලීම්',
                  desc: 'නිවාඩු සඳහා ඉල්ලුම් කරන්න සහ ඒවායේ තත්ත්වය track කරන්න',
                  steps: ['Leave Request වෙත යන්න', 'නිවාඩු වර්ගය තෝරන්න', 'දිනයන් තෝරන්න', 'හේතුව එක් කරන්න', 'ඉල්ලීම submit කරන්න', 'අනුමත තත්ත්වය track කරන්න']
                },
                {
                  icon: TrendingUp,
                  title: 'නිවාඩු සහ පැමිණීම බලන්න',
                  desc: 'ඔබේ පැමිණීම් වාර්තා සහ නිවාඩු ශේෂය පරීක්ෂා කරන්න',
                  steps: ['View Attendance වෙත යන්න', 'දෛනික පැමිණීම බලන්න', 'නිවාඩු ශේෂය පරීක්ෂා කරන්න', 'නිවාඩු ඉතිහාසය බලන්න', 'වාර්තා download කරන්න']
                },
                {
                  icon: DollarSign,
                  title: 'Payslips',
                  desc: 'ඔබේ මාසික payslips ප්‍රවේශ කරන්න සහ download කරන්න',
                  steps: ['Payslips වෙත යන්න', 'මාසය තෝරන්න', 'Payslip විස්තර බලන්න', 'PDF download කරන්න']
                },
                {
                  icon: MessageSquare,
                  title: 'Feedback සහ Surveys',
                  desc: 'Feedback ලබා දෙන්න සහ surveys සම්පූර්ණ කරන්න',
                  steps: ['Feedback වෙත යන්න', 'Feedback submit කරන්න', 'Surveys සම්පූර්ණ කරන්න', 'පෙර submissions බලන්න']
                },
                {
                  icon: FileText,
                  title: 'සමාගම් දැන්වීම්',
                  desc: 'වැදගත් සමාගම් නිවේදන බලන්න',
                  steps: ['Notices වෙත ප්‍රවේශ වන්න', 'නව දැන්වීම් කියවන්න', 'කියවූ ලෙස සලකුණු කරන්න', 'පැරණි දැන්වීම් Archive කරන්න']
                }
              ]
            }
          ]
        },
        {
          id: 'extended-modules',
          icon: Zap,
          title: 'Extended Modules',
          content: [
            {
              heading: 'Premium විශේෂාංග',
              text: 'ඉහළ මට්ටමේ සැලැස්ම් වල ලබා ගත හැකි බලවත් extended modules සමඟ ඔබේ HR මෙහෙයුම් වැඩිදියුණු කරන්න.'
            },
            {
              heading: 'ලබා ගත හැකි Modules',
              modules: [
                {
                  icon: QrCode,
                  title: 'QR Code පැමිණීම',
                  benefits: ['ස්පර්ශ රහිත පැමිණීම සලකුණු කිරීම', 'වේගවත් check-in/check-out', 'කාල සොරකම අඩු කිරීම', 'තත්‍ය-කාලීන පැමිණීම් tracking'],
                  usage: 'කාර්යාල පිවිසුමේ දර්ශනය කරන QR codes scan කිරීමෙන් සේවකයන්ට ක්ෂණිකව පැමිණීම සලකුණු කරන්න'
                },
                {
                  icon: Camera,
                  title: 'මුහුණු හඳුනාගැනීමේ පැමිණීම',
                  benefits: ['ජෛවමිතික ආරක්ෂාව', 'Buddy punching ඉවත් කරයි', '99% නිරවද්‍යතා අනුපාතය', 'ස්පර්ශ රහිත සහ සනීපාරක්ෂිත'],
                  usage: 'AI-powered මුහුණු හඳුනාගැනීම කැමරාව දෙස බැලීමෙන් පමණක් පැමිණීම සලකුණු කරයි'
                },
                {
                  icon: MessageSquare,
                  title: 'සේවක Feedback පද්ධතිය',
                  benefits: ['සේවක engagement වැඩිදියුණු කරන්න', 'නිර්නාමික feedback එකතු කරන්න', 'තෘප්තිය මැනීම', 'දත්ත-මෙහෙයවන වැඩිදියුණු කිරීම්'],
                  usage: 'අභිරුචි surveys සාදන්න සහ වැඩ ස්ථාන සංස්කෘතිය වැඩිදියුණු කිරීමට සේවකයන්ගෙන් feedback එකතු කරන්න'
                },
                {
                  icon: Briefcase,
                  title: 'බඳවා ගැනීම් කළමනාකරණය',
                  benefits: ['සරල කරන ලද බඳවා ගැනීම', 'අයදුම්කරුවන් tracking', 'මධ්‍යගත job postings', 'වේගවත් බඳවා ගැනීමේ ක්‍රියාවලිය'],
                  usage: 'රැකියා පළ කරන්න, අයදුම් track කරන්න, interviews කාල සටහන් කරන්න සහ සම්පූර්ණ බඳවා ගැනීමේ workflow කළමනාකරණය කරන්න'
                },
                {
                  icon: Award,
                  title: 'කාර්ය සාධන සමාලෝචන',
                  benefits: ['ව්‍යුහගත ඇගයීමේ ක්‍රියාවලිය', 'සේවක වර්ධනය track කරන්න', 'ඉලක්ක සහ KPIs සකසන්න', 'කාර්ය සාධන විශ්ලේෂණ'],
                  usage: 'වරින් වර කාර්ය සාධන සමාලෝචන පවත්වන්න, ඉලක්ක සකසන්න සහ සේවක සංවර්ධනය track කරන්න'
                }
              ]
            }
          ]
        }
      ]
    }
  };

  const currentContent = content[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-[#0C397A] via-[#05668D] to-[#02C39A] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-lg rounded-2xl">
                <BookOpen className="w-16 h-16 md:w-20 md:h-20" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {currentContent.hero.title}
            </h1>
            <p className="text-xl md:text-2xl mb-3 text-white/90">
              {currentContent.hero.subtitle}
            </p>
            <p className="text-base md:text-lg text-white/75 max-w-3xl mx-auto">
              {currentContent.hero.description}
            </p>
          </div>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-2 py-4">
            <button
              onClick={() => setActiveTab('english')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'english'
                  ? 'bg-gradient-to-r from-[#02C39A] to-[#1ED292] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Globe className="w-5 h-5" />
              English
            </button>
            <button
              onClick={() => setActiveTab('sinhala')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'sinhala'
                  ? 'bg-gradient-to-r from-[#02C39A] to-[#1ED292] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Languages className="w-5 h-5" />
              සිංහල
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: THEME.dark }}>
                {activeTab === 'english' ? 'Table of Contents' : 'අන්තර්ගතය'}
              </h3>
              <nav className="space-y-2">
                {currentContent.sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-50 group"
                    >
                      <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#02C39A] transition-colors" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#02C39A] transition-colors">
                        {section.title}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Sections */}
          <div className="lg:col-span-3 space-y-8">
            {currentContent.sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id} id={section.id} className="scroll-mt-32">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-gradient-to-r from-[#0C397A] to-[#05668D] p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 backdrop-blur-lg rounded-xl">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                          {section.title}
                        </h2>
                      </div>
                    </div>

                    {/* Section Content */}
                    <div className="p-6 md:p-8 space-y-8">
                      {section.content.map((item, idx) => (
                        <div key={idx}>
                          {item.heading && (
                            <h3 className="text-xl font-bold mb-4" style={{ color: THEME.dark }}>
                              {item.heading}
                            </h3>
                          )}
                          
                          {item.text && (
                            <p className="text-gray-700 leading-relaxed mb-6">
                              {item.text}
                            </p>
                          )}

                          {item.points && (
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                              {item.points.map((point, pidx) => {
                                const PointIcon = point.icon;
                                return (
                                  <div
                                    key={pidx}
                                    className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 bg-gradient-to-br from-[#02C39A] to-[#1ED292] rounded-lg">
                                        <PointIcon className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold mb-2" style={{ color: THEME.dark }}>
                                          {point.title}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          {point.desc}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {item.steps && (
                            <div className="space-y-4">
                              {item.steps.map((step, sidx) => {
                                const StepIcon = step.icon;
                                return (
                                  <div
                                    key={sidx}
                                    className="flex gap-4 p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:border-[#02C39A] transition-all duration-300 group"
                                  >
                                    <div className="flex-shrink-0">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#02C39A] to-[#1ED292] flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                                        {step.number}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {StepIcon && <StepIcon className="w-5 h-5" style={{ color: THEME.primary }} />}
                                        <h4 className="font-bold" style={{ color: THEME.dark }}>
                                          {step.title}
                                        </h4>
                                      </div>
                                      <p className="text-gray-600">
                                        {step.desc}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {item.features && (
                            <div className="space-y-6">
                              {item.features.map((feature, fidx) => {
                                const FeatureIcon = feature.icon;
                                return (
                                  <div
                                    key={fidx}
                                    className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#02C39A] transition-all duration-300"
                                  >
                                    <div className="flex items-start gap-4 mb-4">
                                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#02C39A]/10 to-[#1ED292]/10">
                                        <FeatureIcon className="w-6 h-6" style={{ color: THEME.primary }} />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-lg font-bold mb-2" style={{ color: THEME.dark }}>
                                          {feature.title}
                                        </h4>
                                        <p className="text-gray-600 mb-4">
                                          {feature.desc}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {feature.steps && (
                                      <div className="pl-16">
                                        <p className="text-sm font-semibold text-gray-500 mb-2">
                                          {activeTab === 'english' ? 'How to use:' : 'භාවිතා කරන්නේ කෙසේද:'}
                                        </p>
                                        <ol className="space-y-2">
                                          {feature.steps.map((step, sidx) => (
                                            <li key={sidx} className="flex items-start gap-2 text-sm text-gray-700">
                                              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: THEME.primary }} />
                                              <span>{step}</span>
                                            </li>
                                          ))}
                                        </ol>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {item.modules && (
                            <div className="grid md:grid-cols-2 gap-6">
                              {item.modules.map((module, midx) => {
                                const ModuleIcon = module.icon;
                                return (
                                  <div
                                    key={midx}
                                    className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#02C39A] hover:shadow-lg transition-all duration-300"
                                  >
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#02C39A] to-[#1ED292]">
                                        <ModuleIcon className="w-6 h-6 text-white" />
                                      </div>
                                      <h4 className="text-lg font-bold" style={{ color: THEME.dark }}>
                                        {module.title}
                                      </h4>
                                    </div>
                                    
                                    <div className="space-y-3 mb-4">
                                      <p className="text-sm font-semibold" style={{ color: THEME.secondary }}>
                                        {activeTab === 'english' ? 'Benefits:' : 'ප්‍රතිලාභ:'}
                                      </p>
                                      <ul className="space-y-2">
                                        {module.benefits.map((benefit, bidx) => (
                                          <li key={bidx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                                            <span>{benefit}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <div className="pt-3 border-t border-gray-200">
                                      <p className="text-sm text-gray-600">
                                        <span className="font-semibold" style={{ color: THEME.secondary }}>
                                          {activeTab === 'english' ? 'Usage: ' : 'භාවිතය: '}
                                        </span>
                                        {module.usage}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Call to Action */}
            <div className="bg-gradient-to-b from-[#0C397A] to-[#02C39A] rounded-2xl p-8 md:p-12 text-center text-white shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {activeTab === 'english' ? 'Ready to Transform Your HR?' : 'ඔබේ HR පරිවර්තනය කිරීමට සූදානම්ද?'}
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                {activeTab === 'english' 
                  ? 'Join thousands of organizations already using CoreHive to streamline their HR operations' 
                  : 'ඔවුන්ගේ HR මෙහෙයුම් සරල කිරීමට දැනටමත් CoreHive භාවිතා කරන ආයතන දහස් ගණනකට එක්වන්න'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0C397A] rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {activeTab === 'english' ? 'Start Free Trial' : 'නොමිලේ අත්හදා බලන්න'}
                  <ChevronRight className="w-5 h-5" />
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-lg font-bold hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
                >
                  {activeTab === 'english' ? 'Learn More About Us' : 'අප ගැන වැඩිදුර දැන ගන්න'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserGuide;