import { Row, Col, Button, Card, Modal, Pagination } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import StatisticsWidget from "../../../components/StatisticsWidget";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const Statistics = () => {
  const { user } = useAuthContext();
  const { tenantSlug } = useParams();

  const [stats, setStats] = useState({
    totalCategories: 0,
    totalPayments: 0,
    totalAmount: 0,
    loading: true,
    error: null,
  });

  // Bookings date range state
  const [showBookingsDateModal, setShowBookingsDateModal] = useState(false);
  const [bookingsStartDate, setBookingsStartDate] = useState(new Date());
  const [bookingsEndDate, setBookingsEndDate] = useState(new Date());
  const [customBookings, setCustomBookings] = useState(null);

  // Payments date range state
  const [showPaymentsDateModal, setShowPaymentsDateModal] = useState(false);
  const [paymentsStartDate, setPaymentsStartDate] = useState(new Date());
  const [paymentsEndDate, setPaymentsEndDate] = useState(new Date());
  const [customPayments, setCustomPayments] = useState(null);

  // Bookings data display states
  const [showBookingsDataModal, setShowBookingsDataModal] = useState(false);
  const [bookingsDataArray, setBookingsDataArray] = useState([]);
  const [bookingsDataLoading, setBookingsDataLoading] = useState(false);
  const [bookingsDataError, setBookingsDataError] = useState(null);
  const [bookingsDataPage, setBookingsDataPage] = useState(1);
  const [bookingsDataTotalPages, setBookingsDataTotalPages] = useState(1);
    const [bookingsDataPerPage, setBookingsDataPerPage] = useState(4);

  // Helper to format date & time for API
  const formatAPIDateTime = (date) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

   // Fetch bookings data for today or custom range, with pagination
  const fetchBookingsDataPaginated = async ({
    fromDate,
    toDate,
    page = 1,
    perPage = bookingsDataPerPage,
  }) => {
    try {
      setBookingsDataLoading(true);
      setBookingsDataError(null);
      let url;
      if (fromDate && toDate) {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/get?booking_type=past&start_time=${formatAPIDateTime(fromDate)}&end_time=${formatAPIDateTime(toDate)}&page=${page}&per_page=${perPage}`;
      } else {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/get?booking_type=today&start_time=${formatAPIDateTime(today)}&page=${page}&per_page=${perPage}`;
      }
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookingsDataArray(data?.data?.data || []);
      setBookingsDataPage(data?.data?.current_page || 1);
      setBookingsDataTotalPages(data?.data?.last_page || 1);
      setBookingsDataPerPage(data?.data?.per_page || perPage);
    } catch (err) {
      setBookingsDataError(err.message);
      setBookingsDataArray([]);
    } finally {
      setBookingsDataLoading(false);
    }
  };

  // Update handlers to pass perPage
  const handleShowBookingsData = () => {
    setShowBookingsDataModal(true);
    fetchBookingsDataPaginated({
      fromDate: customBookings !== null ? bookingsStartDate : null,
      toDate: customBookings !== null ? bookingsEndDate : null,
      page: 1,
      perPage: bookingsDataPerPage,
    });
  };

  const handleBookingsDataPageChange = (page) => {
    fetchBookingsDataPaginated({
      fromDate: customBookings !== null ? bookingsStartDate : null,
      toDate: customBookings !== null ? bookingsEndDate : null,
      page,
      perPage: bookingsDataPerPage,
    });
  };

  // Add handler for changing per page
  const handleBookingsDataPerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10) || 15;
    setBookingsDataPerPage(newPerPage);
    fetchBookingsDataPaginated({
      fromDate: customBookings !== null ? bookingsStartDate : null,
      toDate: customBookings !== null ? bookingsEndDate : null,
      page: 1,
      perPage: newPerPage,
    });
  };


  // Format readable range
    const formatReadableRange = (start, end) => {
    if (!start || !end) return "";
    const startStr = format(start, "EEEE do MMMM yyyy 'at' HH:mm");
    const endStr = format(end, "do MMMM yyyy 'at' HH:mm");
    return `from ${startStr} to ${endStr}`;
  };

  const today = new Date();
  console.log("Today's date:", today);
  // Fetch bookings data for today or custom range
  const fetchBookingsData = async (fromDate, toDate) => {
    try {
      let url;
      if (fromDate && toDate) {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/get?booking_type=past&start_time=${formatAPIDateTime(fromDate)}&end_time=${formatAPIDateTime(toDate)}`;
      } else {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/get?booking_type=today&start_time=${formatAPIDateTime(today)}`;
      }
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      return data?.data?.data || [];
    } catch (err) {
      return [];
    }
  };

  // Fetch stats for today on mount
  const [bookingsTodayArray, setBookingsTodayArray] = useState([]);
  const [paymentsToday, setPaymentsToday] = useState(0);

  useEffect(() => {
    const fetchToday = async () => {
      const arr = await fetchBookingsData();
      setBookingsTodayArray(arr);
      const totalPayments = arr.reduce((sum, item) => {
        const fee = parseFloat(item.fee) || 0;
        return sum + fee;
      }, 0);
      setPaymentsToday(totalPayments);
    };
    fetchToday();
  }, [user?.token, tenantSlug]);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.token) return;

        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        // Fetch Categories
        const categoriesRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/list-categories`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesRes.json();
        const categoryArray = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.data || categoriesData.categories || [];
        const categoryIds = categoryArray.map((cat) => cat.id);

        // Analytics per category
        const fetchCategoryData = async (id) => {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/list?startTimeA=${startDate}&endTimeA=${endDate}&categoryId=${id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          if (!res.ok) throw new Error(`Failed to fetch for category ${id}`);
          return res.json();
        };

        const allCategoryData = await Promise.all(
          categoryIds.map(fetchCategoryData)
        );

        let totalBookings = 0;
        let totalHours = 0;
        allCategoryData.forEach((data) => {
          totalBookings += data.booking?.bookingA || 0;
          totalHours += data.hour?.hourA || 0;
        });

        // Payments
        const paymentsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/payment?startTimeA=${startDate}&endTimeA=${endDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!paymentsResponse.ok) {
          throw new Error("Failed to fetch payments data");
        }
        const paymentsData = await paymentsResponse.json();
        const paymentsCount =
          paymentsData.duration?.totalAmountForDurationA || 0;

        setStats({
          totalCategories: totalBookings,
          totalPayments: paymentsCount,
          totalAmount: totalHours,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, [user?.token, tenantSlug]);

  // Bookings custom date search
  const handleBookingsDateModalSearch = async () => {
    if (!bookingsStartDate || !bookingsEndDate) return;
    if (bookingsEndDate > new Date()) {
      alert("End date cannot be after today.");
      return;
    }
    if (bookingsStartDate > bookingsEndDate) {
      alert("Start date cannot be after end date.");
      return;
    }
    setShowBookingsDateModal(false);
    setCustomBookings(null);
    const arr = await fetchBookingsData(bookingsStartDate, bookingsEndDate);
    setCustomBookings(arr.length);
  };

  // Payments custom date search
  const handlePaymentsDateModalSearch = async () => {
    if (!paymentsStartDate || !paymentsEndDate) return;
    if (paymentsEndDate > new Date()) {
      alert("End date cannot be after today.");
      return;
    }
    if (paymentsStartDate > paymentsEndDate) {
      alert("Start date cannot be after end date.");
      return;
    }
    setShowPaymentsDateModal(false);
    setCustomPayments(null);
    const arr = await fetchBookingsData(paymentsStartDate, paymentsEndDate);
    const totalPayments = arr.reduce((sum, item) => {
      const fee = parseFloat(item.fee) || 0;
      return sum + fee;
    }, 0);
    setCustomPayments(totalPayments);
  };

  // Back to today for bookings
  const handleBookingsBackToToday = () => {
    setCustomBookings(null);
    setBookingsStartDate(new Date());
    setBookingsEndDate(new Date());
    setShowBookingsDateModal(false);
  };

  // Back to today for payments
  const handlePaymentsBackToToday = () => {
    setCustomPayments(null);
    setPaymentsStartDate(new Date());
    setPaymentsEndDate(new Date());
    setShowPaymentsDateModal(false);
  };



  if (stats.loading) return <div>Loading statistics...</div>;
  if (stats.error) return <div>Error: {stats.error}</div>;

  return (
    <Row>
      <Col md={6} xl={4}>
        <StatisticsWidget
          variant="primary"
          description={`Total Bookings ${currentYear}`}
          stats={stats.totalCategories.toString()}
          icon="fe-list"
        />
      </Col>
      <Col md={6} xl={4}>
        <StatisticsWidget
          variant="success"
          description="Total Payments"
          stats={stats.totalPayments.toString()}
          icon="fe-credit-card"
        />
      </Col>
      <Col md={6} xl={4}>
        <StatisticsWidget
          variant="info"
          description="Total Hours Booked"
          stats={stats.totalAmount.toLocaleString()}
          icon="fe-clock"
        />
      </Col>
    
      <Col md={6} xl={4}>
        <Card className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div style={{ fontWeight: "bold" }}>
                  Payments {customPayments !== null
                    ? formatReadableRange(paymentsStartDate, paymentsEndDate)
                    : "For Today"}
                </div>
                <div style={{ fontSize: "2rem" }}>
                  {customPayments !== null
                    ? customPayments.toLocaleString(undefined, { minimumFractionDigits: 2 })
                    : paymentsToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                {customPayments !== null && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-2"
                    onClick={handlePaymentsBackToToday}
                  >
                    Back to Today
                  </Button>
                )}
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowPaymentsDateModal(true)}
              >
                Pick Date Range
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
      {/* Bookings Date Range Modal */}
      <Modal show={showBookingsDateModal} onHide={() => setShowBookingsDateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Bookings Start & End Date/Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label style={{ fontWeight: "bold" }}>Start Date & Time:</label>
            <DatePicker
              selected={bookingsStartDate}
              onChange={(date) => setBookingsStartDate(date)}
              maxDate={new Date()}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              className="form-control mb-2"
            />
          </div>
          <div>
            <label style={{ fontWeight: "bold" }}>End Date & Time:</label>
            <DatePicker
              selected={bookingsEndDate}
              onChange={(date) => setBookingsEndDate(date)}
              minDate={bookingsStartDate}
              maxDate={new Date()}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              className="form-control mb-2"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBookingsDateModalSearch}
            style={{ marginTop: "8px" }}
          >
            Search
          </Button>
          <div className="mt-2 text-muted">
            <small>Select start and end date/time (cannot be after today).</small>
          </div>
        </Modal.Body>
      </Modal>
      {/* Payments Date Range Modal */}
      <Modal show={showPaymentsDateModal} onHide={() => setShowPaymentsDateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Select Payments Start & End Date/Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label style={{ fontWeight: "bold" }}>Start Date & Time:</label>
            <DatePicker
              selected={paymentsStartDate}
              onChange={(date) => setPaymentsStartDate(date)}
              maxDate={new Date()}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              className="form-control mb-2"
            />
          </div>
          <div>
            <label style={{ fontWeight: "bold" }}>End Date & Time:</label>
            <DatePicker
              selected={paymentsEndDate}
              onChange={(date) => setPaymentsEndDate(date)}
              minDate={paymentsStartDate}
              maxDate={new Date()}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm:ss"
              className="form-control mb-2"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePaymentsDateModalSearch}
            style={{ marginTop: "8px" }}
          >
            Search
          </Button>
          <div className="mt-2 text-muted">
            <small>Select start and end date/time (cannot be after today).</small>
          </div>
        </Modal.Body>
      </Modal>
<Col md={6} xl={4}>
        <Card className="mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div style={{ fontWeight: "bold" }}>
                  Bookings {customBookings !== null
                    ? formatReadableRange(bookingsStartDate, bookingsEndDate)
                    : "For Today"}
                </div>
                <div style={{ fontSize: "2rem" }}>
                  {customBookings !== null ? customBookings : bookingsTodayArray.length}
                </div>
                {customBookings !== null && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-2"
                    onClick={handleBookingsBackToToday}
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
                  onClick={() => setShowBookingsDateModal(true)}
                >
                  Pick Date Range
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleShowBookingsData}
                >
                  View Bookings Data
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      {/* Bookings Data Modal */}
       <Modal
        show={showBookingsDataModal}
        onHide={() => setShowBookingsDataModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Bookings {customBookings !== null
              ? formatReadableRange(bookingsStartDate, bookingsEndDate)
              : "For Today"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <div className="mb-3 d-flex align-items-center">
            <label htmlFor="perPageSelect" className="me-2 mb-0"><strong>Show per page:</strong></label>
            <select
              id="perPageSelect"
              value={bookingsDataPerPage}
              onChange={handleBookingsDataPerPageChange}
              className="form-select w-auto"
            >
              {[5, 10, 15, 20, 25, 50].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div> */}
          {bookingsDataLoading ? (
            <div className="text-center py-5">Loading...</div>
          ) : bookingsDataError ? (
            <div className="text-danger text-center py-5">{bookingsDataError}</div>
          ) : bookingsDataArray.length === 0 ? (
            <div className="text-center py-5">No bookings found.</div>
          ) : (
            <Row>
              {bookingsDataArray.map((item) => {
                let chosenDays = [];
                try {
                  chosenDays = JSON.parse(item.chosen_days);
                } catch (e) {}
                return (
                  <Col md={6} key={item.book_spot_id} className="mb-3">
                    <Card>
                      <Card.Body>
                        <div>
                          <strong>Spot:</strong> {item.spot_id}
                        </div>
                        <div>
                          <strong>Space Name:</strong> {item.spot?.space?.space_name}
                        </div>
                        <div>
                          <strong>Category:</strong> {item.spot?.space?.category?.category}
                        </div>
                        <div>
                          <strong>Start Time:</strong> {format(new Date(item.start_time), "PPpp")}
                        </div>
                        <div>
                          <strong>Expiry Time:</strong> {item.expiry_day}
                        </div>
                        <div>
                          <strong>Amount Paid:</strong> {item.fee}
                        </div>
                        <div>
                          <strong>Book Status:</strong> {item.book_status}
                        </div>
                        <div>
                          <strong>Booking Ref:</strong> {item.booked_ref?.booked_ref}
                        </div>
                        <div>
                          <strong>Chosen Days:</strong>
                          <ul>
                            {chosenDays.map((day, idx) => (
                              <li key={idx}>
                                {day.day}: {format(new Date(day.start_time), "PPpp")} - {format(new Date(day.end_time), "PPpp")}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Pagination>
            <Pagination.First
              disabled={bookingsDataPage === 1}
              onClick={() => handleBookingsDataPageChange(1)}
            />
            <Pagination.Prev
              disabled={bookingsDataPage === 1}
              onClick={() => handleBookingsDataPageChange(bookingsDataPage - 1)}
            />
            <Pagination.Item active>{bookingsDataPage}</Pagination.Item>
            <Pagination.Next
              disabled={bookingsDataPage === bookingsDataTotalPages}
              onClick={() => handleBookingsDataPageChange(bookingsDataPage + 1)}
            />
            <Pagination.Last
              disabled={bookingsDataPage === bookingsDataTotalPages}
              onClick={() => handleBookingsDataPageChange(bookingsDataTotalPages)}
            />
          </Pagination>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default Statistics;