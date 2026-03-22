import { apiClient } from "@/src/services/api/client";
import type {
  ApiEnvelope,
  EmployeeProfile,
  LeaveBalance,
  LeaveHistoryItem,
  LeaveType,
  AttendanceToday,
  AttendanceHistoryItem,
  FeedbackItem,
  NoticeItem,
  Survey,
  Payslip,
  SupportTicket
} from "@/src/types/models";

const unwrap = <T>(payload: ApiEnvelope<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
};

export const employeeApi = {
  async getCurrentProfile() {
    const res = await apiClient.get<ApiEnvelope<EmployeeProfile> | EmployeeProfile>(
      "/current-employee/profile"
    );
    return unwrap<EmployeeProfile>(res.data);
  },

  async updateCurrentProfile(formData: FormData) {
    const res = await apiClient.put<ApiEnvelope<EmployeeProfile> | EmployeeProfile>(
      "/current-employee/profile",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return unwrap<EmployeeProfile>(res.data);
  },

  async getLeaveTypes() {
    const res = await apiClient.get<ApiEnvelope<LeaveType[]> | LeaveType[]>(
      "/employee/leave-types"
    );
    return unwrap<LeaveType[]>(res.data) || [];
  },

  async getLeaveBalances() {
    const res = await apiClient.get<ApiEnvelope<LeaveBalance[]> | LeaveBalance[]>(
      "/current-employee/leave-balances"
    );
    return unwrap<LeaveBalance[]>(res.data) || [];
  },

  async getLeaveRequests(employeeId: number) {
    const res = await apiClient.get<ApiEnvelope<LeaveHistoryItem[]> | LeaveHistoryItem[]>(
      `/employee/leave-requests/${employeeId}`
    );
    return unwrap<LeaveHistoryItem[]>(res.data) || [];
  },

  async submitLeaveRequest(payload: {
    employeeId: number;
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    const res = await apiClient.post<ApiEnvelope<unknown> | unknown>(
      "/employee/leave-requests",
      payload
    );
    return res.data;
  },

  async getTodayAttendance() {
    const res = await apiClient.get<ApiEnvelope<AttendanceToday> | AttendanceToday>(
      "/attendance/today"
    );
    return unwrap<AttendanceToday>(res.data);
  },

  async getAttendanceHistory(startDate: string, endDate: string) {
    const res = await apiClient.get<
      ApiEnvelope<AttendanceHistoryItem[]> | AttendanceHistoryItem[]
    >("/attendance/history", { params: { startDate, endDate } });
    return unwrap<AttendanceHistoryItem[]>(res.data) || [];
  },

  async submitFeedback(payload: {
    feedbackType: string;
    rating: number;
    message: string;
  }) {
    const res = await apiClient.post("/employee/employee-feedback", payload);
    return res.data;
  },

  async getOwnFeedbacks() {
    const res = await apiClient.get<ApiEnvelope<FeedbackItem[]> | FeedbackItem[]>(
      "/employee/employee-feedback"
    );
    return unwrap<FeedbackItem[]>(res.data) || [];
  },

  async getNotices(page: number, size: number) {
    const res = await apiClient.get<ApiEnvelope<{ content: NoticeItem[]; totalPages: number }> | { content: NoticeItem[]; totalPages: number }>(
      "/notices",
      { params: { page, size } }
    );
    return unwrap<{ content: NoticeItem[]; totalPages: number }>(res.data);
  },

  async getActiveSurveys() {
    const res = await apiClient.get<ApiEnvelope<Survey[]> | Survey[]>(
      "/employee/surveys/active"
    );
    return unwrap<Survey[]>(res.data) || [];
  },

  async getSurveyDetails(surveyId: number) {
    const res = await apiClient.get<ApiEnvelope<Survey> | Survey>(
      `/employee/surveys/${surveyId}`
    );
    return unwrap<Survey>(res.data);
  },

  async hasResponded(surveyId: number) {
    const res = await apiClient.get<ApiEnvelope<boolean> | boolean>(
      `/employee/surveys/${surveyId}/has-responded`
    );
    return unwrap<boolean>(res.data);
  },

  async submitSurveyResponse(surveyId: number, answers: {
    questionId: number;
    answerText: string | null;
    selectedOption: string | null;
  }[]) {
    const res = await apiClient.post(`/employee/surveys/${surveyId}/respond`, {
      answers
    });
    return res.data;
  },

  async getEmployeePayslips() {
    const res = await apiClient.get<ApiEnvelope<Payslip[]> | Payslip[]>(
      "/employee/payslips"
    );
    return (unwrap<Payslip[]>(res.data) || []).filter((p) => p.status === "APPROVED");
  },

  async downloadPayslipPdf(payslipId: number) {
    const res = await apiClient.get(`/employee/payslips/${payslipId}/pdf`, {
      responseType: "arraybuffer"
    });
    return res.data as ArrayBuffer;
  },

  async createSupportTicket(payload: {
    ticketType: "SUPPORT_REQUEST" | "BUG_REPORT" | "SYSTEM_FEEDBACK";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    subject: string;
    description: string;
  }) {
    const res = await apiClient.post("/support-tickets", payload);
    return res.data;
  },

  async getMySupportTickets() {
    const res = await apiClient.get<ApiEnvelope<SupportTicket[]> | SupportTicket[]>(
      "/support-tickets/my-tickets"
    );
    return unwrap<SupportTicket[]>(res.data) || [];
  }
};
