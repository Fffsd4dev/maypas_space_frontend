import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import TimeRegistrationModal from "./TimesRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";

const OperatingTimes = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);
  const isFetchingLocations = useRef(false);

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOperatingTime, setSelectedOperatingTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    locationId: null,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
    pageSize: 10,
  });

  const dayOrder = useMemo(() => [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ], []);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const formatTime = useCallback((time) => {
    if (!time) return "Closed";
    try {
      const [hour, minute] = time.split(":").map(Number);
      const period = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
    } catch (error) {
      return "Invalid Time";
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    if (isFetchingLocations.current || !tenantToken || !tenantSlug) return;
    
    isFetchingLocations.current = true;
    setLoadingLocations(true);
    
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
        setLoadingLocations(false);
      }
      isFetchingLocations.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchData = useCallback(async (locationId, page = 1, pageSize = 10) => {
    if (isFetching.current || !tenantToken || !tenantSlug || !locationId) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/settings/workspace/time/all?location_id=${locationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (isMounted.current && Array.isArray(result)) {
        // Sort by day order
        const sortedData = result.sort(
          (a, b) =>
            dayOrder.indexOf(a.day.toLowerCase()) -
            dayOrder.indexOf(b.day.toLowerCase())
        );
        
        setData(sortedData);
        
        // Calculate total pages based on data length
        const totalPages = Math.ceil(sortedData.length / pageSize);
        setPagination({
          currentPage: page,
          totalPages: totalPages,
          nextPageUrl: page < totalPages ? `?page=${page + 1}` : null,
          prevPageUrl: page > 1 ? `?page=${page - 1}` : null,
          pageSize: pageSize,
        });
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
        setError(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [tenantToken, tenantSlug, dayOrder]);

  // Fetch locations on mount
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchLocations();
    }
  }, [tenantToken, tenantSlug, fetchLocations]);

  // Fetch operating times when location changes
  useEffect(() => {
    if (tenantToken && tenantSlug && selectedLocation) {
      fetchData(selectedLocation, pagination.currentPage, pagination.pageSize);
    } else {
      setData([]);
    }
  }, [tenantToken, tenantSlug, selectedLocation, pagination.currentPage, pagination.pageSize, fetchData]);

  const handleEditClick = useCallback((locationId) => {
    // Get operating times for the selected location
    const operatingTimesForLocation = data.filter(
      (item) => String(item.location_id) === String(locationId)
    );

    // Create full week with existing times
    const fullWeek = dayOrder.map((day) => {
      const found = operatingTimesForLocation.find(
        (item) => item.day.toLowerCase() === day
      );
      return found
        ? {
            day,
            open_time: found.open_time ? found.open_time.slice(0, 5) : null,
            close_time: found.close_time ? found.close_time.slice(0, 5) : null,
          }
        : { day, open_time: null, close_time: null };
    });

    setSelectedOperatingTime({
      location_id: locationId,
      hours: fullWeek,
    });
    setShow(true);
  }, [data, dayOrder]);

  const handleClose = useCallback(() => {
    setShow(false);
    setSelectedOperatingTime(null);
  }, []);

  const handleDelete = useCallback(async (locationId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/settings/workspace/time/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ location_id: locationId }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to delete.");

      setPopup({
        message: "Operating hours deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });

      // Refresh data
      if (selectedLocation) {
        fetchData(selectedLocation, pagination.currentPage, pagination.pageSize);
      }
    } catch (error) {
      toast.error("Failed to delete operating hours!");
      setPopup({
        message: "Failed to delete operating hours!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, selectedLocation, fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDeleteButton = useCallback((locationId) => {
    setDeletePopup({
      isVisible: true,
      locationId,
    });
  }, []);

  const confirmDelete = useCallback(() => {
    handleDelete(deletePopup.locationId);
    setDeletePopup({ isVisible: false, locationId: null });
  }, [deletePopup, handleDelete]);

  const handleLocationChange = useCallback((e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const handleRefresh = useCallback(() => {
    if (selectedLocation) {
      fetchData(selectedLocation, pagination.currentPage, pagination.pageSize);
    }
  }, [selectedLocation, fetchData, pagination.currentPage, pagination.pageSize]);

  // Memoized columns
  const columns = useMemo(() => [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1 + (pagination.currentPage - 1) * pagination.pageSize,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Day",
      accessor: "day",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Open Time",
      accessor: "open_time",
      sort: true,
      Cell: ({ value }) => formatTime(value),
    },
    {
      Header: "Close Time",
      accessor: "close_time",
      sort: true,
      Cell: ({ value }) => formatTime(value),
    },
  ], [pagination.currentPage, pagination.pageSize, formatTime]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return data.slice(start, end);
  }, [data, pagination.currentPage, pagination.pageSize]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          {
            label: "Operating Hours",
            path: "/settings/operating-hours",
            active: true,
          },
        ]}
        title="Operating Hours"
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
                      if (selectedLocation) {
                        handleEditClick(selectedLocation);
                      } else {
                        setShow(true);
                        setSelectedOperatingTime(null);
                      }
                    }}
                    style={{
                      backgroundColor: primary,
                      borderColor: primary,
                      color: "#fff",
                    }}
                    disabled={!selectedLocation && !show}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> 
                    {selectedLocation ? "Edit Hours" : "Add Hours"}
                  </Button>
                  {!selectedLocation && (
                    <small className="text-muted d-block mt-1">
                      Please select a location first
                    </small>
                  )}
                </Col>
                <Col sm={8} className="text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading || !selectedLocation}
                  >
                    <i className="mdi mdi-refresh me-1"></i>
                    Refresh
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
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading locations...</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom: "10px", fontSize: "1rem" }}>
                        Select a location to view operating hours.
                      </p>
                      <Form.Select
                        style={{ marginBottom: "25px", fontSize: "1rem" }}
                        value={selectedLocation}
                        onChange={handleLocationChange}
                        required
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
                  
                  {selectedLocation && (
                    <>
                      {error ? (
                        <div className="alert alert-danger" role="alert">
                          <i className="mdi mdi-alert-circle-outline me-2"></i>
                          Error: {error}
                        </div>
                      ) : loading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                          <p className="mt-2">Loading operating hours...</p>
                        </div>
                      ) : isLoading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Processing...</span>
                          </Spinner>
                          <p className="mt-2">Processing...</p>
                        </div>
                      ) : (
                        <>
                          <Table2
                            columns={columns}
                            data={paginatedData}
                            pageSize={pagination.pageSize}
                            isSortable
                            isSearchable={false} // Disable search for this simple table
                            tableClass="table-striped dt-responsive nowrap w-100"
                            searchBoxClass="my-2"
                            paginationProps={{
                              currentPage: pagination.currentPage,
                              totalPages: pagination.totalPages,
                              onPageChange: handlePageChange,
                              onPageSizeChange: handlePageSizeChange,
                            }}
                          />

                          <Row className="mt-3">
                            <Col className="d-flex gap-2">
                              <Button
                                variant="primary"
                                onClick={() => handleEditClick(selectedLocation)}
                                style={{
                                  backgroundColor: primary,
                                  borderColor: primary,
                                  color: "#fff",
                                }}
                                disabled={loading}
                              >
                                <i className="mdi mdi-pencil me-1"></i>
                                Edit Hours
                              </Button>
                              
                              {data.length > 0 && (
                                <Button
                                  variant="danger"
                                  onClick={() => handleDeleteButton(selectedLocation)}
                                  style={{
                                    backgroundColor: "#dc3545",
                                    borderColor: "#dc3545",
                                    color: "#fff",
                                  }}
                                  disabled={loading}
                                >
                                  <i className="mdi mdi-delete me-1"></i>
                                  Delete All
                                </Button>
                              )}
                            </Col>
                          </Row>
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

      <TimeRegistrationModal
        show={show}
        onHide={handleClose}
        operatingTime={selectedOperatingTime}
        locations={locations} // Pass locations to avoid duplicate fetch
        onSubmit={() => {
          if (selectedLocation) {
            fetchData(selectedLocation, pagination.currentPage, pagination.pageSize);
          }
        }}
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
          message="Are you sure you want to delete all operating hours for this location?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, locationId: null })}
          buttonLabel="Yes, Delete"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default OperatingTimes;