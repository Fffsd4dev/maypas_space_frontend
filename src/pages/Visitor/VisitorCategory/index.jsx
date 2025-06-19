import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Row, Col, Card, Alert, Button, Spinner, Form } from "react-bootstrap";
import Error404Alt from "../../../pages/error/Error404Alt";
import Popup from "../../../components/Popup/Popup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, isBefore, addHours } from "date-fns";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";

import "../index.css";

const VisitorCategory = () => {
      const { removeSession } = useAuthContext();
      const { user } = useAuthContext();

  const { visitorSlug: visitorUrlSlug, category } = useParams();
  const visitorSlug = user?.visitor || visitorUrlSlug;
    const visitorFirstName = user?.visitorFirstName;
  const visitorToken = user?.visitorToken;
    const tenantToken = user?.tenantToken;
    
      const navigate = useNavigate();

  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomsData, setRoomsData] = useState(null);

  // Booking popup states
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });

    const [userId, setUserId] = useState(null);
      const userIDRef = useRef(null); 
  

  const [bookingFormData, setBookingFormData] = useState({
    type: "one-off",
    chosen_days: [
      {
        start_time: null,
        end_time: null,
      },
    ],
    number_weeks: "0",
    number_months: "0",
    company_name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // Show login button if not logged in
  const showLogin = !visitorToken;

    useEffect(() => {
      if (tenantToken) {
        const logout = async () => {
          try {
            const res = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/${visitorSlug}/logout`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${tenantToken}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );
  
            if (res.status === 200) {
              console.log(res.data.message);
              removeSession();
            } else {
              console.error("Logout Failed:", res);
            }
          } catch (e) {
            console.error("Error during Logout:", e);
          }
        };
        logout();
      }
    }, [visitorSlug, removeSession, navigate, tenantToken]);

      useEffect(() => {
        if (!window.PaystackPop) {
          const script = document.createElement("script");
          script.src = "https://js.paystack.co/v2/inline.js";
          script.async = true;
          document.body.appendChild(script);
        }
      }, []);

    const triggerPaystackPopup = (access_code, userId) => {
      if (!window.PaystackPop) {
        showPaystackPopup(
          "Payment library not loaded. Please try again.",
          "error"
        );
        return;
      }
      const popup = new window.PaystackPop();
  
      popup.resumeTransaction(access_code, {
        onSuccess: (response) => {
          handleConfirmBooking(response.reference, userId);
          console.log("Transaction successful:", response);
        },
  
        onCancel: () => {
          showPaystackPopup("Transaction was canceled.", "warning");
        },
        onLoad: () => {
          showPaystackPopup("Transaction loading...", "info");
        },
        onError: (error) => {
          showPaystackPopup("An error occurred: " + error.message, "error");
        },
      });
    };

      const showPaystackPopup = (
    message,
    type = "info",
    buttonLabel = "OK",
    buttonRoute = ""
  ) => {
    setPopup({
      message,
      type,
      isVisible: true,
      buttonLabel,
      buttonRoute,
    });
  };

      const handleConfirmBooking = async (reference) => {
        setIsLoading(true);
    
        try {
          // Validate chosen days
          let hasEmptyFieldsConfirm = false;
          if (visitorToken) {
            hasEmptyFieldsConfirm = bookingFormData.chosen_days.some(
              (day) => !day.day || !day.start_time || !day.end_time
            );
          } else {
            hasEmptyFieldsConfirm =
              bookingFormData.chosen_days.some(
                (day) => !day.day || !day.start_time || !day.end_time
              ) ||
              !bookingFormData.company_name ||
              !bookingFormData.first_name ||
              !bookingFormData.last_name ||
              !bookingFormData.email ||
              !bookingFormData.phone;
          }
    
          if (hasEmptyFieldsConfirm) {
            throw new Error("Please fill in all required fields");
          }
    
          // Prepare the booking data
          let bookingData = {};
          if (visitorToken) {
            bookingData = {
              reference,
              spot_id: selectedSpace.spot_id.toString(),
              type: bookingFormData.type,
              number_weeks: bookingFormData.number_weeks || "0",
              number_months: bookingFormData.number_months || "0",
              chosen_days: bookingFormData.chosen_days.map((day) => ({
                day: day.day.toLowerCase(),
                start_time: formatTimeForAPI(day.start_time),
                end_time: formatTimeForAPI(day.end_time),
              })),
            };
          } else {
            bookingData = {
              reference,
              company_name: bookingFormData.company_name,
              first_name: bookingFormData.first_name,
              last_name: bookingFormData.last_name,
              email: bookingFormData.email,
              phone: bookingFormData.phone,
              user_id: userIDRef.current || userId, // Use ref or state for user ID
              spot_id: selectedSpace.spot_id.toString(),
              type: bookingFormData.type,
              number_weeks: bookingFormData.number_weeks || "0",
              number_months: bookingFormData.number_months || "0",
              chosen_days: bookingFormData.chosen_days.map((day) => ({
                day: day.day.toLowerCase(),
                start_time: formatTimeForAPI(day.start_time),
                end_time: formatTimeForAPI(day.end_time),
              })),
            };
          }
    
          // Validate time ranges
          for (const day of bookingData.chosen_days) {
            const start = parseISO(day.start_time.replace(" ", "T") + "Z");
            const end = parseISO(day.end_time.replace(" ", "T") + "Z");
    
            if (isBefore(end, start)) {
              throw new Error("End time must be after start time");
            }
          }
    
          const url = visitorToken
            ? `${
                import.meta.env.VITE_BACKEND_URL
              }/api/${visitorSlug}/user/confirm/pay`
            : `${
                import.meta.env.VITE_BACKEND_URL
              }/api/${visitorSlug}/confirm/pay/spot`;
    
          console.log("Confirm Booking with visitor token:", bookingData);
    
          // Make API call
          let response;
          if (visitorToken) {
            response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${visitorToken}`,
              },
              body: JSON.stringify(bookingData),
            });
          } else {
            response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(bookingData),
            });
          }
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to book space");
          }
    
          const result = await response.json();
          if (response.ok){
            console.log("confirmbooking result", result);
          toast.success(
            result.message || " Payment made and Space booked successfully!"
          );
          handleBookingClose();
          // Show success popup
          showPaystackPopup(
            "Transaction successful! Reference: " + reference,
            "success"
          );
          }
        } catch (error) {
          toast.error(error.message || "Failed to book space");
          setPopup((prev) => ({
            ...prev,
            isVisible: false, // Hide any previous popup
          }));
          showPaystackPopup(
            `Contact Admin with reference number:<br /><strong>${reference}</strong><br /><br />
      <span style="color:red;font-weight:bold;">
        !!! Don't click ok or close this popup without copying or screenshotting the reference number
      </span>`,
            "error"
          );
        } finally {
          setIsLoading(false);
        }
      };
      

  useEffect(() => {
    if (document.body) document.body.classList.remove("authentication-bg", "authentication-bg-pattern");
    if (document.body) document.body.classList.add("auth-fluid-pages", "pb-0");
    return () => {
      if (document.body) document.body.classList.remove("auth-fluid-pages", "pb-0");
    };
  }, []);



  // Handle book now click
  const handleBookNowClick = (room) => {
    setSelectedSpace(room);
    setBookingFormData({
      type: "one-off",
      chosen_days: [
        {
          start_time: null,
          end_time: null,
        },
      ],
      number_weeks: "0",
      number_months: "0",
      company_name: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    });
    setShowBookingPopup(true);
  };

  const handleBookingClose = () => {
    setShowBookingPopup(false);
    setSelectedSpace(null);
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData((prev) => {
      if (name === "type" && value === "one-off") {
        return {
          ...prev,
          type: value,
          number_weeks: "0",
          number_months: "0",
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...bookingFormData.chosen_days];
    if (field === "start_time" && value) {
      const dayName = format(value, "EEEE").toLowerCase();
      updatedDays[index].day = dayName;
      updatedDays[index].start_time = value;
      if (
        updatedDays[index].end_time &&
        isBefore(updatedDays[index].end_time, value)
      ) {
        updatedDays[index].end_time = addHours(value, 1);
      }
    } else if (field === "end_time") {
      updatedDays[index].end_time = value;
    }
    setBookingFormData((prev) => ({
      ...prev,
      chosen_days: updatedDays,
    }));
  };

  const addDay = () => {
    setBookingFormData((prev) => ({
      ...prev,
      chosen_days: [...prev.chosen_days, { start_time: null, end_time: null }],
    }));
  };

  const removeDay = (index) => {
    setBookingFormData((prev) => ({
      ...prev,
      chosen_days: prev.chosen_days.filter((_, i) => i !== index),
    }));
  };

  const formatTimeForAPI = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd HH:mm:ss");
  };

  // Dummy booking submit (replace with your API logic)
  const handleBookingSubmit = async (e) => {
     e.preventDefault();
     setIsLoading(true);
 
     try {
       // Validate chosen days
       let hasEmptyFields = false;
       if (visitorToken) {
         hasEmptyFields = bookingFormData.chosen_days.some(
           (day) => !day.day || !day.start_time || !day.end_time
         );
       } else {
         hasEmptyFields =
           bookingFormData.chosen_days.some(
             (day) => !day.day || !day.start_time || !day.end_time
           ) ||
           !bookingFormData.company_name ||
           !bookingFormData.first_name ||
           !bookingFormData.last_name ||
           !bookingFormData.email ||
           !bookingFormData.phone;
       }
 
       if (hasEmptyFields) {
         throw new Error("Please fill in all required fields");
       }
 
       // Prepare the booking data
       let bookingData = {};
 
       if (visitorToken) {
         bookingData = {
           spot_id: selectedSpace.spot_id.toString(),
           type: bookingFormData.type,
           number_weeks: bookingFormData.number_weeks || "0",
           number_months: bookingFormData.number_months || "0",
           chosen_days: bookingFormData.chosen_days.map((day) => ({
             day: day.day.toLowerCase(),
             start_time: formatTimeForAPI(day.start_time),
             end_time: formatTimeForAPI(day.end_time),
           })),
         };
       } else {
         bookingData = {
           company_name: bookingFormData.company_name,
           first_name: bookingFormData.first_name,
           last_name: bookingFormData.last_name,
           email: bookingFormData.email,
           phone: bookingFormData.phone,
           spot_id: selectedSpace.spot_id.toString(),
           type: bookingFormData.type,
           number_weeks: bookingFormData.number_weeks || "0",
           number_months: bookingFormData.number_months || "0",
           chosen_days: bookingFormData.chosen_days.map((day) => ({
             day: day.day.toLowerCase(),
             start_time: formatTimeForAPI(day.start_time),
             end_time: formatTimeForAPI(day.end_time),
           })),
         };
       }
 
       // Validate time ranges
       for (const day of bookingData.chosen_days) {
         const start = parseISO(day.start_time.replace(" ", "T") + "Z");
         const end = parseISO(day.end_time.replace(" ", "T") + "Z");
 
         if (isBefore(end, start)) {
           throw new Error("End time must be after start time");
         }
       }
 
       const url = visitorToken
         ? `${
             import.meta.env.VITE_BACKEND_URL
           }/api/${visitorSlug}/user/initiate/pay`
         : `${
             import.meta.env.VITE_BACKEND_URL
           }/api/${visitorSlug}/initiate/pay/spot`;
 
       console.log("Booking with visitor token:", bookingData);
 
       // Make API call
       let response;
       if (visitorToken) {
         response = await fetch(url, {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${visitorToken}`,
           },
           body: JSON.stringify(bookingData),
         });
       } else {
         response = await fetch(url, {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
           },
           body: JSON.stringify(bookingData),
         });
       }
 
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || "Failed to book space");
       }
 
       const result = await response.json();
       console.log(result);
       toast.success(result.message || "Space booked successfully!");
       handleBookingClose();
       
         setUserId(result.user.id);
       userIDRef.current = result.user.id; // Store user ID in ref for later use
         console.log(userId)
       
       // If your backend returns access_code for Paystack
       if (result.access_code) {
         triggerPaystackPopup(result.access_code, result.user.id);
       }
     } catch (error) {
       toast.error(error.message || "Failed to book space");
     } finally {
       setIsLoading(false);
     }
   };

  useEffect(() => {
    const fetchCategoryAndRooms = async () => {
      setLoading(true);
      try {
        // 1. Fetch locations
        const locRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${visitorUrlSlug}/get/locations`
        );
        const locData = await locRes.json();
        if (!locRes.ok || !Array.isArray(locData.data) || locData.data.length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        // 2. Get first locationId
        const locationId = locData.data[0].id;

        // 3. Fetch spaces for this location
        const spaceRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${visitorUrlSlug}/get/spaces/${locationId}`
        );
        const spaceData = await spaceRes.json();
        if (!spaceRes.ok || !spaceData.data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // 4. Find the category for the requested category
        const categories = Object.keys(spaceData.data);
        const decodedCategory = decodeURIComponent(category);
        const matchedCategory = categories.find(
          (cat) => cat.toLowerCase() === decodedCategory.toLowerCase()
        );

        if (!matchedCategory) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // 5. Extract space_category_id from the first room in the matched category
        const categoryRooms = spaceData.data[matchedCategory];
        if (!Array.isArray(categoryRooms) || categoryRooms.length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        // You can use space_category_id if needed for further fetches

        setRoomsData({ [matchedCategory]: categoryRooms });
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndRooms();
  }, [visitorUrlSlug, category]);

  if (loading) return <div>Loading...</div>;
  if (notFound) return <Error404Alt />;

  return (
    <div >
        {showLogin && (
         <div className="visitor-header">
                <h3>| {visitorSlug}</h3>
                {visitorToken ? (
                  <h2 className="dropdown">
                    <ProfileDropdown
                      profilePic={profilePic}
                      menuItems={ProfileMenus}
                      username={visitorFirstName}
                    />
                  </h2>
                ) : (
                  <h2>
                    Already have an account?{" "}
                    <Link to={`/${visitorSlug}/auth/visitorLogin`} className="">
                      <button type="submit">Login</button>
                    </Link>{" "}
                  </h2>
                )}
              </div>
      )}
      
      <h2 className="pagetitle">
        Category: <span style={{ color: "#007bff" }}>{decodeURIComponent(category)}</span>
      </h2>
      
      <Row className="pagetitle">
        {roomsData &&
          Object.keys(roomsData).map((cat) =>
            roomsData[cat].length === 0 ? (
              <Col key={cat}>
                <Alert variant="info">No spaces in this category.</Alert>
              </Col>
            ) : (
              roomsData[cat].map((room) => (
                <Col key={room.spot_id} md={3} className="mb-3">
                  <Card className="h-100">
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{room.space_name}</Card.Title>
                      <Card.Text className="flex-grow-1">
                        <span>
                          <strong>Fee:</strong> {room.space_fee}
                        </span>
                        <br />
                        <span>
                          <strong>Location:</strong> {room.location_name}
                        </span>
                        <br />
                        <span>
                          <strong>Floor:</strong> {room.floor_name}
                        </span>
                      </Card.Text>
                      <div className="mt-auto">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-100"
                          onClick={() => handleBookNowClick(room)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )
          )}
      </Row>
      {/* Booking Popup */}
      {showBookingPopup && selectedSpace && (
        <Popup
          title={`Book Space ${selectedSpace.space_name}`}
          isVisible={showBookingPopup}
          onClose={handleBookingClose}
          size="lg"
        >
          <div
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "8px",
            }}
          >
            <Form onSubmit={handleBookingSubmit}>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Booking Type</Form.Label>
                    <Form.Select
                      name="type"
                      value={bookingFormData.type}
                      onChange={handleBookingInputChange}
                      required
                    >
                      <option value="one-off">One-time Booking</option>
                      <option value="recurrent">Recurring Booking</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {showLogin ? (
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="company_name"
                        value={bookingFormData.company_name}
                        onChange={handleBookingInputChange}
                        placeholder="Enter company name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={bookingFormData.first_name}
                        onChange={handleBookingInputChange}
                        placeholder="Enter first name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={bookingFormData.last_name}
                        onChange={handleBookingInputChange}
                        placeholder="Enter last name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={bookingFormData.email}
                        onChange={handleBookingInputChange}
                        placeholder="Enter email"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={bookingFormData.phone}
                        onChange={handleBookingInputChange}
                        placeholder="Enter phone number"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              ) : null}

              {bookingFormData.type === "recurrent" && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Number of Weeks</Form.Label>
                      <Form.Control
                        type="number"
                        name="number_weeks"
                        value={bookingFormData.number_weeks}
                        onChange={handleBookingInputChange}
                        min="1"
                        disabled={bookingFormData.type === "one-off"}
                        required={bookingFormData.type === "recurrent"}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Number of Months</Form.Label>
                      <Form.Control
                        type="number"
                        name="number_months"
                        value={bookingFormData.number_months}
                        onChange={handleBookingInputChange}
                        min="0"
                        disabled={bookingFormData.type === "one-off"}
                        required={bookingFormData.type === "recurrent"}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <h5 className="mt-3">Booking Schedule</h5>
              {bookingFormData.chosen_days.map((day, index) => (
                <div key={index} className="border p-3 mb-3">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Time *</Form.Label>
                        <DatePicker
                          selected={day.start_time}
                          onChange={(date) =>
                            handleDayChange(index, "start_time", date)
                          }
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          className="form-control"
                          placeholderText="Select start date & time"
                          minDate={new Date()}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>End Time *</Form.Label>
                        <DatePicker
                          selected={day.end_time}
                          onChange={(date) =>
                            handleDayChange(index, "end_time", date)
                          }
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          className="form-control"
                          placeholderText="Select end date & time"
                          minDate={day.start_time || new Date()}
                          required
                          disabled={!day.start_time}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {index > 0 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeDay(index)}
                      className="mt-2"
                    >
                      Remove Time Slot
                    </Button>
                  )}
                </div>
              ))}

              <Button
                variant="outline-primary"
                size="sm"
                onClick={addDay}
                className="mb-3"
              >
                Add Another Time Slot
              </Button>

              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  onClick={handleBookingClose}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{" "}
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </Popup>
      )}
      {/* Info/Error Popup */}
      {popup.isVisible && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ ...popup, isVisible: false })}
          buttonLabel={popup.buttonLabel}
          buttonRoute={popup.buttonRoute}
        />
      )}
    </div>
  );
};

export default VisitorCategory;