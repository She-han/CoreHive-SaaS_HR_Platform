export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId: number;
  email: string;
  userType: string;
  role: string;
  organizationUuid?: string;
  organizationName?: string;
  moduleConfig?: Record<string, boolean>;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
  code?: number;
};

export type EmployeeProfile = {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  designation?: string;
  nationalId?: string;
  dateOfJoining?: string;
  salaryType?: string;
  basicSalary?: number;
  leaveCount?: number;
  isActive?: boolean;
  profileImage?: string;
  department?: { name?: string };
  departmentId?: number;
};

export type LeaveType = {
  id: number;
  name: string;
};

export type LeaveBalance = {
  id: number;
  name: string;
  assigned: number;
  used: number;
  balance: number;
};

export type LeaveHistoryItem = {
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
};

export type AttendanceToday = {
  checkInTime?: string;
  checkOutTime?: string;
  status?: string;
};

export type AttendanceHistoryItem = {
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
};

export type FeedbackItem = {
  id: number;
  feedbackType: string;
  rating: number;
  message: string;
  markedAsRead?: boolean;
  reply?: string;
  repliedByName?: string;
  repliedAt?: string;
  createdAt: string;
};

export type NoticeItem = {
  id: number;
  title: string;
  content: string;
  status: string;
  priority?: string;
  publishAt: string;
  expireAt?: string;
};

export type SurveyQuestion = {
  id: number;
  questionText: string;
  questionType: "TEXT" | "MCQ" | "RATING";
  options?: string;
};

export type Survey = {
  id: number;
  title: string;
  description?: string;
  isAnonymous?: boolean;
  endDate?: string;
  questions?: SurveyQuestion[];
};

export type Payslip = {
  id: number;
  month: number;
  year: number;
  status: string;
  employeeCode?: string;
  employeeName?: string;
  designation?: string;
  departmentName?: string;
  basicSalary?: number;
  totalAllowances?: number;
  totalDeductions?: number;
  grossSalary?: number;
  netSalary?: number;
  otHours?: number;
  otPay?: number;
  allowancesBreakdown?: { name: string; amount: number }[];
  deductionsBreakdown?: { name: string; amount: number }[];
};

export type SupportTicket = {
  id: number;
  ticketType: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  reply?: string;
  createdAt: string;
};
