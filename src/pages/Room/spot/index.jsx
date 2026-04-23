// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { Link } from "react-router-dom";
// import { Row, Col, Card, Button, Spinner, Form, Badge, Alert } from "react-bootstrap";
// import PageTitle from "../../../components/PageTitle";
// import { useAuthContext } from "@/context/useAuthContext.jsx";
// import Popup from "../../../components/Popup/Popup";
// import Table2 from "../../../components/Table2";
// import { toast } from "react-toastify";
// import UsersRegistrationModal from "../../MyWorkspaceAccount/Personal/UsersRegistrationForm";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format, parseISO, isBefore, addHours } from "date-fns";
// import { useLogoColor } from "../../../context/LogoColorContext";

// const SeatBookingSystem = () => {
//   const { user } = useAuthContext();
//   const tenantToken = user?.tenantToken;
//   const tenantSlug = user?.tenant;
//   const { colour: primary, secondaryColor: secondary } = useLogoColor();

//   // Refs to prevent duplicate calls
//   const isMounted = useRef(true);
//   const isFetchingLocations = useRef(false);
//   const isFetchingFloors = useRef(false);
//   const isFetchingRooms = useRef(false);
//   const isFetchingRoomDetails = useRef(false);
//   const isFetchingUsers = useRef(false);

//   const [showUserModal, setShowUserModal] = useState(false);
//   const [locations, setLocations] = useState([]);
//   const [floorData, setFloorData] = useState([]);
//   const [roomsData, setRoomsData] = useState([]);
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [roomDetails, setRoomDetails] = useState(null);
//   const [spaceCards, setSpaceCards] = useState([]);
//   const [loading, setLoading] = useState({
//     locations: true,
//     floors: false,
//     rooms: false,
//     roomDetails: false,
//     users: false,
//     booking: false
//   });
//   const [error, setError] = useState(null);
//   const [selectedLocation, setSelectedLocation] = useState("");
//   const [selectedFloor, setSelectedFloor] = useState("");
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showBookingPopup, setShowBookingPopup] = useState(false);
//   const [selectedSpace, setSelectedSpace] = useState(null);
//   const [currencySymbol, setCurrencySymbol] = useState("$");
//   const [popup, setPopup] = useState({
//     message: "",
//     type: "",
//     isVisible: false,
//     buttonLabel: "",
//     buttonRoute: "",
//   });

//   // Invoice state variables
//   const [invoiceType, setInvoiceType] = useState("default");
//   const [invoiceItems, setInvoiceItems] = useState([
//     { name: "", charge: "", number: "1" }
//   ]);

//   // Booking form state
//   const [bookingFormData, setBookingFormData] = useState({
//     type: "one-off",
//     chosen_days: [{
//       start_time: null,
//       end_time: null
//     }],
//     number_weeks: "0",
//     number_months: "0",
//     user_id: ""
//   });

//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     pageSize: 10,
//   });

//   // Cleanup on unmount
//   useEffect(() => {
//     isMounted.current = true;
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   const formatDateTime = useCallback((isoString) => {
//     if (!isoString) return "N/A";
//     const options = {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     };
//     return new Date(isoString).toLocaleDateString("en-US", options);
//   }, []);

//   const scrollToSpots = useCallback(() => {
//     const spotsSection = document.getElementById("spots-section");
//     if (spotsSection) {
//       spotsSection.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   }, []);

//   const fetchLocations = useCallback(async () => {
//     if (isFetchingLocations.current || !tenantToken || !tenantSlug) return;
    
//     isFetchingLocations.current = true;
//     setLoading(prev => ({ ...prev, locations: true }));
    
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations?per_page=100`,
//         {
//           headers: { Authorization: `Bearer ${tenantToken}` },
//         }
//       );
//       const result = await response.json();
      
//       if (isMounted.current && response.ok) {
//         setLocations(result.data?.data || []);
//       } else if (isMounted.current) {
//         throw new Error(result.message || "Failed to fetch locations.");
//       }
//     } catch (error) {
//       if (isMounted.current) {
//         toast.error(error.message);
//       }
//     } finally {
//       if (isMounted.current) {
//         setLoading(prev => ({ ...prev, locations: false }));
//       }
//       isFetchingLocations.current = false;
//     }
//   }, [tenantToken, tenantSlug]);

//   const fetchUsers = useCallback(async () => {
//     if (isFetchingUsers.current || !tenantToken || !tenantSlug) return;
    
//     isFetchingUsers.current = true;
//     setLoading(prev => ({ ...prev, users: true }));
    
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-users?per_page=100`,
//         {
//           headers: { Authorization: `Bearer ${tenantToken}` },
//         }
//       );
//       const result = await response.json();
      
//       if (isMounted.current && response.ok) {
//         setUsers(result.data?.data || []);
//       } else if (isMounted.current) {
//         throw new Error(result.message || "Failed to fetch users.");
//       }
//     } catch (error) {
//       if (isMounted.current) {
//         toast.error(error.message);
//       }
//     } finally {
//       if (isMounted.current) {
//         setLoading(prev => ({ ...prev, users: false }));
//       }
//       isFetchingUsers.current = false;
//     }
//   }, [tenantToken, tenantSlug]);

//   const fetchFloors = useCallback(async (locationId) => {
//     if (isFetchingFloors.current || !tenantToken || !tenantSlug || !locationId) return;
    
//     isFetchingFloors.current = true;
//     setLoading(prev => ({ ...prev, floors: true }));
    
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/list-floors/${locationId}?per_page=100`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${tenantToken}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const result = await response.json();
      
//       if (isMounted.current && result?.data?.data) {
//         setFloorData(result.data.data);
//       } else if (isMounted.current) {
//         throw new Error("Invalid response format");
//       }
//     } catch (error) {
//       if (isMounted.current) {
//         toast.error(error.message);
//       }
//     } finally {
//       if (isMounted.current) {
//         setLoading(prev => ({ ...prev, floors: false }));
//       }
//       isFetchingFloors.current = false;
//     }
//   }, [tenantToken, tenantSlug]);

//   const fetchRooms = useCallback(async (locationId, floorId, page = 1, pageSize = 10) => {
//     if (isFetchingRooms.current || !tenantToken || !tenantSlug || !locationId || !floorId) return;
    
//     isFetchingRooms.current = true;
//     setLoading(prev => ({ ...prev, rooms: true }));
    
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/list-spaces/${locationId}/${floorId}?page=${page}&per_page=${pageSize}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${tenantToken}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const result = await response.json();

//       if (isMounted.current && Array.isArray(result)) {
//         const sortedData = [...result].sort(
//           (a, b) =>
//             new Date(b.updated_at || b.created_at) -
//             new Date(a.updated_at || a.created_at)
//         );
//         setRoomsData(sortedData);
        
//         // Update pagination if available
//         if (result.pagination) {
//           setPagination({
//             currentPage: result.pagination.current_page || page,
//             totalPages: result.pagination.last_page || 1,
//             pageSize: pageSize,
//           });
//         } else {
//           // Client-side pagination
//           const totalPages = Math.ceil(sortedData.length / pageSize);
//           setPagination({
//             currentPage: page,
//             totalPages: totalPages,
//             pageSize: pageSize,
//           });
//         }
//       } else if (isMounted.current) {
//         throw new Error("Invalid response format");
//       }
//     } catch (error) {
//       if (isMounted.current) {
//         toast.error(error.message);
//       }
//     } finally {
//       if (isMounted.current) {
//         setLoading(prev => ({ ...prev, rooms: false }));
//       }
//       isFetchingRooms.current = false;
//     }
//   }, [tenantToken, tenantSlug]);

//   const fetchRoomDetails = useCallback(async (roomId) => {
//     if (isFetchingRoomDetails.current || !tenantToken || !tenantSlug || !roomId) {
//       setRoomDetails(null);
//       setSpaceCards([]);
//       return;
//     }

//     isFetchingRoomDetails.current = true;
//     setLoading(prev => ({ ...prev, roomDetails: true }));
    
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/show/${roomId}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${tenantToken}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to fetch room details: Status: ${response.status}`);
//       }

//       const result = await response.json();
      
//       if (isMounted.current && result?.data) {
//         setRoomDetails(result.data);
        
//         // Generate space cards
//         if (result.data.spots && Array.isArray(result.data.spots)) {
//           const cards = result.data.spots.map((spot, index) => ({
//             id: spot.id,
//             space_number: index + 1,
//             is_available: true,
//             space_fee: spot.price || result.data.price || result.data.space_fee || 0,
//             space_type: spot.type || result.data.space_type || 'Standard',
//             spotData: spot
//           }));
//           setSpaceCards(cards);
//         } else {
//           const cards = Array.from({ length: result.data.space_number || 0 }, (_, i) => ({
//             id: i + 1,
//             space_number: i + 1,
//             is_available: true,
//             space_fee: result.data.price || result.data.space_fee || 0,
//             space_type: result.data.space_type || 'Standard'
//           }));
//           setSpaceCards(cards);
//         }
//       } else if (isMounted.current) {
//         throw new Error("Invalid room details format");
//       }
//     } catch (error) {
//       if (isMounted.current) {
//         toast.error(error.message);
//       }
//     } finally {
//       if (isMounted.current) {
//         setLoading(prev => ({ ...prev, roomDetails: false }));
//       }
//       isFetchingRoomDetails.current = false;
//     }
//   }, [tenantToken, tenantSlug]);

//   const fetchCurrencySymbol = useCallback(async (locationId) => {
//     if (!locationId || !tenantToken || !tenantSlug) return "₦";
    
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/fetch/currency/location`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${tenantToken}`,
//           },
//           body: JSON.stringify({ location_id: locationId }),
//         }
//       );
//       const result = await response.json();
//       if (Array.isArray(result.data) && result.data.length > 0) {
//         return result.data[0].symbol || "₦";
//       }
//       return "₦";
//     } catch (err) {
//       return "₦";
//     }
//   }, [tenantToken, tenantSlug]);

//   // Initial data fetch
//   useEffect(() => {
//     if (tenantToken && tenantSlug) {
//       fetchLocations();
//       fetchUsers();
//     }
//   }, [tenantToken, tenantSlug, fetchLocations, fetchUsers]);

//   // Fetch floors when location changes
//   useEffect(() => {
//     if (tenantToken && tenantSlug && selectedLocation) {
//       fetchFloors(selectedLocation);
//       // Reset floor and room selection
//       setSelectedFloor("");
//       setRoomsData([]);
//       setSelectedRoom(null);
//       setSpaceCards([]);
//       setRoomDetails(null);
      
//       // Fetch currency symbol for new location
//       fetchCurrencySymbol(selectedLocation).then(symbol => {
//         if (isMounted.current) setCurrencySymbol(symbol);
//       });
//     }
//   }, [tenantToken, tenantSlug, selectedLocation, fetchFloors, fetchCurrencySymbol]);

//   // Fetch rooms when floor changes
//   useEffect(() => {
//     if (tenantToken && tenantSlug && selectedLocation && selectedFloor) {
//       fetchRooms(selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize);
//       // Reset room selection
//       setSelectedRoom(null);
//       setSpaceCards([]);
//       setRoomDetails(null);
//     }
//   }, [tenantToken, tenantSlug, selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize, fetchRooms]);

//   // Fetch room details when room changes
//   useEffect(() => {
//     if (selectedRoom) {
//       fetchRoomDetails(selectedRoom.id);
//     } else {
//       setSpaceCards([]);
//       setRoomDetails(null);
//     }
//   }, [selectedRoom, fetchRoomDetails]);

//   const handleLocationChange = useCallback((e) => {
//     const locationId = e.target.value;
//     setSelectedLocation(locationId);
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, []);

