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
                    <h5>${paymentAnalytics.duration.totalAmountForDurationA.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h5>
                    <small className="text-muted">Accounts: {paymentAnalytics.account.totalAccountProcessedA}</small>
                  </div>
                  <div className="col-6 text-center">
                    <div className="text-muted small">Period B</div>
                    <h5>${paymentAnalytics.duration.totalAmountForDurationB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h5>
                    <small className="text-muted">Accounts: {paymentAnalytics.account.totalAccountProcessedB}</small>
                  </div>
                </div>
                
                {/* Manual Calculations Section */}
                <div className="row mt-1">
                  {/* <div className="col-12">
                    <h6 className="text-center mb-3">Manual Calculations (Period B vs Period A)</h6>
                  </div> */}
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