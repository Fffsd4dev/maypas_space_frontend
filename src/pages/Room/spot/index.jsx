import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form, Badge, Alert } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import UsersRegistrationModal from "../../MyWorkspaceAccount/Personal/UsersRegistrationForm"; // Import the modal component

const SeatBookingSystem = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

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

  // Booking popup states
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    type: "one-off",
    chosen_days: [{
      day: "",
      start_time: "",
      end_time: ""
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

  // Generate space cards based on space_number
  const generateSpaceCards = (spaceNumber) => {
    if (!spaceNumber || isNaN(spaceNumber) || spaceNumber <= 0) return [];
    
    const cards = [];
    for (let i = 1; i <= spaceNumber; i++) {
      cards.push({
        id: i,
        space_number: i,
        is_available: true, // Default to available
        space_fee: roomDetails?.space_fee || 0,
        space_type: 'Standard'
      });
    }
    return cards;
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
        // Generate space cards based on space_number
        const cards = generateSpaceCards(result.data.space_number);
        setSpaceCards(cards);
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

  // Handle delete
  const handleDelete = async (myRoomID) => {
    if (!user?.tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myRoomID }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setData((prevData) => prevData.filter((myRoom) => myRoom.id !== myRoomID));
      setPopup({
        message: "Room deleted successfully!",
        type: "success",
        isVisible: true,
      });
      
      if (formData.floor_id && selectedLocation) {
        fetchRoom(
          selectedLocation,
          formData.floor_id,
          pagination.currentPage,
          pagination.pageSize
        );
      }
    } catch (error) {
      toast.error("Failed to delete room!");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete button click
  const handleDeleteButton = (myRoomID) => {
    setDeletePopup({
      isVisible: true,
      myRoomID,
    });
  };

  // Confirm delete
  const confirmDelete = () => {
    const { myRoomID } = deletePopup;
    handleDelete(myRoomID);
    setDeletePopup({ isVisible: false, myRoomID: null });
  };

  // Handle changes to day fields
  const handleDayChange = (index, field, value) => {
    const updatedDays = [...bookingFormData.chosen_days];
    updatedDays[index][field] = value;
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
        { day: "", start_time: "", end_time: "" }
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
    console.log("Book Now clicked for spot ID:", space.id);
    setSelectedSpace(space);
    setBookingFormData({
      type: "one-off",
      chosen_days: [{
        day: "",
        start_time: "",
        end_time: ""
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
      // If booking type is changing to "one-off", reset weeks and months to 0
      if (name === "type" && value === "one-off") {
        return {
          ...prev,
          type: value,
          number_weeks: "0",
          number_months: "0"
        };
      }
      
      // Otherwise, just update the changed field
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const formatTimeForAPI = (datetimeString) => {
    if (!datetimeString) return "";
    const date = new Date(datetimeString);
    return date.toISOString().replace('T', ' ').substring(0, 19);
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

      // Validate time ranges
      for (const day of bookingFormData.chosen_days) {
        if (new Date(day.start_time) >= new Date(day.end_time)) {
          throw new Error("End time must be after start time");
        }
      }

      // Validate recurring booking fields if needed
      if (bookingFormData.type === "recurring") {
        if (!bookingFormData.number_weeks && !bookingFormData.number_months) {
          throw new Error("Please specify duration for recurring booking");
        }
      }

      // Prepare the booking data with the selected user_id
      const bookingData = {
        spot_id: selectedSpace.id.toString(),
        user_id: bookingFormData.user_id,
        type: bookingFormData.type,
        number_weeks: bookingFormData.number_weeks || "0",
        number_months: bookingFormData.number_months || "0",
        chosen_days: bookingFormData.chosen_days.map(day => ({
          day: day.day.toLowerCase(),
          start_time: formatTimeForAPI(day.start_time),
          end_time: formatTimeForAPI(day.end_time)
        }))
      };

      console.log("Submitting booking with data:", bookingData);

      // Make API call to your specific endpoint
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/book`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
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

  // Table columns
  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Room Name",
      accessor: "space_name",
      sort: true,
    },
    {
      Header: "Space Number",
      accessor: "space_number",
      sort: true,
    },
    {
      Header: "Space Fee",
      accessor: "space_fee",
      sort: true,
    },
    {
      Header: "Created On",
      accessor: "created_at",
      sort: true,
      Cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      Header: "Updated On",
      accessor: "updated_at",
      sort: true,
      Cell: ({ row }) => formatDateTime(row.original.updated_at),
    },
    {
      Header: "Action",
      accessor: "action",
      sort: false,
      Cell: ({ row }) => (
        <>
          <Link
            to="#"
            className="action-icon"
            onClick={() => handleEditClick(row.original)}
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon"
            onClick={() => handleDeleteButton(row.original.id)}
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </>
      ),
    },
  ];

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
                            <span className="visually-hidden">Deleting...</span>
                          </Spinner>{" "}
                          Deleting...
                        </div>
                      ) : (
                        <>
                          <Table2
                            columns={columns}
                            data={data}
                            pageSize={pagination.pageSize}
                            isSortable
                            pagination
                            isSearchable
                            tableClass="table-striped dt-responsive nowrap w-100"
                            searchBoxClass="my-2"
                            paginationProps={{
                              currentPage: pagination.currentPage,
                              totalPages: pagination.totalPages,
                              onPageChange: (page) =>
                                setPagination((prev) => ({
                                  ...prev,
                                  currentPage: page,
                                })),
                              onPageSizeChange: (pageSize) =>
                                setPagination((prev) => ({ ...prev, pageSize })),
                            }}
                          />

                          {/* Room Details and Spaces Section */}
                          {selectedRoom && (
                            <div className="mt-4">
                              {/* Room Details Card */}
                              {loadingRoomDetails ? (
                                <div className="text-center mb-4">
                                  <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading room details...</span>
                                  </Spinner>
                                </div>
                              ) : roomDetails ? (
                                <Card className="mb-4">
                                  <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Room Details</h5>
                                    <Badge bg="info">ID: {roomDetails.id}</Badge>
                                  </Card.Header>
                                  <Card.Body>
                                    <Row>
                                      <Col md={6}>
                                        <p><strong>Name:</strong> {roomDetails.space_name}</p>
                                        <p><strong>Number:</strong> {roomDetails.space_number}</p>
                                        <p><strong>Capacity:</strong> {roomDetails.capacity || 'N/A'}</p>
                                      </Col>
                                      <Col md={6}>
                                        <p><strong>Fee:</strong> ${roomDetails.space_fee || '0.00'}</p>
                                        <p><strong>Status:</strong> 
                                          <Badge bg={roomDetails.status === 'active' ? 'success' : 'secondary'} className="ms-2">
                                            {roomDetails.status || 'N/A'}
                                          </Badge>
                                        </p>
                                        <p><strong>Created:</strong> {formatDateTime(roomDetails.created_at)}</p>
                                      </Col>
                                    </Row>
                                    {roomDetails.description && (
                                      <div className="mt-3">
                                        <strong>Description:</strong>
                                        <Card className="mt-1">
                                          <Card.Body className="p-2">
                                            {roomDetails.description}
                                          </Card.Body>
                                        </Card>
                                      </div>
                                    )}
                                  </Card.Body>
                                </Card>
                              ) : (
                                <Alert variant="warning" className="mb-4">
                                  No details available for this room
                                </Alert>
                              )}

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
                                              <Badge bg={space.is_available ? "success" : "danger"}>
                                                {space.is_available ? "Available" : "Occupied"}
                                              </Badge>
                                            </Card.Title>
                                            <Card.Text className="flex-grow-1">
                                              <div><strong>Number:</strong> {space.space_number}</div>
                                              <div><strong>Fee:</strong> ${space.space_fee}</div>
                                              <div><strong>Type:</strong> {space.space_type}</div>
                                            </Card.Text>
                                            <div className="mt-auto">
                                              <Button 
                                                variant={space.is_available ? "primary" : "secondary"} 
                                                size="sm"
                                                disabled={!space.is_available}
                                                className="w-100"
                                                onClick={() => handleBookNowClick(space)}
                                              >
                                                {space.is_available ? "Book Now" : "Unavailable"}
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
        onSubmit={fetchUsers} // Reload users after adding or editing a user
      />

      {/* Booking Popup */}
      {showBookingPopup && selectedSpace && (
        <Popup
          title={`Book Space ${selectedSpace.space_number}`}
          isVisible={showBookingPopup}
          onClose={handleBookingClose}
          size="lg"
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
                    <option value="recurring">Recurring Booking</option>
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
                    >
                      <i className="mdi mdi-plus"></i> Add User
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {bookingFormData.type === "recurring" && (
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
                      required={bookingFormData.type === "recurring"}
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
                      required={bookingFormData.type === "recurring"}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <h5 className="mt-3">Booking Schedule</h5>
            {bookingFormData.chosen_days.map((day, index) => (
              <div key={index} className="border p-3 mb-3">
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Day</Form.Label>
                      <Form.Select
                        name={`day-${index}`}
                        value={day.day}
                        onChange={(e) => handleDayChange(index, 'day', e.target.value)}
                        required
                      >
                        <option value="">Select day</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name={`start_time-${index}`}
                        value={day.start_time}
                        onChange={(e) => handleDayChange(index, 'start_time', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name={`end_time-${index}`}
                        value={day.end_time}
                        onChange={(e) => handleDayChange(index, 'end_time', e.target.value)}
                        required
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
                    Remove Day
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
              Add Another Day
            </Button>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleBookingClose} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    {' '}Booking...
                  </>
                ) : 'Confirm Booking'}
              </Button>
            </div>
          </Form>
        </Popup>
      )}
    </>
  );
};

export default SeatBookingSystem;