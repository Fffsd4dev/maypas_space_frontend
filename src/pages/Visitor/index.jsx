import React, { useState, useEffect, useRef } from "react";
import { Link, redirect, useNavigate, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  Badge,
  Alert,
} from "react-bootstrap";
import PageTitle from "../../components/PageTitle";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../components/Popup/Popup";
import Table2 from "../../components/Table2";
import { toast } from "react-toastify";
import UsersRegistrationModal from "../MyWorkspaceAccount/Personal/UsersRegistrationForm";
import Error404Alt from "../../pages/error/Error404Alt";
import axios from "axios";
import "./index.css";
import logo from "@/assets/images/logo-dark.png";
import ProfileDropdown from "@/components/ProfileDropdown";
import profileImg from "@/assets/images/users/user-1.jpg";
import profilePic from "../../assets/images/users/user-1.jpg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, isBefore, addHours } from "date-fns";
import { reference } from "@popperjs/core";
import { useLogoColor } from "../../context/LogoColorContext";

const SeatBookingSystem = () => {
  const { removeSession } = useAuthContext();
  const { user } = useAuthContext();

  const tenantToken = user?.tenantToken;

  const { logoColor } = useLogoColor();

  const visitorFirstName = user?.visitorFirstName;
  const visitorToken = user?.visitorToken;
  const [noRooms, setNoRooms] = useState(false);

  const { visitorSlug: visitorUrlSlug } = useParams();
  const visitorSlug = user?.visitor || visitorUrlSlug;
  const [userId, setUserId] = useState(null);
  const userIDRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (document.body)
      document.body.classList.remove(
        "authentication-bg",
        "authentication-bg-pattern"
      );
  }, []);



  const ProfileMenus = [
    {
      label: "Logout",
      icon: "fe-log-out",
      redirectTo: `/${visitorSlug}/auth/visitorLogout`,
    },
  ];

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

  if (!visitorSlug) {
    return <Error404Alt />;
  }

  useEffect(() => {
    if (document.body)
      document.body.classList.remove(
        "authentication-bg",
        "authentication-bg-pattern"
      );
  }, []);

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
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Booking popup states
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
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
    room_id: "",
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
    console.log(visitorSlug);
    setLoadingLocations(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${visitorSlug}/get/locations`
      );
      console.log(response);
      const result = await response.json();
      console.log(result);

      if (response.ok) {
        if (result && Array.isArray(result.data)) {
          const data = result.data;
          setLocations(data || []);
          if (data.length === 1) {
            setSelectedLocation(data[0].id);
          }
        }
      } else {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      toast.error(error.message);
      if (
        error.message === "This workspace is not registered on our platform"
      ) {
        setNotFound(true);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoadingLocations(false);
    }
  };

  // Handle location change
  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setFormData((prev) => ({
      ...prev,
      location_id: locationId,
      room_id: "",
    }));
    setFloorData([]);
    setRoomsData([]);
    setData([]);
    setSpaceCards([]);
    setRoomDetails(null);
  };

  // Fetch rooms for selected location
  const fetchRoom = async (locationId, page = 1, pageSize = 10) => {
    // Only fetch if locationId is valid (not null/undefined/empty string)
    if (!locationId) {
      setRoomsData([]);
      setNoRooms(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNoRooms(false);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${visitorSlug}/get/spaces/${locationId}?page=${page}&per_page=${pageSize}`,
        { method: "GET" }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      setRoomsData(result.data);
      setData(result.data);
      setPagination({
        currentPage: result.current_page,
        totalPages: result.last_page,
        nextPageUrl: result.next_page_url,
        prevPageUrl: result.prev_page_url,
        pageSize: pageSize,
      });

      if (
        !result.data ||
        (typeof result.data === "object" &&
          Object.values(result.data).every(
            (arr) => Array.isArray(arr) && arr.length === 0
          ))
      ) {
        setNoRooms(true);
      } else {
        setNoRooms(false);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate space cards based on space_number (fallback)
  const generateSpaceCards = (spaceNumber) => {
    return Array.from({ length: spaceNumber }, (_, i) => ({
      id: i + 1,
      space_number: i + 1,
      is_available: true,
      space_fee: roomDetails?.space_fee || 0,
      space_type: "Standard",
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
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${visitorSlug}/space/show/${roomId}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch room details: Status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Room details result:", result);

      if (result && result.data) {
        setRoomDetails(result.data);

        if (result.data.spots && Array.isArray(result.data.spots)) {
          const cards = result.data.spots.map((spot) => ({
            id: spot.id,
            space_number: spot.spot_number || spot.id,
            is_available: true,
            space_fee: spot.price || roomDetails?.space_fee || 0,
            space_type: spot.type || "Standard",
            spotData: spot,
          }));

          setSpaceCards(cards);
        } else {
          const cards = generateSpaceCards(result.data.space_number);
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
      room_id: "",
    }));
    setSelectedRoom(null);
    setSpaceCards([]);
    setRoomDetails(null);

    if (selectedLocation) {
      fetchRoom(selectedLocation, pagination.currentPage, pagination.pageSize);
    }
  };

  // Handle room change
  const handleRoomChange = async (e) => {
    const roomId = e.target.value;
    setSelectedRoom(roomId);
    setFormData((prev) => ({
      ...prev,
      room_id: roomId,
    }));

    if (roomId) {
      const filteredData = roomsData.filter((room) => room.id === roomId);
      setData(filteredData);
      await fetchRoomDetails(roomId);
    } else {
      setData(roomsData);
      setSpaceCards([]);
      setRoomDetails(null);
    }
  };

  // Handle close modal
  const handleClose = () => {
    setShow(false);

    if (selectedLocation) {
      fetchRoom(selectedLocation, pagination.currentPage, pagination.pageSize);
    }
  };

  // Handle changes to day fields
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

  // Add a new day to the booking
  const addDay = () => {
    setBookingFormData((prev) => ({
      ...prev,
      chosen_days: [...prev.chosen_days, { start_time: null, end_time: null }],
    }));
  };

  // Remove a day from the booking
  const removeDay = (index) => {
    setBookingFormData((prev) => ({
      ...prev,
      chosen_days: prev.chosen_days.filter((_, i) => i !== index),
    }));
  };

  // Handle book now click
  const handleBookNowClick = (room) => {
    console.log("Booking spot with ID:", room.spot_id);
    console.log("Spot details:", room);
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

  const formatTimeForAPI = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd HH:mm:ss");
  };

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
      console.log(userId);

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
      if (response.ok) {
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
  // Use effects
  useEffect(() => {
    fetchLocations();
    console.log("visitorToken:", visitorToken);
  }, []);

  useEffect(() => {
    // Only fetch rooms if a location is selected and locations have finished loading
    if (!loadingLocations && selectedLocation) {
      fetchRoom(selectedLocation, pagination.currentPage, pagination.pageSize);
    }
    // eslint-disable-next-line
  }, [
    selectedLocation,
    pagination.currentPage,
    pagination.pageSize,
    loadingLocations,
  ]);

  const [logoData, setLogoData] = useState([]);
  const [loadingLogo, setLoadingLogo] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogoData = async (page = 1, pageSize = 10) => {
    setLoadingLogo;
    setError(null);
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${visitorSlug}/view-details`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log(result);

      if (Array.isArray(result.data)) {
        // Sort the data by updated_at or created_at
        const sortedLogoData = result.data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setLogoData(sortedLogoData);
        console.log("Sorted Logo Data:", sortedLogoData);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
    } finally {
      setLoadingLogo(false);
    }
  };

  useEffect(() => {
    fetchLogoData();
  }, []);

  const primary = logoData[0]?.colour || "#fe0002" ;
  console.log(primary);
  

  return notFound ? (
    <Error404Alt />
  ) : (
    <>
      <div className="visitor-header">
        <h3>
          {" "}
          {logoData[0]?.logo ? (
            <img
              src={
                logoData[0]?.logo
                  ? `${
                      import.meta.env.VITE_BACKEND_URL
                    }/storage/uploads/tenant_logo/${logoData[0].logo}`
                  : profileImg
              }
              alt=""
              className="rounded-circle avatar-md"
            />
          ) : (
            ""
          )}
          | {visitorSlug.toUpperCase()}
        </h3>
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
              <button
                type="submit"
                style={{
                  backgroundColor: primary,
                  borderColor: primary,
                  color: "#fff",
                }}
              >
                Login
              </button>
            </Link>{" "}
          </h2>
        )}
      </div>
      <div className="pagetitle">
        <PageTitle
          breadCrumbItems={[
            {
              label: "Book a Spot",
              path: "/${visitorSlug}/home",
              active: true,
            },
          ]}
          title="Book a Spot"
        />
      </div>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card>
                <Card.Body
                  style={{
                    background:
                      "linear-gradient(to left,rgb(243, 233, 231),rgb(239, 234, 230))",
                    marginTop: "30px",
                    marginLeft: "2rem",
                    marginRight: "2rem",
                  }}
                >
                  {/* Location Selection */}
                  {loadingLocations ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>{" "}
                      Loading your locations...
                    </div>
                  ) : (
                    locations.length > 1 && (
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
                    )
                  )}
                  {/* Room Selection */}
                  {selectedLocation && (
                    <Form.Group className="mb-3" controlId="room_id">
                      {/* Only show "No room in this location" if locations have finished loading and not loading rooms */}
                      {!loadingLocations && !loading && noRooms ? (
                        <Alert variant="warning" className="text-center">
                          No room in this location
                        </Alert>
                      ) : (
                        roomsData &&
                        Object.keys(roomsData).map((category, idx) => (
                          <div
                            key={category}
                            className="mb-4 p-3 rounded"
                            style={{
                              background:
                                idx % 2 === 0
                                  ? "linear-gradient(to right, #f8f9fa, #e9ecef)"
                                  : "linear-gradient(to right, #f4f9e7, #e7f1ee)",
                            }}
                          >
                            {/* Category title as a link */}
                            <h4>
                              <Link
                                to={`/${visitorSlug}/${category
                                  .toLowerCase()
                                  .replace(/\s+/g, "_")}`}
                                style={{
                                  textDecoration: "underline",
                                  color: "#007bff",
                                }}
                              >
                                {category}
                              </Link>
                            </h4>
                            <Row>
                              {roomsData[category].length === 0 ? (
                                <Col>
                                  <Alert variant="info">
                                    No spaces in this category.
                                  </Alert>
                                </Col>
                              ) : (
                                roomsData[category].map((room) => (
                                  <Col
                                    key={room.spot_id}
                                    md={3}
                                    className="mb-3"
                                  >
                                    <Card className="h-100">
                                      <Card.Body className="d-flex flex-column">
                                        <Card.Title>
                                          {room.space_name}
                                        </Card.Title>
                                        <Card.Text className="flex-grow-1">
                                          <span>
                                            <strong>Fee:</strong>{" "}
                                            {room.space_fee}
                                          </span>
                                          <br />
                                          <span>
                                            <strong>Location:</strong>{" "}
                                            {room.location_name}
                                          </span>
                                          <br />
                                          <span>
                                            <strong>Floor:</strong>{" "}
                                            {room.floor_name}
                                          </span>
                                        </Card.Text>
                                        <div className="mt-auto">
                                          <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-100"
                                            onClick={() =>
                                              handleBookNowClick(room)
                                            }
                                            style={{
                                              backgroundColor: primary,
                                              borderColor: primary,
                                              color: "#fff",
                                            }}
                                          >
                                            Book Now
                                          </Button>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                ))
                              )}
                            </Row>
                          </div>
                        ))
                      )}
                    </Form.Group>
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
              {visitorToken ? (
                <Row>
                  <Col md={6}></Col>
                </Row>
              ) : (
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
              )}

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
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  style={{
                    backgroundColor: primary,
                    borderColor: primary,
                    color: "#fff",
                  }}
                >
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
    </>
  );
};

export default SeatBookingSystem;
