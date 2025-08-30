import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import ZoneRegistrationModal from "./ZoneRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";

const TimeZone = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const [isError, setIsError] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [formData, setFormData] = useState({
    location_id: "",
    hours: [
      { day: "monday", open_time: "09:00", close_time: "17:00" },
      { day: "tuesday", open_time: "09:00", close_time: "17:00" },
      { day: "wednesday", open_time: "09:00", close_time: "17:00" },
      { day: "thursday", open_time: "09:00", close_time: "17:00" },
      { day: "friday", open_time: "09:00", close_time: "17:00" },
      { day: "saturday", open_time: "14:00", close_time: "18:00" },
      { day: "sunday", open_time: "14:00", close_time: "18:00" },
    ],
  });

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    myTimeZoneID: null,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
    pageSize: 10,
  });

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

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/location/list-locations`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        console.log("Location:", result.data.data);
        setLocations(result.data.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      toast.error(error.message);
      setIsError(true);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchData = async (locationId, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/get/time/zone`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log(result);

      if (Array.isArray(result)) {
        // Sort the data by updated_at or created_at
        const sortedData = result.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(sortedData);
        console.log("Sorted Data:", sortedData);

        // Update pagination state (if needed)
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalPages: Math.ceil(result.length / pageSize),
        }));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


 useEffect(() => {
    if (user?.tenantToken) {
      fetchLocations();
      fetchData(null, pagination.currentPage, pagination.pageSize); // Fetch all time zones on load
    }
  }, [user?.tenantToken]);



const handleEditClick = (timeZoneObj) => {
  if (!timeZoneObj) return;
  setSelectedUser(timeZoneObj); // Now includes id, location_id, utc_time_zone, etc.
  setShow(true);
};

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    if (user?.tenantToken && selectedLocation) {
      fetchData(selectedLocation, pagination.currentPage, pagination.pageSize);
      // Reload users after closing the modal
    }
    setFormData({}); // Reset inputs after success
  };

 
const handleDelete = async (timezoneId) => {
  if (!user?.tenantToken) return;

  setIsLoading(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/destroy/time/zone/${timezoneId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.tenantToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: timezoneId }),
      }
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete.");

    setPopup({
      message: "Operating Time deleted successfully!",
      type: "success",
      isVisible: true,
    });

    fetchData(null, pagination.currentPage, pagination.pageSize);
  } catch (error) {
    toast.error("Failed to delete Time Zone!");
    setPopup({
      message: "Failed to delete Time Zone!",
      type: "error",
      isVisible: true,
    });
  } finally {
    setIsLoading(false);
  }
};

const handleDeleteButton = (timezoneId) => {
  setDeletePopup({
    isVisible: true,
    myTimeZoneID: timezoneId,
  });
};

  const confirmDelete = () => {
    handleDelete(deletePopup.myTimeZoneID);
    setDeletePopup({ isVisible: false, myTimeZoneID: null });
  };

  const formatTime = (time) => {
    if (!time) return ""; // Handle empty or undefined time
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 24-hour to 12-hour format
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setFormData((prev) => ({
      ...prev,
      location_id: locationId, // Update formData with the selected location ID
    }));
  };
  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Location",
      accessor: "location.name",
      sort: true,
      Cell: ({ value }) => value.charAt(0).toUpperCase() + value.slice(1),
    },
    {
      Header: "Location Address",
      accessor: "location.address",
      sort: true,
      Cell: ({ value }) => value.charAt(0).toUpperCase() + value.slice(1),
    },
    {
      Header: "Location State",
      accessor: "location.state",
      sort: true,
      Cell: ({ value }) => value.charAt(0).toUpperCase() + value.slice(1),
    },
    {
      Header: "Time Zone (in UTC)",
      accessor: "utc_time_zone",
      sort: true,
      Cell: ({ value }) => {
        const formattedValue = value ? value.replace("UTC", "") : "N/A";
        return formattedValue;
      },
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

    // {
    //   Header: "Action",
    //   accessor: "action",
    //   sort: false,
    //   Cell: ({ row }) => (
    //     <>
    //       <Link
    //         to="#"
    //         className="action-icon"
    //         onClick={() => handleEditClick(row.original)}
    //       >
    //         <i className="mdi mdi-square-edit-outline"></i>
    //       </Link>
    //       <Link
    //         to="#"
    //         className="action-icon"
    //         onClick={() => handleDeleteButton(row.original.id)}
    //       >
    //         <i className="mdi mdi-delete"></i>
    //       </Link>
    //     </>
    //   ),
    // },
  ];
   return (
    <>
      <PageTitle
        breadCrumbItems={[
          {
            label: "Time Zones",
            path: "/Settings/time-zone",
            active: true,
          },
        ]}
        title="Time Zones"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <Button
                    variant="danger"
                    className="waves-effect waves-light"
                    onClick={() => {
                      setShow(true);
                      setSelectedUser(null);
                    }}
                    style={{
                      backgroundColor: primary,
                      borderColor: primary,
                      color: "#fff",
                    }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add Time Zone
                  </Button>
                </Col>
              </Row>

              <Card>
                <Card.Body
                  style={{
                    background: secondary,
                    marginTop: "30px",
                  }}
                >
                  {loadingLocations ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>{" "}
                      Loading your locations...
                    </div>
                  ) : (
                    <>
                      {error ? (
                        <p className="text-danger">Error: {error}</p>
                      ) : loading ? (
                        <p>Loading your Time Zone...</p>
                      ) : isLoading ? (
                        <div className="text-center">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Deleting...</span>
                          </Spinner>{" "}
                          Deleting...
                        </div>
                      ) : (
                        <Table2
                          columns={columns}
                          data={data}
                          pageSize={pagination.pageSize}
                          isSortable
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
                      )}

                    </>
                  )}
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ZoneRegistrationModal
        show={show}
        onHide={handleClose}
        myTimeZone={selectedUser}
        onSubmit={() =>
          fetchData(null, pagination.currentPage, pagination.pageSize)
        }
      />

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
          message="Are you sure you want to delete this Time Zone?"
          type="confirm"
          onClose={() =>
            setDeletePopup({ isVisible: false, myTimeZoneID: null })
          }
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default TimeZone;