//   const handleFloorChange = useCallback((e) => {
//     const floorId = e.target.value;
//     setSelectedFloor(floorId);
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, []);

//   const handleViewSpotsClick = useCallback(async (room) => {
//     setSelectedRoom(room);
//     setTimeout(scrollToSpots, 300);
//   }, [scrollToSpots]);

//   const handleBookNowClick = useCallback((space) => {
//     setSelectedSpace(space);
//     setBookingFormData({
//       type: "one-off",
//       chosen_days: [{
//         start_time: null,
//         end_time: null
//       }],
//       number_weeks: "0",
//       number_months: "0",
//       user_id: ""
//     });
//     setInvoiceType("default");
//     setInvoiceItems([{ name: "", charge: "", number: "1" }]);
//     setShowBookingPopup(true);
//   }, []);

//   const handleBookingClose = useCallback(() => {
//     setShowBookingPopup(false);
//     setSelectedSpace(null);
//     setInvoiceType("default");
//     setInvoiceItems([{ name: "", charge: "", number: "1" }]);
//   }, []);

//   const handleDayChange = useCallback((index, field, value) => {
//     setBookingFormData(prev => {
//       const updatedDays = [...prev.chosen_days];
      
//       if (field === 'start_time' && value) {
//         const dayName = format(value, 'EEEE').toLowerCase();
//         updatedDays[index] = {
//           day: dayName,
//           start_time: value,
//           end_time: updatedDays[index]?.end_time
//         };
        
//         if (updatedDays[index].end_time && isBefore(updatedDays[index].end_time, value)) {
//           updatedDays[index].end_time = addHours(value, 1);
//         }
//       } else if (field === 'end_time') {
//         updatedDays[index] = {
//           ...updatedDays[index],
//           end_time: value
//         };
//       }
      
//       return {
//         ...prev,
//         chosen_days: updatedDays
//       };
//     });
//   }, []);

//   const addDay = useCallback(() => {
//     setBookingFormData(prev => ({
//       ...prev,
//       chosen_days: [
//         ...prev.chosen_days,
//         { start_time: null, end_time: null }
//       ]
//     }));
//   }, []);

//   const removeDay = useCallback((index) => {
//     setBookingFormData(prev => ({
//       ...prev,
//       chosen_days: prev.chosen_days.filter((_, i) => i !== index)
//     }));
//   }, []);

//   const handleBookingInputChange = useCallback((e) => {
//     const { name, value } = e.target;
    
//     setBookingFormData(prev => {
//       if (name === "type" && value === "one-off") {
//         return {
//           ...prev,
//           type: value,
//           number_weeks: "0",
//           number_months: "0"
//         };
//       }
//       return {
//         ...prev,
//         [name]: value
//       };
//     });
//   }, []);

//   const handleInvoiceTypeChange = useCallback((e) => {
//     setInvoiceType(e.target.value);
//     if (e.target.value === "default") {
//       setInvoiceItems([{ name: "", charge: "", number: "1" }]);
//     }
//   }, []);

