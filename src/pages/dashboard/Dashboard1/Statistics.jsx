import { Row, Col, Button, Card, Modal, Form } from "react-bootstrap";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import StatisticsWidget from "../../../components/StatisticsWidget";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useLogoColor } from "@/context/LogoColorContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";

// Utility function for debouncing
const createDebouncer = () => {
  let timeout;
  return (func, wait) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(), wait);
  };
};

// Pagination Component for Bookings
const BookingsPagination = ({ data, itemsPerPage = 15, renderTable }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Show 5 page numbers at a time
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div>
      {/* Render the table with paginated data */}
      {renderTable(currentItems)}
      
      {/* Pagination Controls */}
      {data.length > itemsPerPage && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <small className="text-muted">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of {data.length} entries
            </small>
          </div>
          
          <nav aria-label="Bookings pagination">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  <i className="fe-chevron-left"></i> Previous
                </button>
              </li>
              
              {getPageNumbers().map((page, index) => (
                <li 
                  key={index} 
                  className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                >
                  {page === '...' ? (
                    <span className="page-link">...</span>
                  ) : (
                    <button 
                      className="page-link" 
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  )}
                </li>
              ))}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next <i className="fe-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

const Statistics = ({ 
  categories, 
  locations, 
  selectedCategoryId, 
  selectedLocationId, 
  onCategoryChange, 
  onLocationChange,
  isLoadingFilters,
  filtersError 
}) => {
  const { user } = useAuthContext();
  const { tenantSlug } = useParams();
  const { colour: primary } = useLogoColor();

  // Refs for cleanup and tracking
  const isMounted = useRef(true);
  const abortControllers = useRef(new Set());
  const debouncer = useRef(createDebouncer());

  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    periodA: { bookings: 0, payments: 0, hours: 0 },
    periodB: { bookings: 0, payments: 0, hours: 0 },
    loading: false,
    error: null,
  });

  // Payment analytics state
  const [paymentAnalytics, setPaymentAnalytics] = useState({
    duration: {
      totalAmountForDurationA: 0,
      totalAmountForDurationB: 0,
      percentage: 0
    },
    account: {
      totalAccountProcessedA: 0,
      totalAccountProcessedB: 0,
      percentage: 0
    },
    loading: false,
    error: null,
  });

  // Summary stats state
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalPayments: 0,
    totalAmount: 0,
    loading: true,
    error: null,
  });

  // Today's bookings and payments state
  const [todayBookings, setTodayBookings] = useState({
    count: 0,
    totalFees: 0,
    data: [],
    loading: true,
    error: null
  });

  // Booking filter modal state
  const [showBookingFilterModal, setShowBookingFilterModal] = useState(false);
  const [showBookingsDataModal, setShowBookingsDataModal] = useState(false);
  const [bookingFilter, setBookingFilter] = useState({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(new Date().setHours(23, 59, 0, 0)),
    bookingType: 'today'
  });

  // Chart view states
  const [financeChartView, setFinanceChartView] = useState("bar");
  const [bookingChartView, setBookingChartView] = useState("bar");
  const [hoursChartView, setHoursChartView] = useState("bar");
  const [paymentChartView, setPaymentChartView] = useState("bar");

  // Analytics configuration state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [comparisonType, setComparisonType] = useState("yearly");
  
  // Period A dates (last year by default) - with time
  const initialPeriodAStart = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const initialPeriodAEnd = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    date.setMonth(11, 31);
    date.setHours(23, 59, 59, 999);
    return date;
  }, []);

  const initialPeriodBStart = useMemo(() => {
    const date = new Date();
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const initialPeriodBEnd = useMemo(() => {
    const date = new Date();
    date.setMonth(11, 31);
    date.setHours(23, 59, 59, 999);
    return date;
  }, []);

  const [periodAStart, setPeriodAStart] = useState(initialPeriodAStart);
  const [periodAEnd, setPeriodAEnd] = useState(initialPeriodAEnd);
  const [periodBStart, setPeriodBStart] = useState(initialPeriodBStart);
  const [periodBEnd, setPeriodBEnd] = useState(initialPeriodBEnd);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current.clear();
    };
  }, []);

  // Helper to create abortable fetch with authorization
  const abortableFetch = useCallback((url, options = {}) => {
    const controller = new AbortController();
    abortControllers.current.add(controller);
    
    return fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json',
      },
    }).finally(() => {
      abortControllers.current.delete(controller);
    });
  }, [user?.token]);

  // Format date for API with time (YYYY-MM-DD HH:MM:SS)
  const formatAPIDateTime = useCallback((date) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }, []);

  // Calculate percentage change manually
  const calculatePercentageChange = useCallback((current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, []);

  // Fetch today's bookings with filters - UPDATED to calculate total fees
  const fetchTodayBookings = useCallback(async (startDate, endDate, bookingType) => {
    try {
      setTodayBookings(prev => ({ ...prev, loading: true, error: null }));
      
      const formattedStart = formatAPIDateTime(startDate);
      const formattedEnd = formatAPIDateTime(endDate);
      
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/get?start_time=${encodeURIComponent(formattedStart)}&end_time=${encodeURIComponent(formattedEnd)}&booking_type=${bookingType}`;
      
      const res = await abortableFetch(url, { method: "GET" });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch bookings: ${res.status}`);
      }
      
      const response = await res.json();
      const bookingsArray = response?.data || [];
      
      // Calculate total fees from all bookings
      const totalFees = bookingsArray.reduce((sum, booking) => {
        return sum + (parseFloat(booking.fee) || 0);
      }, 0);
      
      // Transform the API data to match our table structure
      const transformedBookings = bookingsArray.map(booking => {
        // Parse chosen_days if it's a string
        let chosenDays = [];
        try {
          chosenDays = typeof booking.chosen_days === 'string' 
            ? JSON.parse(booking.chosen_days) 
            : booking.chosen_days || [];
        } catch (e) {
          console.error('Error parsing chosen_days:', e);
        }

        // Get the first day's start time for display
        const firstDay = chosenDays[0] || {};
        const bookingDate = firstDay.start_time ? new Date(firstDay.start_time) : new Date(booking.created_at);
        
        // Determine status based on book_status
        let status = booking.book_status || 'unknown';
        let statusVariant = 'secondary';
        
        switch(status.toLowerCase()) {
          case 'ongoing':
            statusVariant = 'success';
            break;
          case 'awaiting':
            statusVariant = 'warning';
            break;
          case 'expired':
          case 'cancelled':
            statusVariant = 'danger';
            break;
          default:
            statusVariant = 'secondary';
        }

        return {
          id: booking.id,
          booking_ref: booking.booked_ref?.booked_ref || `BK-${booking.id}`,
          spot_id: booking.spot_id,
          user_id: booking.user_id,
          customer_name: `User ${booking.user_id}`,
          date: bookingDate,
          start_time: booking.start_time,
          expiry_day: booking.expiry_day,
          fee: parseFloat(booking.fee) || 0,
          status: booking.book_status,
          statusVariant: statusVariant,
          type: booking.type,
          invoice_ref: booking.invoice_ref,
          spot: booking.spot,
          space: booking.spot?.space,
          category: booking.spot?.space?.category,
          location_id: booking.spot?.location_id,
          floor_id: booking.spot?.floor_id
        };
      });
      
      if (isMounted.current) {
        setTodayBookings({
          count: transformedBookings.length,
          totalFees: totalFees,
          data: transformedBookings,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      if (isMounted.current) {
        setTodayBookings(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
      console.error("Error fetching today's bookings:", error);
    }
  }, [abortableFetch, tenantSlug, formatAPIDateTime]);

  // Fetch analytics data with selected filters and authorization
  const fetchAnalyticsData = useCallback(async () => {
    if (!selectedCategoryId || !selectedLocationId) {
      return;
    }

    try {
      setAnalyticsData(prev => ({ ...prev, loading: true, error: null }));

      const startTimeA = formatAPIDateTime(periodAStart);
      const endTimeA = formatAPIDateTime(periodAEnd);
      const startTimeB = formatAPIDateTime(periodBStart);
      const endTimeB = formatAPIDateTime(periodBEnd);

      // Build URL with all parameters
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/list?startTimeB=${encodeURIComponent(startTimeB)}&endTimeB=${encodeURIComponent(endTimeB)}&startTimeA=${encodeURIComponent(startTimeA)}&endTimeA=${encodeURIComponent(endTimeA)}&locationId=${selectedLocationId}&categoryId=${selectedCategoryId}`;
      

      const res = await abortableFetch(url, { method: "GET" });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Analytics fetch failed:", res.status, errorText);
        throw new Error(`Failed to fetch analytics data: ${res.status}`);
      }
      
      const data = await res.json();

      if (isMounted.current) {
        setAnalyticsData({
          periodA: {
            bookings: data.booking?.bookingA || 0,
            payments: data.payment?.paymentA || 0,
            hours: data.hour?.hourA || 0,
          },
          periodB: {
            bookings: data.booking?.bookingB || 0,
            payments: data.payment?.paymentB || 0,
            hours: data.hour?.hourB || 0,
          },
          loading: false,
          error: null,
        });

        // Also update summary stats
        setStats({
          totalCategories: data.booking?.bookingB || 0,
          totalPayments: data.payment?.paymentB || 0,
          totalAmount: data.hour?.hourB || 0,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      if (isMounted.current) {
        setAnalyticsData(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
      console.error("Error fetching analytics data:", error);
    }
  }, [abortableFetch, tenantSlug, periodAStart, periodAEnd, periodBStart, periodBEnd, selectedCategoryId, selectedLocationId, formatAPIDateTime]);

  // Fetch payment analytics data
  const fetchPaymentAnalytics = useCallback(async () => {
    try {
      setPaymentAnalytics(prev => ({ ...prev, loading: true, error: null }));

      const startTimeA = formatAPIDateTime(periodAStart);
      const endTimeA = formatAPIDateTime(periodAEnd);
      const startTimeB = formatAPIDateTime(periodBStart);
      const endTimeB = formatAPIDateTime(periodBEnd);

      // Build URL for payment analytics
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/payment?startTimeA=${encodeURIComponent(startTimeA)}&endTimeA=${encodeURIComponent(endTimeA)}&startTimeB=${encodeURIComponent(startTimeB)}&endTimeB=${encodeURIComponent(endTimeB)}`;

      const res = await abortableFetch(url, { method: "GET" });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Payment analytics fetch failed:", res.status, errorText);
        throw new Error(`Failed to fetch payment analytics data: ${res.status}`);
      }
      
      const data = await res.json();

      if (isMounted.current) {
        setPaymentAnalytics({
          duration: {
            totalAmountForDurationA: data.duration?.totalAmountForDurationA || 0,
            totalAmountForDurationB: data.duration?.totalAmountForDurationB || 0,
            percentage: data.duration?.percentage || 0
          },
          account: {
            totalAccountProcessedA: data.account?.totalAccountProcessedA || 0,
            totalAccountProcessedB: data.account?.totalAccountProcessedB || 0,
            percentage: data.account?.percentage || 0
          },
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      if (isMounted.current) {
        setPaymentAnalytics(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
      console.error("Error fetching payment analytics data:", error);
    }
  }, [abortableFetch, tenantSlug, periodAStart, periodAEnd, periodBStart, periodBEnd, formatAPIDateTime]);

  // Fetch today's bookings on mount and when filters change
  useEffect(() => {
    fetchTodayBookings(bookingFilter.startDate, bookingFilter.endDate, bookingFilter.bookingType);
  }, [bookingFilter.startDate, bookingFilter.endDate, bookingFilter.bookingType, fetchTodayBookings]);

  // Fetch all analytics when filters are ready or changed
  useEffect(() => {
    if (selectedCategoryId && selectedLocationId) {
      fetchAnalyticsData();
      fetchPaymentAnalytics();
    }
  }, [selectedCategoryId, selectedLocationId, fetchAnalyticsData, fetchPaymentAnalytics]);

  // Fetch analytics when date ranges change (with debounce)
  useEffect(() => {
    if (!selectedCategoryId || !selectedLocationId) {
      return;
    }
    
    const handler = setTimeout(() => {
      fetchAnalyticsData();
      fetchPaymentAnalytics();
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [periodAStart, periodAEnd, periodBStart, periodBEnd, selectedCategoryId, selectedLocationId, fetchAnalyticsData, fetchPaymentAnalytics]);

  // Handle booking filter change
  const handleBookingFilterChange = useCallback((newFilter) => {
    setBookingFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Handle apply booking filter
  const handleApplyBookingFilter = useCallback(() => {
    fetchTodayBookings(bookingFilter.startDate, bookingFilter.endDate, bookingFilter.bookingType);
    setShowBookingFilterModal(false);
  }, [bookingFilter, fetchTodayBookings]);

  // Handle reset to today
  const handleBackToToday = useCallback(() => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 0, 0));
    
    const todayFilter = {
      bookingType: 'today',
      startDate: startOfDay,
      endDate: endOfDay
    };
    
    setBookingFilter(todayFilter);
    fetchTodayBookings(startOfDay, endOfDay, 'today');
  }, [fetchTodayBookings]);

  // Handle view bookings data
  const handleViewBookingsData = useCallback(() => {
    setShowBookingsDataModal(true);
  }, []);

  // Get title based on filter
  const getTitleText = useCallback(() => {
    switch(bookingFilter.bookingType) {
      case 'today':
        return "Total Bookings For Today";
      case 'valid':
        return "Valid Bookings";
      case 'expired':
        return "Expired Bookings";
      case 'past':
        return "Past Bookings";
      case 'all':
        return "All Bookings";
      default:
        return "Bookings";
    }
  }, [bookingFilter.bookingType]);

  // Prepare chart data
  const getFinanceChartData = useCallback(() => {
    return [
      {
        name: "Period A",
        payments: analyticsData.periodA.payments,
        fill: "#6c757d"
      },
      {
        name: "Period B",
        payments: analyticsData.periodB.payments,
        fill: primary
      }
    ];
  }, [analyticsData.periodA.payments, analyticsData.periodB.payments, primary]);

  const getBookingChartData = useCallback(() => {
    return [
      {
        name: "Period A",
        bookings: analyticsData.periodA.bookings,
        fill: "#6c757d"
      },
      {
        name: "Period B",
        bookings: analyticsData.periodB.bookings,
        fill: primary
      }
    ];
  }, [analyticsData.periodA.bookings, analyticsData.periodB.bookings, primary]);

  const getHoursChartData = useCallback(() => {
    return [
      {
        name: "Period A",
        hours: analyticsData.periodA.hours,
        fill: "#6c757d"
      },
      {
        name: "Period B",
        hours: analyticsData.periodB.hours,
        fill: primary
      }
    ];
  }, [analyticsData.periodA.hours, analyticsData.periodB.hours, primary]);

  const getPaymentChartData = useCallback(() => {
    return [
      {
        name: "Period A",
        amount: paymentAnalytics.duration.totalAmountForDurationA,
        fill: "#6c757d"
      },
      {
        name: "Period B",
        amount: paymentAnalytics.duration.totalAmountForDurationB,
        fill: primary
      }
    ];
  }, [paymentAnalytics.duration.totalAmountForDurationA, paymentAnalytics.duration.totalAmountForDurationB, primary]);

  const getPaymentPieChartData = useCallback(() => {
    return [
      { name: "Period A", value: paymentAnalytics.duration.totalAmountForDurationA, color: "#6c757d" },
      { name: "Period B", value: paymentAnalytics.duration.totalAmountForDurationB, color: primary }
    ];
  }, [paymentAnalytics.duration.totalAmountForDurationA, paymentAnalytics.duration.totalAmountForDurationB, primary]);

  const getPieChartData = useCallback((metric) => {
    return [
      { name: "Period A", value: analyticsData.periodA[metric], color: "#6c757d" },
      { name: "Period B", value: analyticsData.periodB[metric], color: primary }
    ];
  }, [analyticsData.periodA, analyticsData.periodB, primary]);

  // Apply comparison type presets with time
  const applyComparisonPreset = useCallback((type) => {
    const now = new Date();
    const year = now.getFullYear();

    switch (type) {
      case "yearly":
        setPeriodAStart(new Date(year - 1, 0, 1, 0, 0, 0));
        setPeriodAEnd(new Date(year - 1, 11, 31, 23, 59, 59));
        setPeriodBStart(new Date(year, 0, 1, 0, 0, 0));
        setPeriodBEnd(new Date(year, 11, 31, 23, 59, 59));
        break;

      case "monthly":
        const lastMonth = new Date(year, now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(year, now.getMonth(), 0);
        
        setPeriodAStart(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1, 0, 0, 0));
        setPeriodAEnd(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), lastMonthEnd.getDate(), 23, 59, 59));
        setPeriodBStart(new Date(year, now.getMonth(), 1, 0, 0, 0));
        setPeriodBEnd(new Date(year, now.getMonth() + 1, 0, 23, 59, 59));
        break;

      case "quarterly":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const lastQuarterMonth = currentQuarter === 0 ? 9 : (currentQuarter - 1) * 3;
        const currentQuarterMonth = currentQuarter * 3;
        
        const getQuarterEndDay = (year, month) => {
          if (month === 1) return 30; // April
          if (month === 4) return 30; // July
          if (month === 7) return 30; // October
          return 31; // January
        };
        
        setPeriodAStart(new Date(year, lastQuarterMonth, 1, 0, 0, 0));
        setPeriodAEnd(new Date(year, lastQuarterMonth + 2, getQuarterEndDay(year, lastQuarterMonth), 23, 59, 59));
        setPeriodBStart(new Date(year, currentQuarterMonth, 1, 0, 0, 0));
        setPeriodBEnd(new Date(year, currentQuarterMonth + 2, getQuarterEndDay(year, currentQuarterMonth), 23, 59, 59));
        break;

      case "custom":
        break;
    }
  }, []);

  // Handle filter changes
  const handleCategoryChange = useCallback((e) => {
    onCategoryChange(e.target.value);
  }, [onCategoryChange]);

  const handleLocationChange = useCallback((e) => {
    onLocationChange(e.target.value);
  }, [onLocationChange]);

  // Handle comparison type change
  const handleComparisonTypeChange = useCallback((type) => {
    setComparisonType(type);
    applyComparisonPreset(type);
  }, [applyComparisonPreset]);

  // Handle analytics search
  const handleAnalyticsSearch = useCallback(() => {
    fetchAnalyticsData();
    fetchPaymentAnalytics();
    setShowAnalyticsModal(false);
  }, [fetchAnalyticsData, fetchPaymentAnalytics]);

  // Render chart function
  const renderChart = useCallback((section, chartView, data, metric, title, isPayment = false) => {
    const pieData = isPayment ? getPaymentPieChartData() : getPieChartData(metric);

    switch (chartView) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={metric} fill={primary} name={title} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={metric} stroke={primary} strokeWidth={2} name={title} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey={metric} stroke={primary} fill={primary} name={title} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radial':
        const total = pieData.reduce((sum, item) => sum + item.value, 0);
        const radialData = pieData.map(item => ({
          ...item,
          percentage: total > 0 ? (item.value / total) * 100 : 0
        }));
        
        return (
          <Row>
            <Col md={7}>
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="10%"
                  outerRadius="80%"
                  barSize={15}
                  data={radialData}
                >
                  <RadialBar
                    minAngle={15}
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                    background
                    clockWise
                    dataKey="percentage"
                  />
                  <Legend
                    iconSize={8}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: 10 }}
                  />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </Col>
            <Col md={5}>
              <div className="mt-3">
                <h6 className="text-muted mb-2">Distribution</h6>
                {radialData.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-1 small">
                    <span>
                      <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: item.color, borderRadius: '50%', marginRight: 5 }}></span>
                      {item.name}
                    </span>
                    <span>
                      <strong>{item.value.toLocaleString()}</strong> ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  }, [getPieChartData, getPaymentPieChartData, primary]);

  // Loading state
  if (isLoadingFilters) {
    return (
      <Row>
        <Col>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading filters...</span>
            </div>
            <p className="mt-2">Loading categories and locations...</p>
          </div>
        </Col>
      </Row>
    );
  }

  if (filtersError) {
    return (
      <Row>
        <Col>
          <div className="text-center py-5 text-danger">
            <i className="fe-alert-triangle fs-1"></i>
            <p className="mt-2">Error loading filters: {filtersError}</p>
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      {/* Filter Row */}
      <Col md={12} className="mb-4">
        <Card>
          <Card.Body>
            <Row>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Select Category</Form.Label>
                  <Form.Select 
                    value={selectedCategoryId || ''} 
                    onChange={handleCategoryChange}
                    disabled={categories.length === 0}
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category || cat.name || `Category ${cat.id}`}
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Select Location</Form.Label>
                  <Form.Select 
                    value={selectedLocationId || ''} 
                    onChange={handleLocationChange}
                    disabled={locations.length === 0}
                  >
                    {locations.length === 0 ? (
                      <option value="">No locations available</option>
                    ) : (
                      locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name || loc.location_name || `Location ${loc.id}`}
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button 
                  variant="primary" 
                  onClick={() => {
                    fetchAnalyticsData();
                    fetchPaymentAnalytics();
                    fetchTodayBookings(bookingFilter.startDate, bookingFilter.endDate, bookingFilter.bookingType);
                  }}
                  style={{ backgroundColor: primary, borderColor: primary }}
                  className="w-100"
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
      
      {/* StatisticsWidget Cards */}
      <Col md={6} xl={6}>
        <StatisticsWidget
          variant="primary"
          description="Total Bookings (Current Period)"
          stats={stats.totalCategories}
          icon="fe-list"
        />
      </Col>
      <Col md={6} xl={6}>
        <StatisticsWidget
          variant="success"
          description="Total Payment Amount in all Categories"
          stats={paymentAnalytics.duration.totalAmountForDurationB}
          icon="fe-credit-card"
        />
      </Col>
      <Col md={6} xl={6}>
        <StatisticsWidget
          variant="info"
          description="Total Hours Booked (Current Period)"
          stats={stats.totalAmount}
          icon="fe-clock"
        />
      </Col>
      <Col md={6} xl={6}>
        <StatisticsWidget
          variant="warning"
          description="Accounts Processed in all Categories"
          stats={paymentAnalytics.account.totalAccountProcessedB}
          icon="fe-users"
        />
      </Col>
      
      {/* STYLED BOOKINGS CARD */}
      <Col md={6} xl={6}>
        <Card className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div style={{ fontWeight: "bold" }}>
                  {getTitleText()}
                  {bookingFilter.bookingType !== 'today' && (
                    <> from {format(bookingFilter.startDate, "MMM dd, yyyy HH:mm")} to {format(bookingFilter.endDate, "MMM dd, yyyy HH:mm")}</>
                  )}
                </div>
                
                <div style={{ fontSize: "2rem" }}>
                  {todayBookings.loading ? (
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : todayBookings.error ? (
                    <span className="text-danger small">Error loading</span>
                  ) : (
                    todayBookings.count.toLocaleString()
                  )}
                </div>

                {bookingFilter.bookingType !== 'today' && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-2"
                    onClick={handleBackToToday}
                  >
                    Back to Today
                  </Button>
                )}
              </div>

              <div className="d-flex flex-column align-items-end">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mb-2"
                  onClick={() => setShowBookingFilterModal(true)}
                >
                  Filter Bookings
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewBookingsData}
                  style={{backgroundColor: primary, borderColor: primary}}
                >
                  View Bookings Data
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* STYLED PAYMENTS CARD - Now shows total fees from bookings API */}
      <Col md={6} xl={6}>
        <Card className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div style={{ fontWeight: "bold" }}>
                  Total Payments Received Today
                  {bookingFilter.bookingType !== 'today' && (
                    <> from {format(bookingFilter.startDate, "MMM dd, yyyy HH:mm")} to {format(bookingFilter.endDate, "MMM dd, yyyy HH:mm")}</>
                  )}
                </div>
                
                <div style={{ fontSize: "2rem" }}>
                  {todayBookings.loading ? (
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : todayBookings.error ? (
                    <span className="text-danger small">Error loading</span>
                  ) : (
                    `₦${todayBookings.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </div>

                {bookingFilter.bookingType !== 'today' && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-2"
                    onClick={handleBackToToday}
                  >
                    Back to Today
                  </Button>
                )}
              </div>

              <div className="d-flex flex-column align-items-end">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mb-2"
                  onClick={() => setShowBookingFilterModal(true)}
                >
                  Filter Payments
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewBookingsData}
                  style={{backgroundColor: primary, borderColor: primary}}
                >
                  View Payment Details
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      {/* Payment Analytics Section */}
      <Col md={12} className="mb-4">
        <Card>
          <Card.Header className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fe-dollar-sign me-2" style={{ color: primary }}></i>
                Payment Analytics (All Categories & Locations)
              </h5>
              <div className="d-flex gap-2">
                <div className="btn-group" role="group">
                  <Button 
                    variant={paymentChartView === 'bar' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPaymentChartView('bar')}
                    title="Bar Chart"
                  >
                    <i className="fe-bar-chart-2"></i>
                  </Button>
                  <Button 
                    variant={paymentChartView === 'line' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPaymentChartView('line')}
                    title="Line Chart"
                  >
                    <i className="fe-trending-up"></i>
                  </Button>
                  <Button 
                    variant={paymentChartView === 'area' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPaymentChartView('area')}
                    title="Area Chart"
                  >
                    <i className="fe-activity"></i>
                  </Button>
                  <Button 
                    variant={paymentChartView === 'pie' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPaymentChartView('pie')}
                    title="Pie Chart"
                  >
                    <i className="fe-pie-chart"></i>
                  </Button>
                  <Button 
                    variant={paymentChartView === 'radial' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPaymentChartView('radial')}
                    title="Radial Chart"
                  >
                    <i className="fe-target"></i>
                  </Button>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowAnalyticsModal(true)}
                >
                  Configure Dates
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {paymentAnalytics.loading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Loading payment data...
              </div>
            ) : paymentAnalytics.error ? (
              <div className="text-center py-3 text-danger">Error: {paymentAnalytics.error}</div>
            ) : (
              <>
                {renderChart('payment', paymentChartView, getPaymentChartData(), 'amount', 'Payment Amount ($)', true)}
                
                <div className="row mt-3">
                  <div className="col-6 text-center">
                    <div className="text-muted small">Period A</div>
                    <h5>₦{paymentAnalytics.duration.totalAmountForDurationA.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h5>
                    <small className="text-muted">Accounts: {paymentAnalytics.account.totalAccountProcessedA}</small>
                  </div>
                  <div className="col-6 text-center">
                    <div className="text-muted small">Period B</div>
                    <h5>₦{paymentAnalytics.duration.totalAmountForDurationB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h5>
                    <small className="text-muted">Accounts: {paymentAnalytics.account.totalAccountProcessedB}</small>
                  </div>
                </div>
                
                {/* Manual Calculations Section */}
                <div className="row mt-1">
                  <div className="col-6 text-center">
                    {(() => {
                      const manualAmountPercentage = calculatePercentageChange(
                        paymentAnalytics.duration.totalAmountForDurationB,
                        paymentAnalytics.duration.totalAmountForDurationA
                      );
                      const isAmountIncrease = manualAmountPercentage >= 0;
                      return (
                        <div>
                          <div className={isAmountIncrease ? 'text-success' : 'text-danger'}>
                            <i className={`fe-${isAmountIncrease ? 'trending-up' : 'trending-down'} me-1`} />
                            <strong>Amount: {Math.abs(manualAmountPercentage).toFixed(1)}% {isAmountIncrease ? 'increase' : 'decrease'}</strong>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="col-6 text-center">
                    {(() => {
                      const manualAccountPercentage = calculatePercentageChange(
                        paymentAnalytics.account.totalAccountProcessedB,
                        paymentAnalytics.account.totalAccountProcessedA
                      );
                      const isAccountIncrease = manualAccountPercentage >= 0;
                      return (
                        <div>
                          <div className={isAccountIncrease ? 'text-success' : 'text-danger'}>
                            <i className={`fe-${isAccountIncrease ? 'trending-up' : 'trending-down'} me-1`} />
                            <strong>Accounts: {Math.abs(manualAccountPercentage).toFixed(1)}% {isAccountIncrease ? 'increase' : 'decrease'}</strong>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Booking Analytics Section */}
      <Col md={6} className="mb-4">
        <Card>
          <Card.Header className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fe-calendar me-2" style={{ color: primary }}></i>
                Booking Analytics
              </h5>
              <div className="btn-group" role="group">
                <Button 
                  variant={bookingChartView === 'bar' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setBookingChartView('bar')}
                  title="Bar Chart"
                >
                  <i className="fe-bar-chart-2"></i>
                </Button>
                <Button 
                  variant={bookingChartView === 'line' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setBookingChartView('line')}
                  title="Line Chart"
                >
                  <i className="fe-trending-up"></i>
                </Button>
                <Button 
                  variant={bookingChartView === 'area' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setBookingChartView('area')}
                  title="Area Chart"
                >
                  <i className="fe-activity"></i>
                </Button>
                <Button 
                  variant={bookingChartView === 'pie' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setBookingChartView('pie')}
                  title="Pie Chart"
                >
                  <i className="fe-pie-chart"></i>
                </Button>
                <Button 
                  variant={bookingChartView === 'radial' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setBookingChartView('radial')}
                  title="Radial Chart"
                >
                  <i className="fe-target"></i>
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {analyticsData.loading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Loading booking data...
              </div>
            ) : analyticsData.error ? (
              <div className="text-center py-3 text-danger">Error: {analyticsData.error}</div>
            ) : (
              <>
                {renderChart('booking', bookingChartView, getBookingChartData(), 'bookings', 'Bookings')}
                
                <div className="row mt-3">
                  <div className="col-6 text-center">
                    <div className="text-muted small">Period A</div>
                    <h5>{analyticsData.periodA.bookings.toLocaleString()}</h5>
                  </div>
                  <div className="col-6 text-center">
                    <div className="text-muted small">Period B</div>
                    <h5>{analyticsData.periodB.bookings.toLocaleString()}</h5>
                  </div>
                </div>
                
                <div className={`text-center mt-2 ${analyticsData.periodB.bookings >= analyticsData.periodA.bookings ? 'text-success' : 'text-danger'}`}>
                  <i className={`fe-${analyticsData.periodB.bookings >= analyticsData.periodA.bookings ? 'trending-up' : 'trending-down'} me-1`} />
                  {calculatePercentageChange(analyticsData.periodB.bookings, analyticsData.periodA.bookings).toFixed(1)}% change
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Hours Analytics Section */}
      <Col md={6} className="mb-4">
        <Card>
          <Card.Header className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fe-clock me-2" style={{ color: primary }}></i>
                Hours Analytics
              </h5>
              <div className="btn-group" role="group">
                <Button 
                  variant={hoursChartView === 'bar' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setHoursChartView('bar')}
                  title="Bar Chart"
                >
                  <i className="fe-bar-chart-2"></i>
                </Button>
                <Button 
                  variant={hoursChartView === 'line' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setHoursChartView('line')}
                  title="Line Chart"
                >
                  <i className="fe-trending-up"></i>
                </Button>
                <Button 
                  variant={hoursChartView === 'area' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setHoursChartView('area')}
                  title="Area Chart"
                >
                  <i className="fe-activity"></i>
                </Button>
                <Button 
                  variant={hoursChartView === 'pie' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setHoursChartView('pie')}
                  title="Pie Chart"
                >
                  <i className="fe-pie-chart"></i>
                </Button>
                <Button 
                  variant={hoursChartView === 'radial' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setHoursChartView('radial')}
                  title="Radial Chart"
                >
                  <i className="fe-target"></i>
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {analyticsData.loading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Loading hours data...
              </div>
            ) : analyticsData.error ? (
              <div className="text-center py-3 text-danger">Error: {analyticsData.error}</div>
            ) : (
              <>
                {renderChart('hours', hoursChartView, getHoursChartData(), 'hours', 'Hours')}
                
                <div className="row mt-3">
                  <div className="col-6 text-center">
                    <div className="text-muted small">Period A</div>
                    <h5>{analyticsData.periodA.hours.toLocaleString()}</h5>
                  </div>
                  <div className="col-6 text-center">
                    <div className="text-muted small">Period B</div>
                    <h5>{analyticsData.periodB.hours.toLocaleString()}</h5>
                  </div>
                </div>
                
                <div className={`text-center mt-2 ${analyticsData.periodB.hours >= analyticsData.periodA.hours ? 'text-success' : 'text-danger'}`}>
                  <i className={`fe-${analyticsData.periodB.hours >= analyticsData.periodA.hours ? 'trending-up' : 'trending-down'} me-1`} />
                  {calculatePercentageChange(analyticsData.periodB.hours, analyticsData.periodA.hours).toFixed(1)}% change
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* BOOKING FILTER MODAL */}
      <Modal show={showBookingFilterModal} onHide={() => setShowBookingFilterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Filter Bookings & Payments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label><strong>Booking Type</strong></Form.Label>
              <Form.Select 
                value={bookingFilter.bookingType}
                onChange={(e) => handleBookingFilterChange({ bookingType: e.target.value })}
              >
                <option value="today">Today</option>
                <option value="valid">Valid</option>
                <option value="expired">Expired</option>
                <option value="past">Past</option>
                <option value="all">All</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><strong>Start Date & Time</strong></Form.Label>
              <DatePicker
                selected={bookingFilter.startDate}
                onChange={(date) => handleBookingFilterChange({ startDate: date })}
                maxDate={new Date()}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="form-control"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><strong>End Date & Time</strong></Form.Label>
              <DatePicker
                selected={bookingFilter.endDate}
                onChange={(date) => handleBookingFilterChange({ endDate: date })}
                minDate={bookingFilter.startDate}
                maxDate={new Date()}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="form-control"
              />
            </Form.Group>

            <div className="alert alert-info small">
              <i className="fe-info me-1"></i>
              Default is today's bookings (00:00 to 23:59). You can filter by any date range and booking type. The payments card will show the total fees from these bookings.
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingFilterModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApplyBookingFilter}
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            Apply Filter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ENHANCED BOOKINGS DATA MODAL WITH PAGINATION */}
      <Modal show={showBookingsDataModal} onHide={() => setShowBookingsDataModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {bookingFilter.bookingType === 'today' ? "Today's" :
             bookingFilter.bookingType === 'valid' ? "Valid" :
             bookingFilter.bookingType === 'expired' ? "Expired" :
             bookingFilter.bookingType === 'past' ? "Past" :
             bookingFilter.bookingType === 'all' ? "All" : ""} Bookings & Payments Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {todayBookings.loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : todayBookings.error ? (
            <div className="alert alert-danger">Error loading bookings data</div>
          ) : (
            <div>
              <div className="mb-4">
                <h5>Summary</h5>
                <Row>
                  <Col md={4}>
                    <p><strong>Total Bookings:</strong> {todayBookings.count.toLocaleString()}</p>
                  </Col>
                  <Col md={4}>
                    <p><strong>Total Payments:</strong> ₦{todayBookings.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </Col>
                  <Col md={4}>
                    <p><strong>Average per Booking:</strong> ₦{(todayBookings.count > 0 ? (todayBookings.totalFees / todayBookings.count) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </Col>
                </Row>
                <p><strong>Date Range:</strong> {format(bookingFilter.startDate, "MMM dd, yyyy HH:mm")} to {format(bookingFilter.endDate, "MMM dd, yyyy HH:mm")}</p>
                <p><strong>Booking Type:</strong> {bookingFilter.bookingType.charAt(0).toUpperCase() + bookingFilter.bookingType.slice(1)}</p>
              </div>
              
              <div>
                <h5>Bookings List</h5>
                
                {/* Pagination Component */}
                {todayBookings.data.length > 0 && (
                  <BookingsPagination 
                    data={todayBookings.data}
                    itemsPerPage={15}
                    renderTable={(paginatedData) => (
                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-striped table-hover">
                          <thead className="sticky-top bg-white">
                            <tr>
                              <th>ID</th>
                              <th>Booking Ref</th>
                              <th>User ID</th>
                              <th>Space</th>
                              <th>Category</th>
                              <th>Date/Time</th>
                              <th>Expiry</th>
                              <th>Status</th>
                              <th>Fee (₦)</th>
                              <th>Invoice</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedData.map((booking) => (
                              <tr key={booking.id}>
                                <td>#{booking.id}</td>
                                <td>
                                  <small>{booking.booking_ref}</small>
                                </td>
                                <td>{booking.user_id}</td>
                                <td>
                                  {booking.space?.space_name || 'N/A'}
                                  <small className="d-block text-muted">
                                    {booking.spot?.floor_id && `Floor: ${booking.spot.floor_id}`}
                                  </small>
                                </td>
                                <td>
                                  {booking.category?.category || 'N/A'}
                                </td>
                                <td>
                                  {booking.date ? format(new Date(booking.date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                </td>
                                <td>
                                  {booking.expiry_day ? format(new Date(booking.expiry_day), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                </td>
                                <td>
                                  <span className={`badge bg-${booking.statusVariant}`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td>₦{booking.fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td>
                                  <small>{booking.invoice_ref || 'N/A'}</small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  />
                )}
                
                {todayBookings.data.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fe-info me-2"></i>
                    No bookings found for this period
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>
              <small className="text-muted">
                Total: {todayBookings.count} bookings | Total Fees: ₦{todayBookings.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </small>
            </div>
            <div>
              <Button variant="secondary" onClick={() => setShowBookingsDataModal(false)} className="me-2">
                Close
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  // Export functionality
                  const csvContent = [
                    ['ID', 'Booking Ref', 'User ID', 'Space', 'Category', 'Date', 'Expiry', 'Status', 'Fee (₦)', 'Invoice'],
                    ...todayBookings.data.map(b => [
                      b.id,
                      b.booking_ref,
                      b.user_id,
                      b.space?.space_name || 'N/A',
                      b.category?.category || 'N/A',
                      b.date ? format(new Date(b.date), 'yyyy-MM-dd HH:mm') : 'N/A',
                      b.expiry_day ? format(new Date(b.expiry_day), 'yyyy-MM-dd HH:mm') : 'N/A',
                      b.status,
                      b.fee,
                      b.invoice_ref || 'N/A'
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `bookings_${bookingFilter.bookingType}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
                  a.click();
                }}
                style={{backgroundColor: primary, borderColor: primary}}
              >
                Export CSV
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Analytics Configuration Modal with Time Support */}
      <Modal show={showAnalyticsModal} onHide={() => setShowAnalyticsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Configure Analytics Comparison</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label><strong>Comparison Type</strong></Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {['yearly', 'monthly', 'quarterly', 'custom'].map((type) => (
                  <Button
                    key={type}
                    variant={comparisonType === type ? "primary" : "outline-secondary"}
                    size="sm"
                    onClick={() => handleComparisonTypeChange(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <strong>Period A (Comparison Period)</strong>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date & Time</Form.Label>
                      <DatePicker
                        selected={periodAStart}
                        onChange={(date) => setPeriodAStart(date)}
                        maxDate={new Date()}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        className="form-control"
                        placeholderText="Select start date and time"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>End Date & Time</Form.Label>
                      <DatePicker
                        selected={periodAEnd}
                        onChange={(date) => setPeriodAEnd(date)}
                        minDate={periodAStart}
                        maxDate={new Date()}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        className="form-control"
                        placeholderText="Select end date and time"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <strong>Period B (Current Period)</strong>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date & Time</Form.Label>
                      <DatePicker
                        selected={periodBStart}
                        onChange={(date) => setPeriodBStart(date)}
                        maxDate={new Date()}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        className="form-control"
                        placeholderText="Select start date and time"
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>End Date & Time</Form.Label>
                      <DatePicker
                        selected={periodBEnd}
                        onChange={(date) => setPeriodBEnd(date)}
                        minDate={periodBStart}
                        maxDate={new Date()}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        className="form-control"
                        placeholderText="Select end date and time"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="alert alert-info">
              <small>
                <strong>Note:</strong> Period A is typically the comparison period (e.g., last year), 
                while Period B is the current period (e.g., this year). The comparison shows the percentage 
                change between the two periods. Times are included in the API call (e.g., 2026-02-20 00:00:00).
              </small>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAnalyticsModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAnalyticsSearch}>
            Apply Comparison
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default Statistics;