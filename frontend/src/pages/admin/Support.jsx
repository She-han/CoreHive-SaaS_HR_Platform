import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  MessageCircle,
  Bug,
  FileText,
  Search,
  Filter,
  Mail,
  User,
  Clock,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getAllTickets,
  getTicketsByType,
  getTicketsByStatus,
  searchTickets,
  markTicketAsRead,
  replyToTicket,
  updateTicketStatus,
  deleteTicket,
  getUnreadCount,
} from "../../api/supportTicketApi";
import DashboardLayout from "../../components/layout/DashboardLayout";

const Support = () => {
  console.log("🔵 Support component rendering");
  
  const { user } = useSelector((state) => state.auth);
  console.log("🔵 Support - user from Redux:", user);
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    ticketType: "ALL",
    status: "ALL",
    searchQuery: "",
  });

  const [replyModal, setReplyModal] = useState({
    isOpen: false,
    ticket: null,
    reply: "",
  });

  useEffect(() => {
    console.log("=== Support.jsx useEffect triggered ===");
    console.log("Current user:", user);
    console.log("User role:", user?.role);
    console.log("Filters:", filters);
    console.log("Current page:", currentPage);
    
    if (user) {
      fetchTickets();
      fetchUnreadCount();
    } else {
      console.log("User not loaded yet");
    }
  }, [user, filters, currentPage]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let response;

      if (filters.searchQuery.trim()) {
        response = await searchTickets(filters.searchQuery, currentPage, 10);
      } else if (filters.ticketType !== "ALL") {
        response = await getTicketsByType(filters.ticketType, currentPage, 10);
      } else if (filters.status !== "ALL") {
        response = await getTicketsByStatus(filters.status, currentPage, 10);
      } else {
        response = await getAllTickets(currentPage, 10);
      }

      console.log("Support Tickets Response:", response);
      console.log("Response data type:", typeof response.data);
      console.log("Response data:", response.data);

      if (response.status === "success") {
        // Handle Page object structure
        let ticketsData = [];
        let pages = 0;
        
        if (response.data && typeof response.data === 'object') {
          // Check if it's a Spring Page object
          if (response.data.content && Array.isArray(response.data.content)) {
            ticketsData = response.data.content;
            pages = response.data.totalPages || 0;
            console.log("Parsed as Page object");
          } 
          // Check if it's directly an array
          else if (Array.isArray(response.data)) {
            ticketsData = response.data;
            pages = 1;
            console.log("Parsed as direct array");
          }
          // Check if data has tickets property
          else if (response.data.tickets && Array.isArray(response.data.tickets)) {
            ticketsData = response.data.tickets;
            pages = response.data.totalPages || 1;
            console.log("Parsed as tickets array");
          }
        }
        
        console.log("Final Tickets Data:", ticketsData);
        console.log("Total tickets:", ticketsData.length);
        console.log("Total pages:", pages);
        
        setTickets(ticketsData);
        setTotalPages(pages);
      } else {
        console.log("Response status not success:", response.status);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch tickets";
      console.error("Error details:", errorMessage);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.status === "success") {
        setUnreadCount(response.data);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleMarkAsRead = async (ticketId) => {
    try {
      const response = await markTicketAsRead(ticketId);
      if (response.status === "success") {
        fetchTickets();
        fetchUnreadCount();
        Swal.fire({
          icon: "success",
          title: "Marked as Read",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to mark as read",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleOpenReplyModal = (ticket) => {
    setReplyModal({
      isOpen: true,
      ticket: ticket,
      reply: ticket.adminReply || "",
    });
  };

  const handleCloseReplyModal = () => {
    setReplyModal({
      isOpen: false,
      ticket: null,
      reply: "",
    });
  };

  const handleSubmitReply = async () => {
    if (!replyModal.reply.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Reply Required",
        text: "Please enter a reply message",
        confirmButtonColor: "#02C39A",
      });
      return;
    }

    try {
      const response = await replyToTicket(
        replyModal.ticket.id,
        replyModal.reply
      );
      if (response.status === "success") {
        fetchTickets();
        handleCloseReplyModal();
        Swal.fire({
          icon: "success",
          title: "Reply Sent!",
          text: "Your reply has been sent to the user",
          confirmButtonColor: "#02C39A",
          timer: 2000,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send reply",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await updateTicketStatus(ticketId, newStatus);
      if (response.status === "success") {
        fetchTickets();
        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `Ticket status changed to ${newStatus}`,
          confirmButtonColor: "#02C39A",
          timer: 2000,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update status",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: "Delete Ticket?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteTicket(ticketId);
        if (response.status === "success") {
          fetchTickets();
          fetchUnreadCount();
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Ticket has been deleted",
            confirmButtonColor: "#02C39A",
            timer: 2000,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete ticket",
          confirmButtonColor: "#EF4444",
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "LOW":
        return "bg-blue-100 text-blue-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "SUPPORT_REQUEST":
        return <MessageCircle className="w-5 h-5 text-[#02C39A]" />;
      case "BUG_REPORT":
        return <Bug className="w-5 h-5 text-red-500" />;
      case "SYSTEM_FEEDBACK":
        return <FileText className="w-5 h-5 text-[#05668D]" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0C397A]">
                Support Tickets
              </h1>
              <p className="text-gray-600 mt-2">
                Manage user support requests, bug reports, and feedback
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {unreadCount} Unread Ticket{unreadCount !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filters.ticketType}
                  onChange={(e) =>
                    setFilters({ ...filters, ticketType: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent appearance-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="SUPPORT_REQUEST">Support Requests</option>
                  <option value="BUG_REPORT">Bug Reports</option>
                  <option value="SYSTEM_FEEDBACK">System Feedback</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent appearance-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              
      
            </div>

          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-[#02C39A] animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No tickets found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-lg shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                    !ticket.isRead ? "border-[#02C39A]" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Type Icon */}
                      <div className="mt-1">{getTypeIcon(ticket.ticketType)}</div>

                      {/* Ticket Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-[#0C397A] text-lg">
                            {ticket.subject}
                          </h3>
                          {!ticket.isRead && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
                              NEW
                            </span>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status.replace("_", " ")}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {ticket.ticketType.replace("_", " ")}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-4">{ticket.description}</p>

                        {/* User Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{ticket.userName}</span>
                            <span className="text-gray-400">
                              ({ticket.userRole})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{ticket.userEmail}</span>
                          </div>
                          {ticket.organizationName && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{ticket.organizationName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(ticket.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Admin Reply */}
                        {ticket.adminReply && (
                          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-semibold text-green-800">
                                Admin Response
                              </span>
                              {ticket.repliedBy && (
                                <span className="text-sm text-green-600">
                                  by {ticket.repliedBy}
                                </span>
                              )}
                            </div>
                            <p className="text-green-900">{ticket.adminReply}</p>
                            {ticket.repliedAt && (
                              <p className="text-xs text-green-600 mt-2">
                                {new Date(ticket.repliedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      {!ticket.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(ticket.id)}
                          className="flex items-center gap-2 px-3 py-2 text-[#02C39A] border border-[#02C39A] rounded-lg hover:bg-[#F1FDF9] transition-colors text-sm"
                          title="Mark as Read"
                        >
                          <Eye className="w-4 h-4" />
                          Mark Read
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenReplyModal(ticket)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#02C39A] text-white rounded-lg hover:bg-[#029c7f] transition-colors text-sm"
                      >
                        <Send className="w-4 h-4" />
                        Reply
                      </button>

                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusChange(ticket.id, e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#02C39A] focus:border-transparent"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>

                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Reply Modal */}
        {replyModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#0C397A]">
                  Reply to Ticket
                </h2>
                <p className="text-gray-600 mt-1">
                  {replyModal.ticket?.subject}
                </p>
              </div>

              <div className="p-6">
                {/* Original Ticket */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">Original Message:</p>
                  <p className="text-gray-800">{replyModal.ticket?.description}</p>
                </div>

                {/* Reply Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply *
                  </label>
                  <textarea
                    value={replyModal.reply}
                    onChange={(e) =>
                      setReplyModal({ ...replyModal, reply: e.target.value })
                    }
                    placeholder="Type your response here..."
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02C39A] focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={handleCloseReplyModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  className="px-6 py-2 bg-[#02C39A] text-white rounded-lg hover:bg-[#029c7f] transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Support;