//   const handleInvoiceItemChange = useCallback((index, field, value) => {
//     setInvoiceItems(prev => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [field]: value };
//       return updated;
//     });
//   }, []);

//   const addInvoiceItem = useCallback(() => {
//     setInvoiceItems(prev => [
//       ...prev,
//       { name: "", charge: "", number: "1" }
//     ]);
//   }, []);

//   const removeInvoiceItem = useCallback((index) => {
//     if (invoiceItems.length > 1) {
//       setInvoiceItems(prev => prev.filter((_, i) => i !== index));
//     }
//   }, [invoiceItems.length]);

//   const calculateInvoiceTotal = useCallback(() => {
//     return invoiceItems.reduce((total, item) => {
//       const charge = parseFloat(item.charge) || 0;
//       const number = parseInt(item.number) || 1;
//       return total + (charge * number);
//     }, 0);
//   }, [invoiceItems]);

//   const formatTimeForAPI = useCallback((date) => {
//     if (!date) return "";
//     return format(date, "yyyy-MM-dd HH:mm:ss");
//   }, []);

//   const createDynamicInvoice = useCallback(async (bookingData) => {
//     const invoiceData = {
//       spot_id: bookingData.spot_id,
//       user_id: bookingData.user_id,
//       type: bookingData.type,
//       spot_fee: selectedSpace.space_fee,
//       item_name: invoiceItems.map(item => item.name),
//       item_charge: invoiceItems.map(item => parseFloat(item.charge) || 0),
//       item_number: invoiceItems.map(item => parseInt(item.number) || 1),
//       number_weeks: bookingData.number_weeks,
//       number_months: bookingData.number_months,
//       chosen_days: bookingData.chosen_days
//     };

//     const response = await fetch(
//       `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/dynamic/invoice/create`,
//       {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${tenantToken}`,
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           "Timezone-Offset": new Date().getTimezoneOffset()
//         },
//         body: JSON.stringify(invoiceData),
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to create dynamic invoice");
//     }

//     return await response.json();
//   }, [tenantToken, tenantSlug, selectedSpace, invoiceItems]);

//   const createRegularBooking = useCallback(async (bookingData) => {
//     const response = await fetch(
//       `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/book`,
//       {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${tenantToken}`,
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//           "Timezone-Offset": new Date().getTimezoneOffset()
//         },
//         body: JSON.stringify(bookingData),
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to book space");
//     }

//     return await response.json();
//   }, [tenantToken, tenantSlug]);

//   const handleBookingSubmit = useCallback(async (e) => {
//     e.preventDefault();
//     setLoading(prev => ({ ...prev, booking: true }));
    
//     try {
//       // Validate form
//       const hasEmptyFields = bookingFormData.chosen_days.some(day => 
//         !day.day || !day.start_time || !day.end_time
//       ) || !bookingFormData.user_id;
      
//       if (hasEmptyFields) {
//         throw new Error("Please fill in all required fields");
//       }

//       // Prepare booking data
//       const bookingData = {
//         spot_id: selectedSpace.id.toString(),
//         user_id: bookingFormData.user_id,
//         type: bookingFormData.type,
//         number_weeks: bookingFormData.number_weeks || "0",
//         number_months: bookingFormData.number_months || "0",
//         chosen_days: bookingFormData.chosen_days.map(day => ({
//           day: day.day.toLowerCase(),
//           start_time: formatTimeForAPI(day.start_time),
//           end_time: formatTimeForAPI(day.end_time)
//         }))
//       };

//       // Validate time ranges
//       for (const day of bookingData.chosen_days) {
//         const start = parseISO(day.start_time.replace(' ', 'T') + 'Z');
//         const end = parseISO(day.end_time.replace(' ', 'T') + 'Z');
        
//         if (isBefore(end, start)) {
//           throw new Error("End time must be after start time");
//         }
//       }

//       let result;
      
//       if (invoiceType === "dynamic") {
//         const hasEmptyInvoiceItems = invoiceItems.some(item => 
//           !item.name.trim() || !item.charge
//         );
        
//         if (hasEmptyInvoiceItems) {
//           throw new Error("Please fill in all invoice item fields");
//         }

//         result = await createDynamicInvoice(bookingData);
//       } else {
//         result = await createRegularBooking(bookingData);
//       }

//       toast.success(result.message || "Space booked successfully!");
      
//       handleBookingClose();
      
//       // Refresh room details
//       if (selectedRoom) {
//         await fetchRoomDetails(selectedRoom.id);
//       }
//     } catch (error) {
//       toast.error(error.message || "Failed to process booking");
//     } finally {
//       if (isMounted.current) {
//         setLoading(prev => ({ ...prev, booking: false }));
//       }
//     }
//   }, [bookingFormData, selectedSpace, invoiceType, invoiceItems, createDynamicInvoice, createRegularBooking, handleBookingClose, selectedRoom, fetchRoomDetails, formatTimeForAPI]);

//   // Paginate rooms data
//   const paginatedRooms = useMemo(() => {
//     const start = (pagination.currentPage - 1) * pagination.pageSize;
//     const end = start + pagination.pageSize;
//     return roomsData.slice(start, end);
//   }, [roomsData, pagination.currentPage, pagination.pageSize]);

//   return (
//     <>
//       <PageTitle
//         breadCrumbItems={[
//           { label: "Book Spot", path: "/booking/book-spot", active: true },
//         ]}
//         title="Book a Spot"
//       />

//       <Row>
//         <Col>
//           <Card>
//             <Card.Body>
//               <Card>
//                 <Card.Body style={{ background: secondary, marginTop: "30px" }}>
//                   {/* Location Selection */}
//                   {loading.locations ? (
//                     <div className="text-center py-4">
//                       <Spinner animation="border" role="status">
//                         <span className="visually-hidden">Loading...</span>
//                       </Spinner>
//                       <p className="mt-2">Loading locations...</p>
//                     </div>
//                   ) : (
//                     <div>
//                       <p style={{ marginBottom: "10px", fontSize: "1rem" }}>
//                         Select a location to view available rooms.
//                       </p>
//                       <Form.Select
//                         style={{ marginBottom: "25px", fontSize: "1rem" }}
//                         value={selectedLocation}
//                         onChange={handleLocationChange}
//                       >
//                         <option value="">Select a location</option>
//                         {locations.map((location) => (
//                           <option key={location.id} value={location.id}>
//                             {location.name} - {location.state}
//                           </option>
//                         ))}
//                       </Form.Select>
//                     </div>
//                   )}

//                   {/* Floor Selection */}
//                   {selectedLocation && (
//                     <Form.Group className="mb-3" controlId="floor_id">
//                       {loading.floors ? (
//                         <div className="text-center py-3">
//                           <Spinner animation="border" size="sm" role="status">
//                             <span className="visually-hidden">Loading...</span>
//                           </Spinner>
//                           <p className="mt-2">Loading floors...</p>
//                         </div>
//                       ) : (
//                         <>
//                           <Form.Label>
//                             Select the floor/section to view rooms.
//                           </Form.Label>
//                           <Form.Select
//                             name="floor_id"
//                             value={selectedFloor}
//                             onChange={handleFloorChange}
//                             required
//                           >
//                             <option value="">Select a Floor/Section</option>
//                             {floorData.map((floor) => (
//                               <option key={floor.id} value={floor.id}>
//                                 {floor.name}
//                               </option>
//                             ))}
//                           </Form.Select>
//                         </>
//                       )}
//                     </Form.Group>
//                   )}

