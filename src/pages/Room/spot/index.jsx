// import React, { useState, useEffect } from "react";
// import { Link, useParams } from "react-router-dom";
// import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
// import PageTitle from "../../../components/PageTitle";
// import SpotRegistrationModal from "./SpotRegistrationForm";
// import { useAuthContext } from "@/context/useAuthContext.jsx";
// import Popup from "../../../components/Popup/Popup";
// import Table2 from "../../../components/Table2";

// const Spots = () => {
//   const { user } = useAuthContext();
//   const tenantToken = user?.tenantToken;
//   const tenantSlug = user?.tenant;

//   const [show, setShow] = useState(false);
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingLocations, setLoadingLocations] = useState(true);
//   const [loadingFloor, setLoadingFloor] = useState(false);
//   const [error, setError] = useState(null);
//   const [floorData, setFloorData] = useState([]);
  
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [popup, setPopup] = useState({
//     message: "",
//     type: "",
//     isVisible: false,
//     buttonLabel: "",
//     buttonRoute: "",
//   });
//   const [errorMessage, setErrorMessage] = useState("");
//   const [isError, setIsError] = useState(false);
//   const [locations, setLocations] = useState([]);
//   const [selectedLocation, setSelectedLocation] = useState(null);

//   const [deletePopup, setDeletePopup] = useState({
//     isVisible: false,
//     mySpotID: null,
//   });

//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     nextPageUrl: null,
//     prevPageUrl: null,
//     pageSize: 10,
//   });

//   const formatDateTime = (isoString) => {
//     const options = {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     };
//     return new Date(isoString).toLocaleDateString("en-US", options);
//   };

//   const [formData, setFormData] = useState({
//           name: "",
//           location_id: "",
//           floor_id: ""
//       });

//   const fetchLocations = async () => {
//     setLoadingLocations(true);
//     try {
//       const response = await fetch(
//         `${
//           import.meta.env.VITE_BACKEND_URL
//         }/api/${tenantSlug}/location/list-locations`,
//         {
//           headers: { Authorization: `Bearer ${user.tenantToken}` },
//         }
//       );
//       const result = await response.json();
//       if (response.ok) {
//         console.log("Location:", result.data.data);
//         setLocations(result.data.data || []);
//       } else {
//         throw new Error(result.message || "Failed to fetch locations.");
//       }
//     } catch (error) {
//       setErrorMessage(error.message);
//       setIsError(true);
//     } finally {
//       setLoadingLocations(false);
//     }
//   };

//   const handleLocationChange = (e) => {
//     const locationId = e.target.value;
//     setSelectedLocation(locationId);
//     setFormData((prev) => ({
//       ...prev,
//       location_id: locationId, // Update formData with the selected location ID
//     }));
//   };

//   const fetchFloor = async (locationId) => {
//     setLoadingFloor(true);
//     console.log("loadingFloor...")
//     setError(null);
//     console.log("User Token:", user?.tenantToken);
//     try {
//       const response = await fetch(
//         `${
//           import.meta.env.VITE_BACKEND_URL
//         }/api/${tenantSlug}/floor/list-floors/${locationId}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${user?.tenantToken}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log(result);
//       if (result && Array.isArray(result.data.data)) {
//         setFloorData(result.data.data); // Store floors in state
//       } else {
//         throw new Error("Invalid response format");
//       }
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoadingFloor(false);
//     }
//   };
//   useEffect(() => {
//       if (selectedLocation) {
//         fetchFloor(selectedLocation); // Fetch floors based on the selected location ID
//       }
//     }, [selectedLocation]);



//   const fetchSpot = async (locationId, floorId, page = 1, pageSize = 10) => {
//     setLoading(true);
//     console.log("fetching rooms")
//     setError(null);
//     console.log("User Token:", user?.tenantToken);
//     try {
//       const response = await fetch(
//         `${
//           import.meta.env.VITE_BACKEND_URL
//         }/api/${tenantSlug}/space/list-spaces/${locationId}/${floorId}?page=${page}&per_page=${pageSize}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${user?.tenantToken}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log("roooms:", result)
//       if (result && Array.isArray(result.data.data)) {
//         const data = result.data.data;
//         data.sort(
//           (a, b) =>
//             new Date(b.updated_at || b.created_at) -
//             new Date(a.updated_at || a.created_at)
//         );
//         setData(data);
//         setPagination({
//           currentPage: result.data.current_page,
//           totalPages: result.data.last_page,
//           nextPageUrl: result.data.next_page_url,
//           prevPageUrl: result.data.prev_page_url,
//           pageSize: pageSize,
//         });
//       } else {
//         throw new Error("Invalid response format");
//       }
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

  

//   useEffect(() => {
//     if (user?.tenantToken) {
//       fetchLocations();
//     }
//   }, [user?.tenantToken]);

//   const handleFloorChange = (e) => {
//     const floorId = e.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       floor_id: floorId, // Update formData with the selected floor ID
//       space_category_id: "", // Reset category when floor changes
//     }));

//     if (floorId && selectedLocation) {
//       fetchSpot(selectedLocation, floorId, pagination.currentPage, pagination.pageSize); // Fetch rooms immediately after floor selection
//     }
//   };


//   useEffect(() => {
//     if (formData.floor_id && user?.tenantToken) {
//       fetchSpot(selectedLocation, formData.floor_id, pagination.currentPage, pagination.pageSize);
//     }
//   }, [user?.tenantToken, selectedLocation, pagination.currentPage, pagination.pageSize]);

//   const handleEditClick = (mySpot) => {
//     setSelectedUser(mySpot);
//     setShow(true);
//   };

//   const handleClose = () => {
//     setShow(false);
//     setSelectedUser(null);
//     if (selectedLocation) {
//       fetchSpot(selectedLocation, pagination.currentPage, pagination.pageSize); // Reload users after closing the modal
//     }
//   };

//   const handleDelete = async (mySpotID) => {
//     if (!user?.tenantToken) return;

//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/delete`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${user?.tenantToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ id: mySpotID }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
//       }

//       setData((prevData) =>
//         prevData.filter((mySpot) => mySpot.id !== mySpotID)
//       );
//       setPopup({
//         message: "Spot deleted successfully!",
//         type: "success",
//         isVisible: true,
//       });
//       if (selectedLocation) {
//         fetchSpot(
//           selectedLocation,
//           pagination.currentPage,
//           pagination.pageSize
//         ); // Reload users after deleting a user
//       }
//     } catch (error) {
//       setPopup({
//         message: "Failed to delete plan!",
//         type: "error",
//         isVisible: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteButton = (mySpotID) => {
//     setDeletePopup({
//       isVisible: true,
//       mySpotID,
//     });
//   };

//   const confirmDelete = () => {
//     const { mySpotID } = deletePopup;
//     handleDelete(mySpotID);
//     setDeletePopup({ isVisible: false, mySpotID: null });
//   };

//   const columns = [
//     {
//       Header: "S/N",
//       accessor: (row, i) => i + 1,
//       id: "serialNo",
//       sort: false,
//     },
//     {
//       Header: "Spot Name",
//       accessor: "space_name",
//       sort: true,
//     },
//     {
//       Header: "Space Number",
//       accessor: "space_number",
//       sort: true,
//     },
//     {
//       Header: "Space Fee",
//       accessor: "space_fee",
//       sort: true,
//     },
//     {
//       Header: "Created On",
//       accessor: "created_at",
//       sort: true,
//       Cell: ({ row }) => formatDateTime(row.original.created_at),
//     },
//     {
//       Header: "Updated On",
//       accessor: "updated_at",
//       sort: true,
//       Cell: ({ row }) => formatDateTime(row.original.updated_at),
//     },
//     {
//       Header: "Action",
//       accessor: "action",
//       sort: false,
//       Cell: ({ row }) => (
//         <>
//           <Link
//             to="#"
//             className="action-icon"
//             onClick={() => handleEditClick(row.original)}
//           >
//             <i className="mdi mdi-square-edit-outline"></i>
//           </Link>
//           <Link
//             to="#"
//             className="action-icon"
//             onClick={() => handleDeleteButton(row.original.id)}
//           >
//             <i className="mdi mdi-delete"></i>
//           </Link>
//         </>
//       ),
//     },
//   ];

//   return (
//     <>
//       <PageTitle
//         breadCrumbItems={[
//           { label: "My Spots", path: "/room/spot", active: true },
//         ]}
//         title="My Spots"
//       />

//       <Row>
//         <Col>
//           <Card>
//             <Card.Body>
//               <Row className="mb-2">
//                 <Col sm={4}>
//                   <Button
//                     variant="danger"
//                     className="waves-effect waves-light"
//                     onClick={() => {
//                       setShow(true);
//                       setSelectedUser(null);
//                     }}
//                   >
//                     <i className="mdi mdi-plus-circle me-1"></i> Add a Spot
//                   </Button>
//                 </Col>
//               </Row>

//               <Card>
//                 <Card.Body style={{ background: "linear-gradient(to left,rgb(243, 233, 231),rgb(239, 234, 230))", marginTop: "30px" }}>
//                   {loadingLocations ? (
//                     <div className="text-center">
//                       <Spinner animation="border" role="status">
//                         <span className="visually-hidden">Loading...</span>
//                       </Spinner>{" "}
//                       Loading your locations...
//                     </div>
//                   ) : (
//                     <div>
//                       <p style={{marginBottom: "10px", fontSize: "1rem" }}>Select a location to view or update the room.</p>
//                       <Form.Select
//                         style={{ marginBottom: "25px", fontSize: "1rem" }}
//                         value={selectedLocation || ""}
//                         onChange={handleLocationChange}
//                       >
//                         <option value="" disabled>
//                           Select a location
//                         </option>
//                         {locations.map((location) => (
//                           <option key={location.id} value={location.id}>
//                             {location.name} at {location.state}
//                           </option>
//                         ))}
//                       </Form.Select>
//                     </div>
//                   )}

//                   {selectedLocation && (
//                     <Form.Group className="mb-3" controlId="location_id">
//                       {loadingFloor ? (
//                         <div className="text-center">
//                           <Spinner animation="border" role="status">
//                             <span className="visually-hidden">Loading floors/sections...</span>
//                           </Spinner>
//                         </div>
//                       ) : (
//                         <>
//                           <Form.Label>Select the Floor of the room you want to view.</Form.Label>
//                           <Form.Select
//                             name="floor_id"
//                             value={formData.floor_id}
//                             onChange={handleFloorChange}
//                             required
//                           >
//                             <option value="">Select a Floor/Section</option>
//                             {Array.isArray(floorData) &&
//                               floorData.map((floor) => (
//                                 <option key={floor.id} value={floor.id}>
//                                   {floor.name}
//                                 </option>
//                               ))}
//                           </Form.Select>
//                         </>
//                       )}
//                     </Form.Group>
//                   )}
                
//                  {formData.floor_id && (
//                 <>
//                   {error ? (
//                     <p className="text-danger">Error: {error}</p>
//                   ) : loading ? (
//                     <p>Loading rooms...</p>
//                   ) : isLoading ? (
//                     <div className="text-center">
//                       <Spinner animation="border" role="status">
//                         <span className="visually-hidden">Deleting...</span>
//                       </Spinner>{" "}
//                       Deleting...
//                     </div>
//                   ) : (
//                     <Table2
//                       columns={columns}
//                       data={data}
//                       pageSize={pagination.pageSize}
//                       isSortable
//                       pagination
//                       isSearchable
//                       tableClass="table-striped dt-responsive nowrap w-100"
//                       searchBoxClass="my-2"
//                       paginationProps={{
//                         currentPage: pagination.currentPage,
//                         totalPages: pagination.totalPages,
//                         onPageChange: (page) =>
//                           setPagination((prev) => ({
//                             ...prev,
//                             currentPage: page,
//                           })),
//                         onPageSizeChange: (pageSize) =>
//                           setPagination((prev) => ({ ...prev, pageSize })),
//                       }}
//                     />
//                   )}
//                 </>
//               )}
//                 </Card.Body>
//               </Card>

             
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <SpotRegistrationModal
//         show={show}
//         onHide={handleClose}
//         mySpot={selectedUser}
//         onSubmit={() =>
//           fetchSpot(
//             selectedLocation,
//             pagination.currentPage,
//             pagination.pageSize
//           )
//         } // Reload users after adding or editing a user
//       />

//       {popup.isVisible && (
//         <Popup
//           message={popup.message}
//           type={popup.type}
//           onClose={() => setPopup({ ...popup, isVisible: false })}
//           buttonLabel={popup.buttonLabel}
//           buttonRoute={popup.buttonRoute}
//         />
//       )}

//       {deletePopup.isVisible && (
//         <Popup
//           message="Are you sure you want to delete this room?"
//           type="confirm"
//           onClose={() => setDeletePopup({ isVisible: false, mySpotID: null })}
//           buttonLabel="Yes"
//           onAction={confirmDelete}
//         />
//       )}
//     </>
//   );
// };

// export default Spots;









// import React, { useState, useEffect } from 'react';
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Modal,
//   Form,
//   Badge,
//   Spinner,
//   Alert,
//   ListGroup
// } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const SeatBookingSystem = () => {
//   // State management
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [seatData, setSeatData] = useState({ floor1: [], floor2: [] });
//   const [activeBookings, setActiveBookings] = useState({});
//   const [showBookingModal, setShowBookingModal] = useState(false);
//   const [selectedSeat, setSelectedSeat] = useState(null);
//   const [formData, setFormData] = useState({
//     userName: '',
//     userEmail: '',
//     bookingDate: new Date().toISOString().split('T')[0],
//     startTime: '',
//     duration: '30'
//   });
//   const [timeConflict, setTimeConflict] = useState(false);

//   // Fetch seat data from backend
//   useEffect(() => {
//     const fetchSeatData = async () => {
//       try {
//         setLoading(true);
//         // Simulating API call with timeout
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         // Mock data
//         const mockData = {
//           floor1: [
//             { number: 'A1', status: 'available' },
//             { number: 'A2', status: 'booked' },
//             { number: 'A3', status: 'available' },
//             { number: 'A4', status: 'reserved' },
//             { number: 'B1', status: 'available' },
//             { number: 'B2', status: 'available' },
//             { number: 'B3', status: 'booked' },
//             { number: 'B4', status: 'available' },
//             { number: 'C1', status: 'reserved' },
//             { number: 'C2', status: 'available' },
//             { number: 'C3', status: 'available' },
//             // { number: 'C4', status: 'booked' }
//           ],
//           floor2: [
//             { number: 'D1', status: 'available' },
//             { number: 'D2', status: 'available' },
//             { number: 'D3', status: 'available' },
//             { number: 'D4', status: 'reserved' },
//             { number: 'E1', status: 'booked' },
//             { number: 'E2', status: 'available' },
//             { number: 'E3', status: 'available' },
//             { number: 'E4', status: 'booked' }
//           ]
//         };
        
//         setSeatData(mockData);
//         loadBookings();
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load seat data. Please try again later.');
//         setLoading(false);
//         console.error('Error fetching seat data:', err);
//       }
//     };

//     fetchSeatData();
//   }, []);

//   // Load bookings from localStorage
//   const loadBookings = () => {
//     try {
//       const saved = localStorage.getItem('activeBookings');
//       if (saved) {
//         const bookingsData = JSON.parse(saved);
//         const now = Date.now();
//         const activeBookings = {};
        
//         Object.keys(bookingsData).forEach(seatNumber => {
//           const active = bookingsData[seatNumber].filter(booking => {
//             return booking.endTimestamp > now;
//           });
          
//           if (active.length > 0) {
//             activeBookings[seatNumber] = active;
            
//             active.forEach(booking => {
//               const durationMs = booking.endTimestamp - now;
//               if (durationMs > 0) {
//                 setTimeout(() => {
//                   releaseSeatIfExpired(seatNumber);
//                 }, durationMs);
//               }
//             });
//           }
//         });
        
//         setActiveBookings(activeBookings);
//       }
//     } catch (e) {
//       console.error('Error loading bookings:', e);
//       localStorage.removeItem('activeBookings');
//     }
//   };

//   // Save bookings to localStorage
//   const saveBookings = (bookings) => {
//     localStorage.setItem('activeBookings', JSON.stringify(bookings));
//   };

//   // Handle seat selection
//   const handleSeatClick = (seat) => {
//     const status = getSeatStatus(seat);
//     if (status === 'booked' || status === 'fully-booked') return;
    
//     setSelectedSeat(seat);
//     setFormData({
//       ...formData,
//       bookingDate: new Date().toISOString().split('T')[0],
//       startTime: '',
//       duration: '30'
//     });
//     setTimeConflict(false);
//     setShowBookingModal(true);
//   };

//   // Close booking modal
//   const handleCloseModal = () => {
//     setShowBookingModal(false);
//     setSelectedSeat(null);
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
    
//     if (name === 'bookingDate' || name === 'startTime' || name === 'duration') {
//       setTimeConflict(false);
//     }
//   };

//   // Check if a time slot is available
//   const isTimeSlotAvailable = (seatNumber, date, startTime, duration) => {
//     const bookings = activeBookings[seatNumber] || [];
//     const [startHour, startMinute] = startTime.split(':').map(Number);
    
//     const endTime = new Date(0, 0, 0, startHour, startMinute + parseInt(duration));
//     const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
//     return !bookings.some(booking => {
//       if (booking.date !== date) return false;
      
//       const bookingStart = booking.startTime;
//       const bookingEnd = booking.endTime;
      
//       return !(endTimeString <= bookingStart || startTime >= bookingEnd);
//     });
//   };

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!formData.userName || !formData.userEmail || !formData.startTime || !formData.duration) {
//       return;
//     }
    
//     if (!isTimeSlotAvailable(
//       selectedSeat.number,
//       formData.bookingDate,
//       formData.startTime,
//       formData.duration
//     )) {
//       setTimeConflict(true);
//       return;
//     }
    
//     const [startHour, startMinute] = formData.startTime.split(':').map(Number);
//     const endTime = new Date(0, 0, 0, startHour, startMinute + parseInt(formData.duration));
//     const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
//     const bookingData = {
//       seatNumber: selectedSeat.number,
//       userName: formData.userName,
//       userEmail: formData.userEmail,
//       date: formData.bookingDate,
//       startTime: formData.startTime,
//       endTime: endTimeString,
//       duration: formData.duration,
//       startTimestamp: getTimestamp(formData.bookingDate, formData.startTime),
//       endTimestamp: getTimestamp(formData.bookingDate, endTimeString)
//     };
    
//     const updatedBookings = { ...activeBookings };
//     if (!updatedBookings[selectedSeat.number]) {
//       updatedBookings[selectedSeat.number] = [];
//     }
//     updatedBookings[selectedSeat.number].push(bookingData);
    
//     setActiveBookings(updatedBookings);
//     saveBookings(updatedBookings);
    
//     const durationMs = bookingData.endTimestamp - Date.now();
//     if (durationMs > 0) {
//       setTimeout(() => {
//         releaseSeatIfExpired(selectedSeat.number);
//       }, durationMs);
//     }
    
//     alert(`Booking confirmed for seat ${bookingData.seatNumber} from ${bookingData.startTime} to ${bookingData.endTime} on ${bookingData.date}!`);
    
//     setFormData({
//       userName: '',
//       userEmail: '',
//       bookingDate: new Date().toISOString().split('T')[0],
//       startTime: '',
//       duration: '30'
//     });
//     setShowBookingModal(false);
//   };

//   // Release seat if booking has expired
//   const releaseSeatIfExpired = (seatNumber) => {
//     const now = Date.now();
//     const updatedBookings = { ...activeBookings };
    
//     if (updatedBookings[seatNumber]) {
//       const active = updatedBookings[seatNumber].filter(booking => booking.endTimestamp > now);
      
//       if (active.length === 0) {
//         delete updatedBookings[seatNumber];
//       } else {
//         updatedBookings[seatNumber] = active;
//       }
      
//       setActiveBookings(updatedBookings);
//       saveBookings(updatedBookings);
//     }
//   };

//   // Get timestamp from date and time
//   const getTimestamp = (dateStr, timeStr) => {
//     const [year, month, day] = dateStr.split('-').map(Number);
//     const [hours, minutes] = timeStr.split(':').map(Number);
//     return new Date(year, month - 1, day, hours, minutes).getTime();
//   };

//   // Generate time slots for the dropdown
//   const generateTimeSlots = () => {
//     const slots = [];
//     for (let hour = 12; hour < 24; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//         slots.push(timeString);
//       }
//     }
//     return slots;
//   };

//   // Check if seat is fully booked
//   const isSeatFullyBooked = (seatNumber) => {
//     const bookings = activeBookings[seatNumber] || [];
//     if (bookings.length === 0) return false;
    
//     const allSlots = [];
//     for (let hour = 12; hour < 24; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//         allSlots.push(timeString);
//       }
//     }
    
//     const today = new Date().toISOString().split('T')[0];
//     const todayBookings = bookings.filter(b => b.date === today);
    
//     const bookedSlots = new Set();
//     todayBookings.forEach(booking => {
//       const [startHour, startMinute] = booking.startTime.split(':').map(Number);
//       const [endHour, endMinute] = booking.endTime.split(':').map(Number);
      
//       let currentHour = startHour;
//       let currentMinute = startMinute;
      
//       while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
//         const slot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
//         bookedSlots.add(slot);
        
//         currentMinute += 30;
//         if (currentMinute >= 60) {
//           currentMinute = 0;
//           currentHour++;
//         }
//       }
//     });
    
//     return allSlots.every(slot => bookedSlots.has(slot));
//   };

//   // Get seat status
//   const getSeatStatus = (seat) => {
//     if (isSeatFullyBooked(seat.number)) return 'fully-booked';
    
//     const bookings = activeBookings[seat.number] || [];
//     const now = Date.now();
    
//     const isCurrentlyBooked = bookings.some(booking => 
//       now >= booking.startTimestamp && now < booking.endTimestamp
//     );
    
//     if (isCurrentlyBooked) return 'booked';
//     return seat.status;
//   };

//   // Get seat color based on status
//   const getSeatColor = (status) => {
//     switch (status) {
//       case 'available': return 'success';
//       case 'booked': return 'danger';
//       case 'reserved': return 'warning';
//       case 'fully-booked': return 'secondary';
//       default: return 'light';
//     }
//   };

//   // Seat component
//   const Seat = ({ seat }) => {
//     const status = getSeatStatus(seat);
//     const color = getSeatColor(status);
//     const isFullyBooked = status === 'fully-booked';
//     const isBooked = status === 'booked';
    
//     // Safely get current booking
//     const currentBooking = isBooked && activeBookings[seat.number] 
//       ? activeBookings[seat.number].find(b => 
//           Date.now() >= b.startTimestamp && Date.now() < b.endTimestamp
//         )
//       : null;
    
//     return (
//       <Col xs={4} md={3} lg={2} className="mb-3">
//         <Card
//           bg={color}
//           text={color === 'warning' ? 'dark' : 'white'}
//           className={`h-100 ${isFullyBooked ? '' : 'cursor-pointer'}`}
//           onClick={() => !isFullyBooked && handleSeatClick(seat)}
//         >
//           <Card.Body className="text-center d-flex flex-column justify-content-center">
//             <Card.Title>{seat.number}</Card.Title>
//             <Card.Text className="mb-1">
//               {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
//             </Card.Text>
//             {isBooked && currentBooking && (
//               <small className="text-light">
//                 {currentBooking.startTime}-{currentBooking.endTime}
//               </small>
//             )}
//             {isFullyBooked && (
//               <small className="text-danger fw-bold">No available slots</small>
//             )}
//           </Card.Body>
//         </Card>
//       </Col>
//     );
//   };

//   // Generate available time slots for selected seat and date
//   const getAvailableTimeSlots = () => {
//     if (!selectedSeat) return [];
    
//     const slots = generateTimeSlots();
//     const bookings = activeBookings[selectedSeat.number] || [];
//     const selectedDate = formData.bookingDate;
    
//     const bookedSlots = new Set();
//     bookings.forEach(booking => {
//       if (booking.date === selectedDate) {
//         const [startHour, startMinute] = booking.startTime.split(':').map(Number);
//         const [endHour, endMinute] = booking.endTime.split(':').map(Number);
        
//         let currentHour = startHour;
//         let currentMinute = startMinute;
        
//         while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
//           const slot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
//           bookedSlots.add(slot);
          
//           currentMinute += 30;
//           if (currentMinute >= 60) {
//             currentMinute = 0;
//             currentHour++;
//           }
//         }
//       }
//     });
    
//     return slots.map(slot => ({
//       time: slot,
//       available: !bookedSlots.has(slot)
//     }));
//   };

//   return (
//     <Container className="py-4">
//       <h1 className="text-center mb-4">Workspace Seat Booking</h1>
      
//       {/* Legend */}
//       <ListGroup horizontal className="mb-4 justify-content-center">
//         <ListGroup.Item className="d-flex align-items-center">
//           <Badge bg="success" className="me-2">&nbsp;</Badge>
//           Available
//         </ListGroup.Item>
//         <ListGroup.Item className="d-flex align-items-center">
//           <Badge bg="danger" className="me-2">&nbsp;</Badge>
//           Booked
//         </ListGroup.Item>
//         <ListGroup.Item className="d-flex align-items-center">
//           <Badge bg="warning" className="me-2">&nbsp;</Badge>
//           Reserved
//         </ListGroup.Item>
//         <ListGroup.Item className="d-flex align-items-center">
//           <Badge bg="secondary" className="me-2">&nbsp;</Badge>
//           Fully Booked
//         </ListGroup.Item>
//       </ListGroup>
      
//       {loading ? (
//         <div className="text-center py-5">
//           <Spinner animation="border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </Spinner>
//           <p className="mt-3">Loading seat availability...</p>
//         </div>
//       ) : error ? (
//         <Alert variant="danger" className="text-center">
//           {error}
//         </Alert>
//       ) : (
//         <>
//           {/* Floor 1 */}
//           <Card className="mb-4">
//             <Card.Header>
//               <h5 className="mb-0">Floor 1 - Main Workspace</h5>
//             </Card.Header>
//             <Card.Body>
//               <Row>
//                 {seatData.floor1.map(seat => (
//                   <Seat key={`floor1-${seat.number}`} seat={seat} />
//                 ))}
//               </Row>
//             </Card.Body>
//           </Card>
          
//           {/* Floor 2 */}
//           <Card className="mb-4">
//             <Card.Header>
//               <h5 className="mb-0">Floor 2 - Quiet Zone</h5>
//             </Card.Header>
//             <Card.Body>
//               <Row>
//                 {seatData.floor2.map(seat => (
//                   <Seat key={`floor2-${seat.number}`} seat={seat} />
//                 ))}
//               </Row>
//             </Card.Body>
//           </Card>
//         </>
//       )}
      
//       {/* Booking Modal */}
//       <Modal show={showBookingModal} onHide={handleCloseModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>Book Seat {selectedSeat?.number}</Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             <Form.Group className="mb-3">
//               <Form.Label>Your Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="userName"
//                 value={formData.userName}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
            
//             <Form.Group className="mb-3">
//               <Form.Label>Email</Form.Label>
//               <Form.Control
//                 type="email"
//                 name="userEmail"
//                 value={formData.userEmail}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
            
//             <Form.Group className="mb-3">
//               <Form.Label>Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="bookingDate"
//                 value={formData.bookingDate}
//                 onChange={handleInputChange}
//                 min={new Date().toISOString().split('T')[0]}
//                 required
//               />
//             </Form.Group>
            
//             <Form.Group className="mb-3">
//               <Form.Label>Start Time</Form.Label>
//               <Form.Select
//                 name="startTime"
//                 value={formData.startTime}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="">Select start time</option>
//                 {getAvailableTimeSlots().map((slot, index) => (
//                   <option 
//                     key={`slot-${index}`} 
//                     value={slot.time}
//                     disabled={!slot.available}
//                   >
//                     {slot.time} {!slot.available && '(Booked)'}
//                   </option>
//                 ))}
//                 {getAvailableTimeSlots().filter(slot => slot.available).length === 0 && (
//                   <option disabled>No available time slots</option>
//                 )}
//               </Form.Select>
//             </Form.Group>
            
//             <Form.Group className="mb-3">
//               <Form.Label>Duration</Form.Label>
//               <Form.Select
//                 name="duration"
//                 value={formData.duration}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="">Select duration</option>
//                 <option value="30">30 minutes</option>
//                 <option value="60">1 hour</option>
//                 <option value="90">1.5 hours</option>
//                 <option value="120">2 hours</option>
//                 <option value="180">3 hours</option>
//                 <option value="240">4 hours</option>
//                 <option value="480">Full day (8 hours)</option>
//               </Form.Select>
//             </Form.Group>
            
//             {timeConflict && (
//               <Alert variant="danger" className="mb-3">
//                 This seat is already booked during the selected time
//               </Alert>
//             )}
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button variant="primary" type="submit">
//               Confirm Booking
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </Container>
//   );
// };

// export default SeatBookingSystem;




import React, { useState, useEffect } from 'react';

const SeatBookingSystem = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seatData, setSeatData] = useState({ floor1: [], floor2: [] });
  const [activeBookings, setActiveBookings] = useState({});
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: '30'
  });
  const [timeConflict, setTimeConflict] = useState(false);

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '30px',
      fontSize: '2rem'
    },
    legendContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem'
    },
    legendColor: {
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      border: '1px solid #ddd'
    },
    floorPlan: {
      display: 'flex',
      flexDirection: 'column',
      gap: '30px'
    },
    floor: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    floorHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '1px solid #eee'
    },
    floorTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: '#444',
      margin: 0
    },
    seatMap: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '15px'
    },
    seat: {
      width: '100%',
      aspectRatio: '1',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      border: '2px solid transparent'
    },
    seatAvailable: {
      backgroundColor: '#e8f5e9',
      borderColor: '#81c784',
      color: '#2e7d32'
    },
    seatBooked: {
      backgroundColor: '#ffebee',
      borderColor: '#e57373',
      color: '#c62828'
    },
    seatReserved: {
      backgroundColor: '#fff8e1',
      borderColor: '#ffd54f',
      color: '#ff8f00'
    },
    seatFullyBooked: {
      backgroundColor: '#f5f5f5',
      borderColor: '#9e9e9e',
      color: '#616161',
      cursor: 'not-allowed'
    },
    seatSelected: {
      backgroundColor: '#e3f2fd',
      borderColor: '#64b5f6',
      color: '#1565c0',
      transform: 'scale(1.05)'
    },
    seatNumber: {
      fontWeight: 'bold',
      fontSize: '1.1rem',
      marginBottom: '4px'
    },
    seatStatus: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      marginBottom: '2px'
    },
    bookingTime: {
      fontSize: '0.65rem',
      color: 'rgba(0,0,0,0.6)'
    },
    fullyBookedLabel: {
      fontSize: '0.7rem',
      color: '#d32f2f',
      fontWeight: 'bold',
      marginTop: '4px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '10px',
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '1px solid #eee'
    },
    modalTitle: {
      fontSize: '1.4rem',
      color: '#333',
      margin: 0,
      fontWeight: '600'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.8rem',
      cursor: 'pointer',
      color: '#777',
      lineHeight: 1,
      padding: '0 5px'
    },
    formGroup: {
      marginBottom: '18px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#555',
      fontSize: '0.95rem'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1rem',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#4285f4',
      boxShadow: '0 0 0 2px rgba(66,133,244,0.2)'
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '25px',
      paddingTop: '15px',
      borderTop: '1px solid #eee'
    },
    button: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
      fontSize: '0.95rem'
    },
    primaryButton: {
      backgroundColor: '#4285f4',
      color: 'white'
    },
    primaryButtonHover: {
      backgroundColor: '#3367d6'
    },
    secondaryButton: {
      backgroundColor: '#f1f1f1',
      color: '#333'
    },
    secondaryButtonHover: {
      backgroundColor: '#e0e0e0'
    },
    conflictMessage: {
      color: '#d32f2f',
      fontSize: '0.85rem',
      marginTop: '8px',
      padding: '8px 12px',
      backgroundColor: '#ffebee',
      borderRadius: '4px',
      display: 'inline-block'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(0,0,0,0.1)',
      borderLeftColor: '#4285f4',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    },
    errorMessage: {
      color: '#d32f2f',
      backgroundColor: '#ffebee',
      padding: '20px',
      borderRadius: '8px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto',
      fontSize: '1rem'
    },
    select: {
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '12px'
    }
  };

  // Animation for spinner
  const spinnerStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Fetch seat data from backend
  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        setLoading(true);
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData = {
          floor1: [
            { number: 'A1', status: 'available' },
            { number: 'A2', status: 'booked' },
            { number: 'A3', status: 'available' },
            { number: 'A4', status: 'reserved' },
            { number: 'B1', status: 'available' },
            { number: 'B2', status: 'available' },
            { number: 'B3', status: 'booked' },
            { number: 'B4', status: 'available' },
            { number: 'C1', status: 'reserved' },
            { number: 'C2', status: 'available' },
            { number: 'C3', status: 'available' },
            { number: 'C4', status: 'booked' }
          ],
          floor2: [
            { number: 'D1', status: 'available' },
            { number: 'D2', status: 'available' },
            { number: 'D3', status: 'available' },
            { number: 'D4', status: 'reserved' },
            { number: 'E1', status: 'booked' },
            { number: 'E2', status: 'available' },
            { number: 'E3', status: 'available' },
            { number: 'E4', status: 'booked' }
          ]
        };
        
        setSeatData(mockData);
        loadBookings();
        setLoading(false);
      } catch (err) {
        setError('Failed to load seat data. Please try again later.');
        setLoading(false);
        console.error('Error fetching seat data:', err);
      }
    };

    fetchSeatData();
  }, []);

  // Load bookings from localStorage
  const loadBookings = () => {
    try {
      const saved = localStorage.getItem('activeBookings');
      if (saved) {
        const bookingsData = JSON.parse(saved);
        const now = Date.now();
        const activeBookings = {};
        
        Object.keys(bookingsData).forEach(seatNumber => {
          const active = bookingsData[seatNumber].filter(booking => {
            return booking.endTimestamp > now;
          });
          
          if (active.length > 0) {
            activeBookings[seatNumber] = active;
            
            active.forEach(booking => {
              const durationMs = booking.endTimestamp - now;
              if (durationMs > 0) {
                setTimeout(() => {
                  releaseSeatIfExpired(seatNumber);
                }, durationMs);
              }
            });
          }
        });
        
        setActiveBookings(activeBookings);
      }
    } catch (e) {
      console.error('Error loading bookings:', e);
      localStorage.removeItem('activeBookings');
    }
  };

  // Save bookings to localStorage
  const saveBookings = (bookings) => {
    localStorage.setItem('activeBookings', JSON.stringify(bookings));
  };

  // Handle seat selection
  const handleSeatClick = (seat) => {
    const status = getSeatStatus(seat);
    if (status === 'booked' || status === 'fully-booked') return;
    
    setSelectedSeat(seat);
    setFormData({
      ...formData,
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '',
      duration: '30'
    });
    setTimeConflict(false);
    setShowBookingModal(true);
  };

  // Close booking modal
  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedSeat(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'bookingDate' || name === 'startTime' || name === 'duration') {
      setTimeConflict(false);
    }
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (seatNumber, date, startTime, duration) => {
    const bookings = activeBookings[seatNumber] || [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    
    const endTime = new Date(0, 0, 0, startHour, startMinute + parseInt(duration));
    const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
    return !bookings.some(booking => {
      if (booking.date !== date) return false;
      
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;
      
      return !(endTimeString <= bookingStart || startTime >= bookingEnd);
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.userEmail || !formData.startTime || !formData.duration) {
      return;
    }
    
    if (!isTimeSlotAvailable(
      selectedSeat.number,
      formData.bookingDate,
      formData.startTime,
      formData.duration
    )) {
      setTimeConflict(true);
      return;
    }
    
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const endTime = new Date(0, 0, 0, startHour, startMinute + parseInt(formData.duration));
    const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
    const bookingData = {
      seatNumber: selectedSeat.number,
      userName: formData.userName,
      userEmail: formData.userEmail,
      date: formData.bookingDate,
      startTime: formData.startTime,
      endTime: endTimeString,
      duration: formData.duration,
      startTimestamp: getTimestamp(formData.bookingDate, formData.startTime),
      endTimestamp: getTimestamp(formData.bookingDate, endTimeString)
    };
    
    const updatedBookings = { ...activeBookings };
    if (!updatedBookings[selectedSeat.number]) {
      updatedBookings[selectedSeat.number] = [];
    }
    updatedBookings[selectedSeat.number].push(bookingData);
    
    setActiveBookings(updatedBookings);
    saveBookings(updatedBookings);
    
    const durationMs = bookingData.endTimestamp - Date.now();
    if (durationMs > 0) {
      setTimeout(() => {
        releaseSeatIfExpired(selectedSeat.number);
      }, durationMs);
    }
    
    alert(`Booking confirmed for seat ${bookingData.seatNumber} from ${bookingData.startTime} to ${bookingData.endTime} on ${bookingData.date}!`);
    
    setFormData({
      userName: '',
      userEmail: '',
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '',
      duration: '30'
    });
    setShowBookingModal(false);
  };

  // Release seat if booking has expired
  const releaseSeatIfExpired = (seatNumber) => {
    const now = Date.now();
    const updatedBookings = { ...activeBookings };
    
    if (updatedBookings[seatNumber]) {
      const active = updatedBookings[seatNumber].filter(booking => booking.endTimestamp > now);
      
      if (active.length === 0) {
        delete updatedBookings[seatNumber];
      } else {
        updatedBookings[seatNumber] = active;
      }
      
      setActiveBookings(updatedBookings);
      saveBookings(updatedBookings);
    }
  };

  // Get timestamp from date and time
  const getTimestamp = (dateStr, timeStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes).getTime();
  };

  // Generate time slots for the dropdown
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 12; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Check if seat is fully booked
  const isSeatFullyBooked = (seatNumber) => {
    const bookings = activeBookings[seatNumber] || [];
    if (bookings.length === 0) return false;
    
    const allSlots = [];
    for (let hour = 12; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allSlots.push(timeString);
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today);
    
    const bookedSlots = new Set();
    todayBookings.forEach(booking => {
      const [startHour, startMinute] = booking.startTime.split(':').map(Number);
      const [endHour, endMinute] = booking.endTime.split(':').map(Number);
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const slot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        bookedSlots.add(slot);
        
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentMinute = 0;
          currentHour++;
        }
      }
    });
    
    return allSlots.every(slot => bookedSlots.has(slot));
  };

  // Get seat status
  const getSeatStatus = (seat) => {
    if (isSeatFullyBooked(seat.number)) return 'fully-booked';
    
    const bookings = activeBookings[seat.number] || [];
    const now = Date.now();
    
    const isCurrentlyBooked = bookings.some(booking => 
      now >= booking.startTimestamp && now < booking.endTimestamp
    );
    
    if (isCurrentlyBooked) return 'booked';
    return seat.status;
  };

  // Get seat style based on status
  const getSeatStyle = (status, isSelected = false) => {
    const baseStyle = { ...styles.seat };
    
    if (isSelected) {
      return { ...baseStyle, ...styles.seatSelected };
    }
    
    switch (status) {
      case 'available': 
        return { ...baseStyle, ...styles.seatAvailable };
      case 'booked': 
        return { ...baseStyle, ...styles.seatBooked };
      case 'reserved': 
        return { ...baseStyle, ...styles.seatReserved };
      case 'fully-booked': 
        return { ...baseStyle, ...styles.seatFullyBooked };
      default: 
        return baseStyle;
    }
  };

  // Seat component
  const Seat = ({ seat }) => {
    const status = getSeatStatus(seat);
    const isSelected = selectedSeat?.number === seat.number && showBookingModal;
    const seatStyle = getSeatStyle(status, isSelected);
    const isFullyBooked = status === 'fully-booked';
    const isBooked = status === 'booked';
    
    // Safely get current booking
    const currentBooking = isBooked && activeBookings[seat.number] 
      ? activeBookings[seat.number].find(b => 
          Date.now() >= b.startTimestamp && Date.now() < b.endTimestamp
        )
      : null;
    
    return (
      <div 
        style={seatStyle} 
        onClick={() => !isFullyBooked && handleSeatClick(seat)}
        onMouseEnter={(e) => !isFullyBooked && (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => !isFullyBooked && (e.currentTarget.style.transform = 'scale(1)')}
      >
        <div style={styles.seatNumber}>{seat.number}</div>
        <div style={styles.seatStatus}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
        </div>
        {isBooked && currentBooking && (
          <div style={styles.bookingTime}>
            {currentBooking.startTime}-{currentBooking.endTime}
          </div>
        )}
        {isFullyBooked && (
          <div style={styles.fullyBookedLabel}>No available slots</div>
        )}
      </div>
    );
  };

  // Generate available time slots for selected seat and date
  const getAvailableTimeSlots = () => {
    if (!selectedSeat) return [];
    
    const slots = generateTimeSlots();
    const bookings = activeBookings[selectedSeat.number] || [];
    const selectedDate = formData.bookingDate;
    
    const bookedSlots = new Set();
    bookings.forEach(booking => {
      if (booking.date === selectedDate) {
        const [startHour, startMinute] = booking.startTime.split(':').map(Number);
        const [endHour, endMinute] = booking.endTime.split(':').map(Number);
        
        let currentHour = startHour;
        let currentMinute = startMinute;
        
        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
          const slot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
          bookedSlots.add(slot);
          
          currentMinute += 30;
          if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour++;
          }
        }
      }
    });
    
    return slots.map(slot => ({
      time: slot,
      available: !bookedSlots.has(slot)
    }));
  };

  return (
    <div style={styles.container}>
      <style>{spinnerStyle}</style>
      
      <h1 style={styles.header}>Workspace Seat Booking</h1>
      
      {/* Legend */}
      <div style={styles.legendContainer}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: '#e8f5e9', borderColor: '#81c784' }}></div>
          <span>Available</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: '#ffebee', borderColor: '#e57373' }}></div>
          <span>Booked</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: '#fff8e1', borderColor: '#ffd54f' }}></div>
          <span>Reserved</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: '#e3f2fd', borderColor: '#64b5f6' }}></div>
          <span>Selected</span>
        </div>
      </div>
      
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '10px', fontSize: '1.1rem' }}>Loading seat availability...</p>
        </div>
      ) : error ? (
        <div style={styles.errorMessage}>
          {error}
        </div>
      ) : (
        <div style={styles.floorPlan}>
          {/* Floor 1 */}
          <div style={styles.floor}>
            <div style={styles.floorHeader}>
              <h2 style={styles.floorTitle}>Floor 1 - Main Workspace</h2>
            </div>
            <div style={styles.seatMap}>
              {seatData.floor1.map(seat => (
                <Seat key={`floor1-${seat.number}`} seat={seat} />
              ))}
            </div>
          </div>
          
          {/* Floor 2 */}
          <div style={styles.floor}>
            <div style={styles.floorHeader}>
              <h2 style={styles.floorTitle}>Floor 2 - Quiet Zone</h2>
            </div>
            <div style={styles.seatMap}>
              {seatData.floor2.map(seat => (
                <Seat key={`floor2-${seat.number}`} seat={seat} />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Modal */}
      {showBookingModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Book Seat {selectedSeat?.number}</h2>
              <button 
                style={styles.closeButton} 
                onClick={handleCloseModal}
                onMouseEnter={(e) => e.currentTarget.style.color = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#777'}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Name</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  required
                  style={{ ...styles.input, ...styles.inputFocus }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  required
                  style={{ ...styles.input, ...styles.inputFocus }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  style={{ ...styles.input, ...styles.inputFocus }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Time</label>
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  style={{ ...styles.input, ...styles.select, ...styles.inputFocus }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                >
                  <option value="">Select start time</option>
                  {getAvailableTimeSlots().map((slot, index) => (
                    <option 
                      key={`slot-${index}`} 
                      value={slot.time}
                      disabled={!slot.available}
                    >
                      {slot.time} {!slot.available && '(Booked)'}
                    </option>
                  ))}
                  {getAvailableTimeSlots().filter(slot => slot.available).length === 0 && (
                    <option disabled>No available time slots</option>
                  )}
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Duration</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  style={{ ...styles.input, ...styles.select, ...styles.inputFocus }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                >
                  <option value="">Select duration</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                  <option value="480">Full day (8 hours)</option>
                </select>
              </div>
              
              {timeConflict && (
                <div style={styles.conflictMessage}>
                  This seat is already booked during the selected time
                </div>
              )}
              
              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={{ 
                    ...styles.button, 
                    ...styles.secondaryButton,
                    ':hover': styles.secondaryButtonHover
                  }} 
                  onClick={handleCloseModal}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    ...styles.button, 
                    ...styles.primaryButton,
                    ':hover': styles.primaryButtonHover
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3367d6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4285f4'}
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatBookingSystem;