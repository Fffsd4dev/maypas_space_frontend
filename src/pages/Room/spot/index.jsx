import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form, Badge, Alert } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import UsersRegistrationModal from "../../MyWorkspaceAccount/Personal/UsersRegistrationForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, isBefore, addHours, addDays } from "date-fns";
import { useLogoColor } from "../../../context/LogoColorContext";

const SeatBookingSystem = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  // State variables
  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingFloor, setLoadingFloor] = useState(false);
  const [floorData, setFloorData] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [spaceCards, setSpaceCards] = useState([]);
  const [loadingRoomDetails, setLoadingRoomDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);

  // Booking form state
  const [bookingFormData, setBookingFormData] = useState({
    type: "one-off",
    chosen_days: [{
      start_time: null,
      end_time: null
    }],
    number_weeks: "0",
    number_months: "0",
    user_id: ""
  });

  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    myRoomID: null,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
    pageSize: 10,
  });

  const [formData, setFormData] = useState({
    name: "",
    location_id: "",
    floor_id: "",
    room_id: ""
  });

  // Format date time
  const formatDateTime = (isoString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(isoString).toLocaleDateString("en-US", options);
  };

  // Fetch locations
  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        setLocations(result.data.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-users`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        setUsers(result.data.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch users.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle location change
  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setFormData((prev) => ({
      ...prev,
      location_id: locationId,
      floor_id: "",
      room_id: ""
    }));
    setFloorData([]);
    setRoomsData([]);
    setData([]);
    setSpaceCards([]);
    setRoomDetails(null);
  };

  // Fetch floors for selected location
  const fetchFloor = async (locationId) => {
    setLoadingFloor(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/list-floors/${locationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result && Array.isArray(result.data.data)) {
        setFloorData(result.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingFloor(false);
    }
  };

  // Fetch rooms for selected floor
  const fetchRoom = async (locationId, floorId, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/list-spaces/${locationId}/${floorId}?page=${page}&per_page=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result && Array.isArray(result)) {
        const sortedData = result.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setRoomsData(sortedData);
        setData(sortedData);
        setPagination({
          currentPage: result.current_page,
          totalPages: result.last_page,
          nextPageUrl: result.next_page_url,
          prevPageUrl: result.prev_page_url,
          pageSize: pageSize,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate space cards based on space_number (fallback)
  const generateSpaceCards = (spaceNumber, roomDetails) => {
    return Array.from({ length: spaceNumber }, (_, i) => ({
      id: i + 1,
      space_number: i + 1,
      is_available: true,
      space_fee: roomDetails?.price || roomDetails?.space_fee || 0,
      space_type: roomDetails?.space_type || 'Standard'
    }));
  };

  // Fetch individual room details and generate space cards
  const fetchRoomDetails = async (roomId) => {
    if (!roomId) {
      setRoomDetails(null);
      setSpaceCards([]);
      return;
    }

    setLoadingRoomDetails(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/show/${roomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch room details: Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result && result.data) {
        setRoomDetails(result.data);
        
        if (result.data.spots && Array.isArray(result.data.spots)) {
          const cards = result.data.spots.map(spot => ({
            id: spot.id,
            space_number: spot.spot_number || spot.id,
            is_available: true,
            space_fee: spot.price || result.data.price || result.data.space_fee || 0,
            space_type: spot.type || result.data.space_type || 'Standard',
            spotData: spot
          }));
          
          setSpaceCards(cards);
        } else {
          const cards = generateSpaceCards(result.data.space_number, result.data);
          setSpaceCards(cards);
        }
      } else {
        throw new Error("Invalid room details format");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingRoomDetails(false);
    }
  };

  // Handle floor change
  const handleFloorChange = (e) => {
    const floorId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      floor_id: floorId,
      room_id: ""
    }));
    setSelectedRoom(null);
    setSpaceCards([]);
    setRoomDetails(null);

    if (floorId && selectedLocation) {
      fetchRoom(selectedLocation, floorId, pagination.currentPage, pagination.pageSize);
    }
  };

  // Handle room change
  const handleRoomChange = async (e) => {
    const roomId = e.target.value;
    setSelectedRoom(roomId);
    setFormData((prev) => ({
      ...prev,
      room_id: roomId
    }));

    if (roomId) {
      const filteredData = roomsData.filter(room => room.id === roomId);
      setData(filteredData);
      await fetchRoomDetails(roomId);
    } else {
      setData(roomsData);
      setSpaceCards([]);
      setRoomDetails(null);
    }
  };

  // Handle edit click
  const handleEditClick = (myRoom) => {
    setSelectedUser(myRoom);
    setShow(true);
  };

  // Handle close modal
  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);

    if (selectedLocation && formData.floor_id) {
      fetchRoom(selectedLocation, formData.floor_id, pagination.currentPage, pagination.pageSize);
    }
  };

  // Handle changes to day fields
  const handleDayChange = (index, field, value) => {
    const updatedDays = [...bookingFormData.chosen_days];
    
    if (field === 'start_time' && value) {
      const dayName = format(value, 'EEEE').toLowerCase();
      updatedDays[index].day = dayName;
      updatedDays[index].start_time = value;
      
      if (updatedDays[index].end_time && isBefore(updatedDays[index].end_time, value)) {
        updatedDays[index].end_time = addHours(value, 1);
      }
    } else if (field === 'end_time') {
      updatedDays[index].end_time = value;
    }
    
    setBookingFormData(prev => ({
      ...prev,
      chosen_days: updatedDays
    }));
  };

  // Add a new day to the booking
  const addDay = () => {
    setBookingFormData(prev => ({
      ...prev,
      chosen_days: [
        ...prev.chosen_days,
        { start_time: null, end_time: null }
      ]
    }));
  };

  // Remove a day from the booking
  const removeDay = (index) => {
    setBookingFormData(prev => ({
      ...prev,
      chosen_days: prev.chosen_days.filter((_, i) => i !== index)
    }));
  };

  // Handle book now click
  const handleBookNowClick = (space) => {
    setSelectedSpace(space);
    setBookingFormData({
      type: "one-off",
      chosen_days: [{
        start_time: null,
        end_time: null
      }],
      number_weeks: "0",
      number_months: "0",
      user_id: ""
    });
    setShowBookingPopup(true);
  };

  const handleBookingClose = () => {
    setShowBookingPopup(false);
    setSelectedSpace(null);
  };

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    
    setBookingFormData(prev => {
      if (name === "type" && value === "one-off") {
        return {
          ...prev,
          type: value,
          number_weeks: "0",
          number_months: "0"
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const formatTimeForAPI = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd HH:mm:ss");
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate chosen days
      const hasEmptyFields = bookingFormData.chosen_days.some(day => 
        !day.day || !day.start_time || !day.end_time
      ) || !bookingFormData.user_id;
      
      if (hasEmptyFields) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare the booking data
      const bookingData = {
        spot_id: selectedSpace.id.toString(),
        user_id: bookingFormData.user_id,
        type: bookingFormData.type,
        number_weeks: bookingFormData.number_weeks || "0",
        number_months: bookingFormData.number_months || "0",
        chosen_days: bookingFormData.chosen_days.map(day => ({
          day: day.day.toLowerCase(), // Still included but not shown to user
          start_time: formatTimeForAPI(day.start_time),
          end_time: formatTimeForAPI(day.end_time)
        }))
      };

      console.log('Booking payload:', JSON.stringify(bookingData, null, 2));

      // Validate time ranges
      for (const day of bookingData.chosen_days) {
        const start = parseISO(day.start_time.replace(' ', 'T') + 'Z');
        const end = parseISO(day.end_time.replace(' ', 'T') + 'Z');
        
        if (isBefore(end, start)) {
          throw new Error("End time must be after start time");
        }
      }

      // Make API call
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/book`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Timezone-Offset": new Date().getTimezoneOffset()
          },
          body: JSON.stringify(bookingData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to book space");
      }

      const result = await response.json();
      toast.success(result.message || "Space booked successfully!");
      handleBookingClose();
      
      // Refresh the space data
      if (selectedRoom) {
        await fetchRoomDetails(selectedRoom);
      }
    } catch (error) {
      toast.error(error.message || "Failed to book space");
    } finally {
      setIsLoading(false);
    }
  };

  // Use effects
  useEffect(() => {
    if (user?.tenantToken) {
      fetchLocations();
      fetchUsers();
    }
  }, [user?.tenantToken]);

  useEffect(() => {
    if (selectedLocation) {
      fetchFloor(selectedLocation);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (formData.floor_id && user?.tenantToken) {
      fetchRoom(selectedLocation, formData.floor_id, pagination.currentPage, pagination.pageSize);
    }
  }, [user?.tenantToken, selectedLocation, formData.floor_id, pagination.currentPage, pagination.pageSize]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Book Spot", path: "/room/my-rooms", active: true },
        ]}
        title="Book Spot"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card>
                <Card.Body style={{ 
                  background: "linear-gradient(to left,rgb(243, 233, 231),rgb(239, 234, 230))", 
                  marginTop: "30px" 
                }}>
                  {/* Location Selection */}
                  {loadingLocations ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>{" "}
                      Loading your locations...
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom: "10px", fontSize: "1rem" }}>
                        Select a location to view the room.
                      </p>
                      <Form.Select
                        style={{ marginBottom: "25px", fontSize: "1rem" }}
                        value={selectedLocation || ""}
                        onChange={handleLocationChange}
                      >
                        <option value="" disabled>
                          Select a location
                        </option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} at {location.state}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  )}

                  {/* Floor Selection */}
                  {selectedLocation && (
                    <Form.Group className="mb-3" controlId="location_id">
                      {loadingFloor ? (
                        <div className="text-center">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading floors/sections...</span>
                          </Spinner>
                        </div>
                      ) : (
                        <>
                          <Form.Label>
                            Select the Floor of the room you want to view.
                          </Form.Label>
                          <Form.Select
                            name="floor_id"
                            value={formData.floor_id}
                            onChange={handleFloorChange}
                            required
                          >
                            <option value="">Select a Floor/Section</option>
                            {Array.isArray(floorData) &&
                              floorData.map((floor) => (
                                <option key={floor.id} value={floor.id}>
                                  {floor.name}
                                </option>
                              ))}
                          </Form.Select>
                        </>
                      )}
                    </Form.Group>
                  )}

                  {/* Room Selection */}
                  {formData.floor_id && (
                    <Form.Group className="mb-3" controlId="room_id">
                      <Form.Label>
                        Select a specific room (optional)
                      </Form.Label>
                      <Form.Select
                        name="room_id"
                        value={formData.room_id}
                        onChange={handleRoomChange}
                      >
                        <option value="">All Rooms</option>
                        {Array.isArray(roomsData) &&
                          roomsData.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.space_name} (No: {room.space_number})
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  )}

                  {/* Rooms Table */}
                  {formData.floor_id && (
                    <>
                      {loading ? (
                        <p>Loading rooms...</p>
                      ) : isLoading ? (
                        <div className="text-center">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Booking...</span>
                          </Spinner>{" "}
                          Booking...
                        </div>
                      ) : (
                        <>
                          {/* Room Details and Spaces Section */}
                          {selectedRoom && (
                            <div className="mt-4">
                              {/* Spaces Section */}
                              <h4 className="mb-3">Available Spaces</h4>
                              {loadingRoomDetails ? (
                                <div className="text-center">
                                  <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading spaces...</span>
                                  </Spinner>
                                </div>
                              ) : spaceCards && spaceCards.length > 0 ? (
                                <>
                                  <p className="mb-3">Total spaces: {spaceCards.length}</p>
                                  <Row>
                                    {spaceCards.map((space) => (
                                      <Col key={space.id} md={3} className="mb-3">
                                        <Card className="h-100">
                                          <Card.Body className="d-flex flex-column">
                                            <Card.Title className="d-flex justify-content-between align-items-center">
                                              <span>Space {space.space_number}</span>
                                              <Badge bg="success">Available</Badge>
                                            </Card.Title>
                                            <Card.Text className="flex-grow-1">
                                              <div><strong>Number:</strong> {space.space_number}</div>
                                              <div><strong>Fee:</strong> ${space.space_fee}</div>
                                              <div><strong>Type:</strong> {space.space_type}</div>
                                            </Card.Text>
                                            <div className="mt-auto">
                                              <Button 
                                                variant="primary" 
                                                size="sm"
                                                className="w-100"
                                                onClick={() => handleBookNowClick(space)}
                                                                                                              style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}

                                              >
                                                Book Now
                                              </Button>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                </>
                              ) : (
                                <Alert variant="info">
                                  {roomDetails ? "No spaces configured for this room" : "Select a room to view spaces"}
                                </Alert>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Popups */}
      {popup.isVisible && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ ...popup, isVisible: false })}
          buttonLabel={popup.buttonLabel}
          buttonRoute={popup.buttonRoute}
        />
      )}

      {deletePopup.isVisible && (
        <Popup
          message="Are you sure you want to delete this room?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, myRoomID: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}

      {/* User Registration Modal */}
      <UsersRegistrationModal
        show={show}
        onHide={handleClose}
        myUser={selectedUser}
        onSubmit={fetchUsers}
      />

      {/* Booking Popup */}
      {showBookingPopup && selectedSpace && (
        <Popup
          title={`Book Space ${selectedSpace.space_number}`}
          isVisible={showBookingPopup}
          onClose={handleBookingClose}
          size="lg"
        >
          <div style={{ maxHeight: "70vh", overflowY: "auto", overflowX: "hidden", paddingRight: "8px" }}>
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

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select User</Form.Label>
                    <div className="d-flex align-items-center mb-2">
                      {loadingUsers ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Form.Select
                          name="user_id"
                          value={bookingFormData.user_id}
                          onChange={handleBookingInputChange}
                          required
                          className="me-2"
                        >
                          <option value="">Select a user</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} ({user.email})
                            </option>
                          ))}
                        </Form.Select>
                      )}
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => {
                          setSelectedUser(null);
                          setShow(true);
                        }}
                        style={{ borderColor: primary, color: primary }}
                      >
                        <i className="mdi mdi-plus"></i> Add User
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

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
                          onChange={(date) => handleDayChange(index, 'start_time', date)}
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
                          onChange={(date) => handleDayChange(index, 'end_time', date)}
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
                      style={{ borderColor: primary, color: primary }}
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
                style={{ borderColor: primary, color: primary }}
              >
                Add Another Time Slot
              </Button>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={handleBookingClose} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}                                                               style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
>
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}Booking...
                    </>
                  ) : 'Confirm Booking'}
                </Button>
              </div>
            </Form>
          </div>
        </Popup>
      )}
    </>
  );
};

export default SeatBookingSystem;