//                   {/* Rooms Display */}
//                   {selectedFloor && (
//                     <>
//                       {loading.rooms ? (
//                         <div className="text-center py-4">
//                           <Spinner animation="border" role="status">
//                             <span className="visually-hidden">Loading...</span>
//                           </Spinner>
//                           <p className="mt-2">Loading rooms...</p>
//                         </div>
//                       ) : (
//                         <>
//                           <h4 className="mb-3">Available Rooms</h4>
//                           {paginatedRooms.length > 0 ? (
//                             <Row>
//                               {paginatedRooms.map((room) => (
//                                 <Col key={room.id} md={4} className="mb-3">
//                                   <Card className="h-100">
//                                     <Card.Body className="d-flex flex-column">
//                                       <Card.Title className="d-flex justify-content-between align-items-center">
//                                         <span>{room.space_name}</span>
//                                         <Badge bg="info">Spots: {room.space_number}</Badge>
//                                       </Card.Title>
//                                       <Card.Text className="flex-grow-1">
//                                         <div>
//                                           <strong>Category:</strong> {room.category?.category || 'N/A'}
//                                         </div>
//                                         <div>
//                                           <strong>Fee/Spot:</strong> {currencySymbol}{room.space_fee}
//                                         </div>
//                                       </Card.Text>
//                                       <div className="mt-auto">
//                                         <Button
//                                           variant="primary"
//                                           size="sm"
//                                           className="w-100"
//                                           onClick={() => handleViewSpotsClick(room)}
//                                           style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
//                                           disabled={loading.roomDetails && selectedRoom?.id === room.id}
//                                         >
//                                           {loading.roomDetails && selectedRoom?.id === room.id ? (
//                                             <>
//                                               <Spinner size="sm" animation="border" className="me-1" />
//                                               Loading...
//                                             </>
//                                           ) : "View Spots"}
//                                         </Button>
//                                       </div>
//                                     </Card.Body>
//                                   </Card>
//                                 </Col>
//                               ))}
//                             </Row>
//                           ) : (
//                             <Alert variant="info">No rooms found for this floor/section.</Alert>
//                           )}
//                         </>
//                       )}

//                       {/* Room Details and Spaces Section */}
//                       {selectedRoom && (
//                         <div className="mt-4" id="spots-section">
//                           <h4 className="mb-3">Available Spots in {selectedRoom.space_name}</h4>
                          
//                           {loading.roomDetails ? (
//                             <div className="text-center py-4">
//                               <Spinner animation="border" role="status">
//                                 <span className="visually-hidden">Loading spots...</span>
//                               </Spinner>
//                               <p className="mt-2">Loading available spots...</p>
//                             </div>
//                           ) : spaceCards.length > 0 ? (
//                             <>
//                               <p className="mb-3">
//                                 <strong>Total spots:</strong> {spaceCards.length} | 
//                                 <strong> Fee per spot:</strong> {currencySymbol}{spaceCards[0]?.space_fee}
//                               </p>
//                               <Row>
//                                 {spaceCards.map((space, index) => (
//                                   <Col key={space.id} md={3} className="mb-3">
//                                     <Card className="h-100">
//                                       <Card.Body className="d-flex flex-column">
//                                         <Card.Title className="d-flex justify-content-between align-items-center">
//                                           <span>Spot {index + 1}</span>
//                                           <Badge bg="success">Available</Badge>
//                                         </Card.Title>
//                                         <Card.Text className="flex-grow-1">
//                                           <div><strong>Number:</strong> {index + 1}</div>
//                                           <div><strong>Fee:</strong> {currencySymbol}{space.space_fee}</div>
//                                         </Card.Text>
//                                         <div className="mt-auto">
//                                           <Button
//                                             variant="primary"
//                                             size="sm"
//                                             className="w-100"
//                                             onClick={() => handleBookNowClick(space)}
//                                             style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
//                                           >
//                                             Book Now
//                                           </Button>
//                                         </div>
//                                       </Card.Body>
//                                     </Card>
//                                   </Col>
//                                 ))}
//                               </Row>
//                             </>
//                           ) : (
//                             <Alert variant="info">No spots available in this room.</Alert>
//                           )}
                          
//                           <Button
//                             variant="outline-secondary"
//                             size="sm"
//                             className="mt-3"
//                             onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//                           >
//                             <i className="mdi mdi-arrow-up me-1"></i>
//                             Back to Top
//                           </Button>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </Card.Body>
//               </Card>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* User Registration Modal */}
//       <UsersRegistrationModal
//         show={showUserModal}
//         onHide={() => setShowUserModal(false)}
//         myUser={selectedUser}
//         onSubmit={fetchUsers}
//       />

//       {/* Booking Popup */}
//       {showBookingPopup && selectedSpace && (
//         <Popup
//           title={`Book Spot #${selectedSpace.space_number}`}
//           isVisible={showBookingPopup}
//           onClose={handleBookingClose}
//           size="lg"
//         >
//           <div style={{ maxHeight: "70vh", maxWidth: "80vw", overflowY: "auto", paddingRight: "8px" }}>
//             <Form onSubmit={handleBookingSubmit}>
//               <Row>
//                 <Col md={12}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Booking Type *</Form.Label>
//                     <Form.Select
//                       name="type"
//                       value={bookingFormData.type}
//                       onChange={handleBookingInputChange}
//                       required
//                     >
//                       <option value="one-off">One-time Booking</option>
//                       <option value="recurrent">Recurring Booking</option>
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//               </Row>

//               <Row>
//                 <Col md={12}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Select User *</Form.Label>
//                     <div className="d-flex align-items-center">
//                       {loading.users ? (
//                         <Spinner animation="border" size="sm" />
//                       ) : (
//                         <Form.Select
//                           name="user_id"
//                           value={bookingFormData.user_id}
//                           onChange={handleBookingInputChange}
//                           required
//                           className="flex-grow-1 me-2"
//                         >
//                           <option value="">Select a user</option>
//                           {users.map((user) => (
//                             <option key={user.id} value={user.id}>
//                               {user.first_name} {user.last_name} ({user.email})
//                             </option>
//                           ))}
//                         </Form.Select>
//                       )}
//                       <Button 
//                         variant="outline-primary" 
//                         size="sm" 
//                         onClick={() => {
//                           setSelectedUser(null);
//                           setShowUserModal(true);
//                         }}
//                         style={{ borderColor: primary, color: primary }}
//                       >
//                         <i className="mdi mdi-plus"></i> New User
//                       </Button>
//                     </div>
//                   </Form.Group>
//                 </Col>
//               </Row>

//               {/* Invoice Type Selection */}
//               <Row>
//                 <Col md={12}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Invoice Type</Form.Label>
//                     <Form.Select
//                       value={invoiceType}
//                       onChange={handleInvoiceTypeChange}
//                       required
//                     >
//                       <option value="default">Standard Invoice (Space Fee Only)</option>
//                       <option value="dynamic">Custom Invoice (Add Items)</option>
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//               </Row>

