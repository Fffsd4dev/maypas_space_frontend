import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
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

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);
  const isFetchingLocations = useRef(false);

  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const [locations, setLocations] = useState([]);

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    timezoneId: null,
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

  const fetchData = useCallback(async (page = 1, pageSize = 10) => {
    if (isFetching.current || !tenantToken || !tenantSlug) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/get/time/zone`,
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
        const sortedData = [...result].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        
        setData(sortedData);
        
        // Client-side pagination
        const totalPages = Math.ceil(sortedData.length / pageSize);
        setPagination({
          currentPage: page,
          totalPages: totalPages,
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
  }, [tenantToken, tenantSlug]);

  // Fetch data on mount
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchLocations();
      fetchData(pagination.currentPage, pagination.pageSize);
    }
  }, [tenantToken, tenantSlug, pagination.currentPage, pagination.pageSize, fetchLocations, fetchData]);

  const handleEditClick = useCallback((timeZone) => {
    if (!timeZone) return;
    setSelectedTimeZone(timeZone);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedTimeZone(null);
  }, []);

  const handleDelete = useCallback(async (timezoneId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/destroy/time/zone/${timezoneId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || "Failed to delete.");

      setPopup({
        message: "Time zone deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });

      // Refresh data
      fetchData(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting time zone:", error);
      toast.error("Failed to delete time zone!");
      setPopup({
        message: "Failed to delete time zone!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDeleteButton = useCallback((timezoneId) => {
    setDeletePopup({
      isVisible: true,
      timezoneId,
    });
  }, []);

  const confirmDelete = useCallback(() => {
    handleDelete(deletePopup.timezoneId);
    setDeletePopup({ isVisible: false, timezoneId: null });
  }, [deletePopup, handleDelete]);

  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(pagination.currentPage, pagination.pageSize);
  }, [fetchData, pagination.currentPage, pagination.pageSize]);

  // Memoized columns
  const columns = useMemo(() => [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1 + (pagination.currentPage - 1) * pagination.pageSize,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Location",
      accessor: "location.name",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "N/A",
    },
    {
      Header: "Location Address",
      accessor: "location.address",
      sort: true,
      Cell: ({ value }) =>
        value ? value : "N/A",
    },
    {
      Header: "Location State",
      accessor: "location.state",
      sort: true,
      Cell: ({ value }) =>
        value ? value : "N/A",
    },
    {
      Header: "Time Zone",
      accessor: "utc_time_zone",
      sort: true,
      Cell: ({ value, row }) => {
        const tz = value ? `UTC${value}` : "N/A";
        const name = row.original.timezone_name || "";
        return (
          <div>
            <div>{tz}</div>
            {name && <small className="text-muted">{name}</small>}
          </div>
        );
      },
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
        <div style={{ whiteSpace: "nowrap" }}>
          <Link
            to="#"
            className="action-icon"
            onClick={(e) => {
              e.preventDefault();
              handleEditClick(row.original);
            }}
            style={{ marginRight: "10px" }}
            title="Edit Time Zone"
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon text-danger"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteButton(row.original.id);
            }}
            title="Delete Time Zone"
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </div>
      ),
    },
  ], [pagination.currentPage, pagination.pageSize, handleEditClick, handleDeleteButton, formatDateTime]);

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
          { label: "Time Zones", path: "/settings/time-zones", active: true },
        ]}
        title="Time Zones"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={6}>
                  <Button
                    variant="danger"
                    className="waves-effect waves-light"
                    onClick={() => {
                      setSelectedTimeZone(null);
                      setShowModal(true);
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
                <Col sm={6} className="text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <i className="mdi mdi-refresh me-1"></i>
                    Refresh
                  </Button>
                </Col>
              </Row>

              <Card>
                <Card.Body style={{ background: secondary, marginTop: "30px" }}>
                  {loadingLocations ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading locations...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger" role="alert">
                      <i className="mdi mdi-alert-circle-outline me-2"></i>
                      Error: {error}
                    </div>
                  ) : loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading time zones...</p>
                    </div>
                  ) : isLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Processing...</span>
                      </Spinner>
                      <p className="mt-2">Processing...</p>
                    </div>
                  ) : (
                    <Table2
                      columns={columns}
                      data={paginatedData}
                      pageSize={pagination.pageSize}
                      isSortable
                      isSearchable
                      pagination
                      tableClass="table-striped dt-responsive nowrap w-100"
                      searchBoxClass="my-2"
                      paginationProps={{
                        currentPage: pagination.currentPage,
                        totalPages: pagination.totalPages,
                        onPageChange: handlePageChange,
                        onPageSizeChange: handlePageSizeChange,
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ZoneRegistrationModal
        show={showModal}
        onHide={handleCloseModal}
        timeZone={selectedTimeZone}
        locations={locations}
        onSubmit={() => fetchData(pagination.currentPage, pagination.pageSize)}
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
          message="Are you sure you want to delete this time zone?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, timezoneId: null })}
          buttonLabel="Yes, Delete"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default TimeZone;