//               {/* Dynamic Invoice Items */}
//               {invoiceType === "dynamic" && (
//                 <>
//                   <h6 className="mt-3 mb-2">Additional Items</h6>
//                   {invoiceItems.map((item, index) => (
//                     <div key={index} className="border p-3 mb-3 rounded">
//                       <Row>
//                         <Col md={5}>
//                           <Form.Group className="mb-2">
//                             <Form.Label>Item Name *</Form.Label>
//                             <Form.Control
//                               type="text"
//                               value={item.name}
//                               onChange={(e) => handleInvoiceItemChange(index, 'name', e.target.value)}
//                               placeholder="e.g., Setup fee, Extras"
//                               required={invoiceType === "dynamic"}
//                             />
//                           </Form.Group>
//                         </Col>
//                         <Col md={3}>
//                           <Form.Group className="mb-2">
//                             <Form.Label>Charge ({currencySymbol}) *</Form.Label>
//                             <Form.Control
//                               type="number"
//                               value={item.charge}
//                               onChange={(e) => handleInvoiceItemChange(index, 'charge', e.target.value)}
//                               placeholder="0.00"
//                               min="0"
//                               step="0.01"
//                               required={invoiceType === "dynamic"}
//                             />
//                           </Form.Group>
//                         </Col>
//                         <Col md={2}>
//                           <Form.Group className="mb-2">
//                             <Form.Label>Qty *</Form.Label>
//                             <Form.Control
//                               type="number"
//                               value={item.number}
//                               onChange={(e) => handleInvoiceItemChange(index, 'number', e.target.value)}
//                               min="1"
//                               required={invoiceType === "dynamic"}
//                             />
//                           </Form.Group>
//                         </Col>
//                         <Col md={2} className="d-flex align-items-end">
//                           {invoiceItems.length > 1 && (
//                             <Button 
//                               variant="danger" 
//                               size="sm" 
//                               onClick={() => removeInvoiceItem(index)}
//                               className="mb-2 w-100"
//                             >
//                               Remove
//                             </Button>
//                           )}
//                         </Col>
//                       </Row>
//                     </div>
//                   ))}
                  
//                   <Button 
//                     variant="outline-primary" 
//                     size="sm" 
//                     onClick={addInvoiceItem}
//                     className="mb-3"
//                     style={{ borderColor: primary, color: primary }}
//                   >
//                     Add Another Item
//                   </Button>
                  
//                   <div className="border-top pt-2 mb-3">
//                     <div className="d-flex justify-content-between">
//                       <strong>Space Fee:</strong>
//                       <span>{currencySymbol}{selectedSpace.space_fee}</span>
//                     </div>
//                     <div className="d-flex justify-content-between">
//                       <strong>Additional Items Total:</strong>
//                       <span>{currencySymbol}{calculateInvoiceTotal().toFixed(2)}</span>
//                     </div>
//                     <div className="d-flex justify-content-between">
//                       <strong>Grand Total:</strong>
//                       <strong>{currencySymbol}{(calculateInvoiceTotal() + parseFloat(selectedSpace.space_fee || 0)).toFixed(2)}</strong>
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* Recurring Booking Options */}
//               {bookingFormData.type === "recurrent" && (
//                 <Row>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Number of Weeks</Form.Label>
//                       <Form.Control
//                         type="number"
//                         name="number_weeks"
//                         value={bookingFormData.number_weeks}
//                         onChange={handleBookingInputChange}
//                         min="1"
//                         required={bookingFormData.type === "recurrent"}
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Number of Months</Form.Label>
//                       <Form.Control
//                         type="number"
//                         name="number_months"
//                         value={bookingFormData.number_months}
//                         onChange={handleBookingInputChange}
//                         min="0"
//                         required={bookingFormData.type === "recurrent"}
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//               )}

//               <h5 className="mt-3">Booking Schedule</h5>
//               {bookingFormData.chosen_days.map((day, index) => (
//                 <div key={index} className="border p-3 mb-3 rounded">
//                   <Row>
//                     <Col md={6}>
//                       <Form.Group className="mb-2">
//                         <Form.Label>Start Time *</Form.Label>
//                         <DatePicker
//                           selected={day.start_time}
//                           onChange={(date) => handleDayChange(index, 'start_time', date)}
//                           showTimeSelect
//                           timeFormat="HH:mm"
//                           timeIntervals={15}
//                           dateFormat="MMM d, yyyy h:mm aa"
//                           className="form-control"
//                           placeholderText="Select start date & time"
//                           minDate={new Date()}
//                           required
//                         />
//                       </Form.Group>
//                     </Col>
//                     <Col md={6}>
//                       <Form.Group className="mb-2">
//                         <Form.Label>End Time *</Form.Label>
//                         <DatePicker
//                           selected={day.end_time}
//                           onChange={(date) => handleDayChange(index, 'end_time', date)}
//                           showTimeSelect
//                           timeFormat="HH:mm"
//                           timeIntervals={15}
//                           dateFormat="MMM d, yyyy h:mm aa"
//                           className="form-control"
//                           placeholderText="Select end date & time"
//                           minDate={day.start_time || new Date()}
//                           required
//                           disabled={!day.start_time}
//                         />
//                       </Form.Group>
//                     </Col>
//                   </Row>
//                   {index > 0 && (
//                     <Button 
//                       variant="danger" 
//                       size="sm" 
//                       onClick={() => removeDay(index)}
//                       className="mt-2"
//                     >
//                       Remove Time Slot
//                     </Button>
//                   )}
//                 </div>
//               ))}

//               <Button 
//                 variant="outline-primary" 
//                 size="sm" 
//                 onClick={addDay}
//                 className="mb-3"
//                 style={{ borderColor: primary, color: primary }}
//               >
//                 Add Another Time Slot
//               </Button>

//               <div className="d-flex justify-content-end gap-2">
//                 <Button variant="secondary" onClick={handleBookingClose}>
//                   Cancel
//                 </Button>
//                 <Button 
//                   variant="primary" 
//                   type="submit" 
//                   disabled={loading.booking}
//                   style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
//                 >
//                   {loading.booking ? (
//                     <>
//                       <Spinner as="span" animation="border" size="sm" className="me-1" />
//                       Processing...
//                     </>
//                   ) : 'Confirm Booking'}
//                 </Button>
//               </div>
//             </Form>
//           </div>
//         </Popup>
//       )}

//       {/* Popups */}
//       {popup.isVisible && (
//         <Popup
//           message={popup.message}
//           type={popup.type}
//           onClose={() => setPopup({ ...popup, isVisible: false })}
//           buttonLabel={popup.buttonLabel}
//           buttonRoute={popup.buttonRoute}
//         />
//       )}
//     </>
//   );
// };

// export default SeatBookingSystem;


import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { format, parseISO, isBefore, addHours } from "date-fns";
import { useLogoColor } from "../../../context/LogoColorContext";

const SeatBookingSystem = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetchingLocations = useRef(false);
  const isFetchingFloors = useRef(false);
  const isFetchingRooms = useRef(false);
  const isFetchingRoomDetails = useRef(false);
  const isFetchingUsers = useRef(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [floorData, setFloorData] = useState([]);
  const [roomsData, setRoomsData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [spaceCards, setSpaceCards] = useState([]);
  const [loading, setLoading] = useState({
    locations: true,
    floors: false,
    rooms: false,
    roomDetails: false,
    users: false,
    booking: false
  });
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });

  // Invoice state variables
  const [invoiceType, setInvoiceType] = useState("default");
  const [invoiceItems, setInvoiceItems] = useState([
    { name: "", charge: "", number: "1" }
  ]);

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

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const formatDateTime = useCallback((isoString) => {
    if (!isoString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(isoString).toLocaleDateString("en-US", options);
  }, []);

  const scrollToSpots = useCallback(() => {
    const spotsSection = document.getElementById("spots-section");
    if (spotsSection) {
      spotsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    if (isFetchingLocations.current || !tenantToken || !tenantSlug) return;
    
    isFetchingLocations.current = true;
    setLoading(prev => ({ ...prev, locations: true }));
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations?per_page=100`,
        {
          headers: { Authorization: `Bearer ${tenantToken}` },
        }
      );
      const result = await response.json();
      
      if (isMounted.current && response.ok) {
        setLocations(result.data?.data || []);
      } else if (isMounted.current) {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, locations: false }));
      }
      isFetchingLocations.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchUsers = useCallback(async () => {
    if (isFetchingUsers.current || !tenantToken || !tenantSlug) return;
    
    isFetchingUsers.current = true;
    setLoading(prev => ({ ...prev, users: true }));
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-users?per_page=100`,
        {
          headers: { Authorization: `Bearer ${tenantToken}` },
        }
      );
      const result = await response.json();
      
      if (isMounted.current && response.ok) {
        setUsers(result.data?.data || []);
      } else if (isMounted.current) {
        throw new Error(result.message || "Failed to fetch users.");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, users: false }));
      }
      isFetchingUsers.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchFloors = useCallback(async (locationId) => {
    if (isFetchingFloors.current || !tenantToken || !tenantSlug || !locationId) return;
    
    isFetchingFloors.current = true;
    setLoading(prev => ({ ...prev, floors: true }));
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/list-floors/${locationId}?per_page=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (isMounted.current && result?.data?.data) {
        setFloorData(result.data.data);
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, floors: false }));
      }
      isFetchingFloors.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchRooms = useCallback(async (locationId, floorId, page = 1, pageSize = 12) => {
    if (isFetchingRooms.current || !tenantToken || !tenantSlug || !locationId || !floorId) return;
    
    isFetchingRooms.current = true;
    setLoading(prev => ({ ...prev, rooms: true }));
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/list-spaces/${locationId}/${floorId}?page=${page}&per_page=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (isMounted.current && Array.isArray(result)) {
        const sortedData = [...result].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setRoomsData(sortedData);
        
        // Update pagination if available
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.current_page || page,
            totalPages: result.pagination.last_page || 1,
            pageSize: pageSize,
          });
        } else {
          // Client-side pagination
          const totalPages = Math.ceil(sortedData.length / pageSize);
          setPagination({
            currentPage: page,
            totalPages: totalPages,
            pageSize: pageSize,
          });
        }
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, rooms: false }));
      }
      isFetchingRooms.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchRoomDetails = useCallback(async (roomId) => {
    if (isFetchingRoomDetails.current || !tenantToken || !tenantSlug || !roomId) {
      setRoomDetails(null);
      setSpaceCards([]);
      return;
    }

    isFetchingRoomDetails.current = true;
    setLoading(prev => ({ ...prev, roomDetails: true }));
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/show/${roomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch room details: Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (isMounted.current && result?.data) {
        setRoomDetails(result.data);
        
        // Generate space cards
        if (result.data.spots && Array.isArray(result.data.spots)) {
          const cards = result.data.spots.map((spot, index) => ({
            id: spot.id,
            space_number: index + 1,
            is_available: true,
            space_fee: spot.price || result.data.price || result.data.space_fee || 0,
            space_type: spot.type || result.data.space_type || 'Standard',
            spotData: spot
          }));
          setSpaceCards(cards);
        } else {
          const cards = Array.from({ length: result.data.space_number || 0 }, (_, i) => ({
            id: i + 1,
            space_number: i + 1,
            is_available: true,
            space_fee: result.data.price || result.data.space_fee || 0,
            space_type: result.data.space_type || 'Standard'
          }));
          setSpaceCards(cards);
        }
      } else if (isMounted.current) {
        throw new Error("Invalid room details format");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, roomDetails: false }));
      }
      isFetchingRoomDetails.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchCurrencySymbol = useCallback(async (locationId) => {
    if (!locationId || !tenantToken || !tenantSlug) return "₦";
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/fetch/currency/location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tenantToken}`,
          },
          body: JSON.stringify({ location_id: locationId }),
        }
      );
      const result = await response.json();
      if (Array.isArray(result.data) && result.data.length > 0) {
        return result.data[0].symbol || "₦";
      }
      return "₦";
    } catch (err) {
      return "₦";
    }
  }, [tenantToken, tenantSlug]);

  // Initial data fetch
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchLocations();
      fetchUsers();
    }
  }, [tenantToken, tenantSlug, fetchLocations, fetchUsers]);

  // Fetch floors when location changes
  useEffect(() => {
    if (tenantToken && tenantSlug && selectedLocation) {
      fetchFloors(selectedLocation);
      // Reset floor and room selection
      setSelectedFloor("");
      setRoomsData([]);
      setSelectedRoom(null);
      setSpaceCards([]);
      setRoomDetails(null);
      
      // Fetch currency symbol for new location
      fetchCurrencySymbol(selectedLocation).then(symbol => {
        if (isMounted.current) setCurrencySymbol(symbol);
      });
    }
  }, [tenantToken, tenantSlug, selectedLocation, fetchFloors, fetchCurrencySymbol]);

  // Fetch rooms when floor changes
  useEffect(() => {
    if (tenantToken && tenantSlug && selectedLocation && selectedFloor) {
      fetchRooms(selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize);
      // Reset room selection
      setSelectedRoom(null);
      setSpaceCards([]);
      setRoomDetails(null);
    }
  }, [tenantToken, tenantSlug, selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize, fetchRooms]);

  // Fetch room details when room changes
  useEffect(() => {
    if (selectedRoom) {
      fetchRoomDetails(selectedRoom.id);
    } else {
      setSpaceCards([]);
      setRoomDetails(null);
    }
  }, [selectedRoom, fetchRoomDetails]);

  const handleLocationChange = useCallback((e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleFloorChange = useCallback((e) => {
    const floorId = e.target.value;
    setSelectedFloor(floorId);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleViewSpotsClick = useCallback(async (room) => {
    setSelectedRoom(room);
    setTimeout(scrollToSpots, 300);
  }, [scrollToSpots]);

  const handleBookNowClick = useCallback((space) => {
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
    setInvoiceType("default");
    setInvoiceItems([{ name: "", charge: "", number: "1" }]);
    setShowBookingPopup(true);
  }, []);

  const handleBookingClose = useCallback(() => {
    setShowBookingPopup(false);
    setSelectedSpace(null);
    setInvoiceType("default");
    setInvoiceItems([{ name: "", charge: "", number: "1" }]);
  }, []);

  const handleDayChange = useCallback((index, field, value) => {
    setBookingFormData(prev => {
      const updatedDays = [...prev.chosen_days];
      
      if (field === 'start_time' && value) {
        const dayName = format(value, 'EEEE').toLowerCase();
        updatedDays[index] = {
          day: dayName,
          start_time: value,
          end_time: updatedDays[index]?.end_time
        };
        
        if (updatedDays[index].end_time && isBefore(updatedDays[index].end_time, value)) {
          updatedDays[index].end_time = addHours(value, 1);
        }
      } else if (field === 'end_time') {
        updatedDays[index] = {
          ...updatedDays[index],
          end_time: value
        };
      }
      
      return {
        ...prev,
        chosen_days: updatedDays
      };
    });
  }, []);

  const addDay = useCallback(() => {
    setBookingFormData(prev => ({
      ...prev,
      chosen_days: [
        ...prev.chosen_days,
        { start_time: null, end_time: null }
      ]
    }));
  }, []);

  const removeDay = useCallback((index) => {
    setBookingFormData(prev => ({
      ...prev,
      chosen_days: prev.chosen_days.filter((_, i) => i !== index)
    }));
  }, []);

  const handleBookingInputChange = useCallback((e) => {
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
  }, []);

  const handleInvoiceTypeChange = useCallback((e) => {
    setInvoiceType(e.target.value);
    if (e.target.value === "default") {
      setInvoiceItems([{ name: "", charge: "", number: "1" }]);
    }
  }, []);

  const handleInvoiceItemChange = useCallback((index, field, value) => {
    setInvoiceItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addInvoiceItem = useCallback(() => {
    setInvoiceItems(prev => [
      ...prev,
      { name: "", charge: "", number: "1" }
    ]);
  }, []);

  const removeInvoiceItem = useCallback((index) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(prev => prev.filter((_, i) => i !== index));
    }
  }, [invoiceItems.length]);

  const calculateInvoiceTotal = useCallback(() => {
    return invoiceItems.reduce((total, item) => {
      const charge = parseFloat(item.charge) || 0;
      const number = parseInt(item.number) || 1;
      return total + (charge * number);
    }, 0);
  }, [invoiceItems]);

  const formatTimeForAPI = useCallback((date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd HH:mm:ss");
  }, []);

  const createDynamicInvoice = useCallback(async (bookingData) => {
    const invoiceData = {
      spot_id: bookingData.spot_id,
      user_id: bookingData.user_id,
      type: bookingData.type,
      spot_fee: selectedSpace.space_fee,
      item_name: invoiceItems.map(item => item.name),
      item_charge: invoiceItems.map(item => parseFloat(item.charge) || 0),
      item_number: invoiceItems.map(item => parseInt(item.number) || 1),
      number_weeks: bookingData.number_weeks,
      number_months: bookingData.number_months,
      chosen_days: bookingData.chosen_days
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/dynamic/invoice/create`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tenantToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Timezone-Offset": new Date().getTimezoneOffset()
        },
        body: JSON.stringify(invoiceData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create dynamic invoice");
    }

    return await response.json();
  }, [tenantToken, tenantSlug, selectedSpace, invoiceItems]);

  const createRegularBooking = useCallback(async (bookingData) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/book`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tenantToken}`,
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

    return await response.json();
  }, [tenantToken, tenantSlug]);

  const handleBookingSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, booking: true }));
    
    try {
      // Validate form
      const hasEmptyFields = bookingFormData.chosen_days.some(day => 
        !day.day || !day.start_time || !day.end_time
      ) || !bookingFormData.user_id;
      
      if (hasEmptyFields) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare booking data
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

      // Validate time ranges
      for (const day of bookingData.chosen_days) {
        const start = parseISO(day.start_time.replace(' ', 'T') + 'Z');
        const end = parseISO(day.end_time.replace(' ', 'T') + 'Z');
        
        if (isBefore(end, start)) {
          throw new Error("End time must be after start time");
        }
      }

      let result;
      
      if (invoiceType === "dynamic") {
        const hasEmptyInvoiceItems = invoiceItems.some(item => 
          !item.name.trim() || !item.charge
        );
        
        if (hasEmptyInvoiceItems) {
          throw new Error("Please fill in all invoice item fields");
        }

        result = await createDynamicInvoice(bookingData);
      } else {
        result = await createRegularBooking(bookingData);
      }

      toast.success(result.message || "Space booked successfully!");
      
      handleBookingClose();
      
      // Refresh room details
      if (selectedRoom) {
        await fetchRoomDetails(selectedRoom.id);
      }
    } catch (error) {
      toast.error(error.message || "Failed to process booking");
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, booking: false }));
      }
    }
  }, [bookingFormData, selectedSpace, invoiceType, invoiceItems, createDynamicInvoice, createRegularBooking, handleBookingClose, selectedRoom, fetchRoomDetails, formatTimeForAPI]);

  // Paginate rooms data
  const paginatedRooms = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return roomsData.slice(start, end);
  }, [roomsData, pagination.currentPage, pagination.pageSize]);

  // Update total pages when roomsData changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalPages: Math.ceil(roomsData.length / prev.pageSize) || 1
    }));
  }, [roomsData, pagination.pageSize]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Book Spot", path: "/booking/book-spot", active: true },
        ]}
        title="Book a Spot"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card>
                <Card.Body style={{ background: secondary, marginTop: "30px" }}>
                  {/* Location Selection */}
                  {loading.locations ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading locations...</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom: "10px", fontSize: "1rem" }}>
                        Select a location to view available rooms.
                      </p>
                      <Form.Select
                        style={{ marginBottom: "25px", fontSize: "1rem" }}
                        value={selectedLocation}
                        onChange={handleLocationChange}
                      >
                        <option value="">Select a location</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} - {location.state}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  )}

                  {/* Floor Selection */}
                  {selectedLocation && (
                    <Form.Group className="mb-3" controlId="floor_id">
                      {loading.floors ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" size="sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                          <p className="mt-2">Loading floors...</p>
                        </div>
                      ) : (
                        <>
                          <Form.Label>
                            Select the floor/section to view rooms.
                          </Form.Label>
                          <Form.Select
                            name="floor_id"
                            value={selectedFloor}
                            onChange={handleFloorChange}
                            required
                          >
                            <option value="">Select a Floor/Section</option>
                            {floorData.map((floor) => (
                              <option key={floor.id} value={floor.id}>
                                {floor.name}
                              </option>
                            ))}
                          </Form.Select>
                        </>
                      )}
                    </Form.Group>
                  )}

                  {/* Rooms Display */}
                  {selectedFloor && (
                    <>
                      {loading.rooms ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                          <p className="mt-2">Loading rooms...</p>
                        </div>
                      ) : (
                        <>
                          <h4 className="mb-3">Available Rooms</h4>
                          {paginatedRooms.length > 0 ? (
                            <>
                              <Row>
                                {paginatedRooms.map((room) => (
                                  <Col key={room.id} md={4} className="mb-3">
                                    <Card className="h-100">
                                      <Card.Body className="d-flex flex-column">
                                        <Card.Title className="d-flex justify-content-between align-items-center">
                                          <span>{room.space_name}</span>
                                          <Badge bg="info">Spots: {room.space_number}</Badge>
                                        </Card.Title>
                                        <Card.Text className="flex-grow-1">
                                          <div>
                                            <strong>Category:</strong> {room.category?.category || 'N/A'}
                                          </div>
                                          <div>
                                            <strong>Fee/Spot:</strong> {currencySymbol}{room.space_fee}
                                          </div>
                                        </Card.Text>
                                        <div className="mt-auto">
                                          <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-100"
                                            onClick={() => handleViewSpotsClick(room)}
                                            style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
                                            disabled={loading.roomDetails && selectedRoom?.id === room.id}
                                          >
                                            {loading.roomDetails && selectedRoom?.id === room.id ? (
                                              <>
                                                <Spinner size="sm" animation="border" className="me-1" />
                                                Loading...
                                              </>
                                            ) : "View Spots"}
                                          </Button>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                ))}
                              </Row>

                              {/* Pagination Controls */}
                              {roomsData.length > pagination.pageSize && (
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                  <div>
                                    Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
                                    {Math.min(pagination.currentPage * pagination.pageSize, roomsData.length)} of{' '}
                                    {roomsData.length} rooms
                                  </div>
                                  <div className="d-flex gap-2">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPagination(prev => ({ 
                                        ...prev, 
                                        currentPage: Math.max(1, prev.currentPage - 1) 
                                      }))}
                                      disabled={pagination.currentPage === 1}
                                      style={{ borderColor: primary, color: primary }}
                                    >
                                      <i className="mdi mdi-chevron-left"></i> Previous
                                    </Button>
                                    <span className="align-self-center">
                                      Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => setPagination(prev => ({ 
                                        ...prev, 
                                        currentPage: Math.min(prev.totalPages, prev.currentPage + 1) 
                                      }))}
                                      disabled={pagination.currentPage === pagination.totalPages}
                                      style={{ borderColor: primary, color: primary }}
                                    >
                                      Next <i className="mdi mdi-chevron-right"></i>
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <Alert variant="info">No rooms found for this floor/section.</Alert>
                          )}
                        </>
                      )}

                      {/* Room Details and Spaces Section */}
                      {selectedRoom && (
                        <div className="mt-4" id="spots-section">
                          <h4 className="mb-3">Available Spots in {selectedRoom.space_name}</h4>
                          
                          {loading.roomDetails ? (
                            <div className="text-center py-4">
                              <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading spots...</span>
                              </Spinner>
                              <p className="mt-2">Loading available spots...</p>
                            </div>
                          ) : spaceCards.length > 0 ? (
                            <>
                              <p className="mb-3">
                                <strong>Total spots:</strong> {spaceCards.length} | 
                                <strong> Fee per spot:</strong> {currencySymbol}{spaceCards[0]?.space_fee}
                              </p>
                              <Row>
                                {spaceCards.map((space, index) => (
                                  <Col key={space.id} md={3} className="mb-3">
                                    <Card className="h-100">
                                      <Card.Body className="d-flex flex-column">
                                        <Card.Title className="d-flex justify-content-between align-items-center">
                                          <span>Spot {index + 1}</span>
                                          <Badge bg="success">Available</Badge>
                                        </Card.Title>
                                        <Card.Text className="flex-grow-1">
                                          <div><strong>Number:</strong> {index + 1}</div>
                                          <div><strong>Fee:</strong> {currencySymbol}{space.space_fee}</div>
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
                            <Alert variant="info">No spots available in this room.</Alert>
                          )}
                          
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="mt-3"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                          >
                            <i className="mdi mdi-arrow-up me-1"></i>
                            Back to Top
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Registration Modal */}
      <UsersRegistrationModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        myUser={selectedUser}
        onSubmit={fetchUsers}
      />

      {/* Booking Popup */}
      {showBookingPopup && selectedSpace && (
        <Popup
          title={`Book Spot #${selectedSpace.space_number}`}
          isVisible={showBookingPopup}
          onClose={handleBookingClose}
          size="lg"
        >
          <div style={{ maxHeight: "70vh", maxWidth: "80vw", overflowY: "auto", paddingRight: "8px" }}>
            <Form onSubmit={handleBookingSubmit}>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Booking Type *</Form.Label>
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
                    <Form.Label>Select User *</Form.Label>
                    <div className="d-flex align-items-center">
                      {loading.users ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Form.Select
                          name="user_id"
                          value={bookingFormData.user_id}
                          onChange={handleBookingInputChange}
                          required
                          className="flex-grow-1 me-2"
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
                          setShowUserModal(true);
                        }}
                        style={{ borderColor: primary, color: primary }}
                      >
                        <i className="mdi mdi-plus"></i> New User
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Invoice Type Selection */}
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Invoice Type</Form.Label>
                    <Form.Select
                      value={invoiceType}
                      onChange={handleInvoiceTypeChange}
                      required
                    >
                      <option value="default">Standard Invoice (Space Fee Only)</option>
                      <option value="dynamic">Custom Invoice (Add Items)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Dynamic Invoice Items */}
              {invoiceType === "dynamic" && (
                <>
                  <h6 className="mt-3 mb-2">Additional Items</h6>
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="border p-3 mb-3 rounded">
                      <Row>
                        <Col md={5}>
                          <Form.Group className="mb-2">
                            <Form.Label>Item Name *</Form.Label>
                            <Form.Control
                              type="text"
                              value={item.name}
                              onChange={(e) => handleInvoiceItemChange(index, 'name', e.target.value)}
                              placeholder="e.g., Setup fee, Extras"
                              required={invoiceType === "dynamic"}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-2">
                            <Form.Label>Charge ({currencySymbol}) *</Form.Label>
                            <Form.Control
                              type="number"
                              value={item.charge}
                              onChange={(e) => handleInvoiceItemChange(index, 'charge', e.target.value)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              required={invoiceType === "dynamic"}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group className="mb-2">
                            <Form.Label>Qty *</Form.Label>
                            <Form.Control
                              type="number"
                              value={item.number}
                              onChange={(e) => handleInvoiceItemChange(index, 'number', e.target.value)}
                              min="1"
                              required={invoiceType === "dynamic"}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex align-items-end">
                          {invoiceItems.length > 1 && (
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => removeInvoiceItem(index)}
                              className="mb-2 w-100"
                            >
                              Remove
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={addInvoiceItem}
                    className="mb-3"
                    style={{ borderColor: primary, color: primary }}
                  >
                    Add Another Item
                  </Button>
                  
                  <div className="border-top pt-2 mb-3">
                    <div className="d-flex justify-content-between">
                      <strong>Space Fee:</strong>
                      <span>{currencySymbol}{selectedSpace.space_fee}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <strong>Additional Items Total:</strong>
                      <span>{currencySymbol}{calculateInvoiceTotal().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <strong>Grand Total:</strong>
                      <strong>{currencySymbol}{(calculateInvoiceTotal() + parseFloat(selectedSpace.space_fee || 0)).toFixed(2)}</strong>
                    </div>
                  </div>
                </>
              )}

              {/* Recurring Booking Options */}
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
                        min="0"
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
                        required={bookingFormData.type === "recurrent"}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <h5 className="mt-3">Booking Schedule</h5>
              {bookingFormData.chosen_days.map((day, index) => (
                <div key={index} className="border p-3 mb-3 rounded">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Start Time *</Form.Label>
                        <DatePicker
                          selected={day.start_time}
                          onChange={(date) => handleDayChange(index, 'start_time', date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMM d, yyyy h:mm aa"
                          className="form-control"
                          placeholderText="Select start date & time"
                          minDate={new Date()}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>End Time *</Form.Label>
                        <DatePicker
                          selected={day.end_time}
                          onChange={(date) => handleDayChange(index, 'end_time', date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMM d, yyyy h:mm aa"
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
                style={{ borderColor: primary, color: primary }}
              >
                Add Another Time Slot
              </Button>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleBookingClose}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading.booking}
                  style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
                >
                  {loading.booking ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-1" />
                      Processing...
                    </>
                  ) : 'Confirm Booking'}
                </Button>
              </div>
            </Form>
          </div>
        </Popup>
      )}

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
    </>
  );
};

export default SeatBookingSystem;