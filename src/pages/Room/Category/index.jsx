import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import CategoryRegistrationModal from "./CategoryRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";

const Categories = () => {
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
  const [selectedCategory, setSelectedCategory] = useState(null);
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
    categoryId: null,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
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
    if (!isoString) return "";
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

  const fetchData = useCallback(async (locationId, page = 1, pageSize = 10) => {
    if (isFetching.current || !tenantToken || !tenantSlug || !locationId) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/list-category-by-location/${locationId}?page=${page}&per_page=${pageSize}`,
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

      if (isMounted.current && result && Array.isArray(result.data)) {
        const sortedData = [...result.data].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(sortedData);
        setPagination({
          currentPage: result.current_page || 1,
          totalPages: result.last_page || 1,
          nextPageUrl: result.next_page_url || null,
          prevPageUrl: result.prev_page_url || null,
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

  // Fetch locations once on mount
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchLocations();
    }
  }, [tenantToken, tenantSlug, fetchLocations]);

  // Fetch categories when location or pagination changes
  useEffect(() => {
    if (tenantToken && tenantSlug && selectedLocation) {
      fetchData(selectedLocation, pagination.currentPage, pagination.pageSize);
    }
  }, [tenantToken, tenantSlug, selectedLocation, pagination.currentPage, pagination.pageSize, fetchData]);

  const handleEditClick = useCallback((category) => {
    setSelectedCategory(category);
    setShow(true);
  }, []);

  const handleCopy = useCallback((category) => {
    const baseUrl = window.location.origin;
    const categorySlug = category.category.toLowerCase().replace(/\s+/g, "_");
    const url = `${baseUrl}/${tenantSlug}/${categorySlug}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setPopup({
        message: "Link copied to clipboard!",
        type: "success",
        isVisible: true,
        buttonLabel: "OK",
        buttonRoute: "",
      });
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  }, [tenantSlug]);

  const handleClose = useCallback(() => {
    setShow(false);
    setSelectedCategory(null);
  }, []);

  const handleDelete = useCallback(async (categoryId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: categoryId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((category) => category.id !== categoryId)
      );
      
      setPopup({
        message: "Category deleted successfully!",
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
      toast.error("Failed to delete category!");
      setPopup({
        message: "Failed to delete category!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, selectedLocation, fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDeleteButton = useCallback((categoryId) => {
    setDeletePopup({
      isVisible: true,
      categoryId,
    });
  }, []);

  const confirmDelete = useCallback(() => {
    const { categoryId } = deletePopup;
    handleDelete(categoryId);
    setDeletePopup({ isVisible: false, categoryId: null });
  }, [deletePopup, handleDelete]);

  const handleLocationChange = useCallback((e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    // Reset to first page when location changes
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
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Category Name",
      accessor: "category",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Booking Type",
      accessor: "booking_type",
      sort: true,
      Cell: ({ value }) => value ? value.toUpperCase() : "",
    },
    {
      Header: "Min Duration",
      accessor: "min_duration",
      sort: true,
      Cell: ({ value, row }) => 
        value ? `${value} ${row.original.booking_type || ''}` : '',
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
        <div style={{ whiteSpace: "nowrap" }}>
          <Link
            to="#"
            className="action-icon"
            onClick={(e) => {
              e.preventDefault();
              handleEditClick(row.original);
            }}
            style={{ marginRight: "10px" }}
            title="Edit Category"
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteButton(row.original.id);
            }}
            style={{ marginRight: "10px" }}
            title="Delete Category"
          >
            <i className="mdi mdi-delete"></i>
          </Link>
          <Link
            to="#"
            className="action-icon"
            onClick={(e) => {
              e.preventDefault();
              handleCopy(row.original);
            }}
            title="Copy Category Link"
          >
            <i className="mdi mdi-content-copy"></i>
          </Link>
        </div>
      ),
    },
  ], [handleEditClick, handleDeleteButton, handleCopy, formatDateTime]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "My Categories", path: "/room/my-categories", active: true },
        ]}
        title="My Categories"
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
                      setSelectedCategory(null);
                    }}
                    style={{
                      backgroundColor: primary,
                      borderColor: primary,
                      color: "#fff",
                    }}
                    disabled={!selectedLocation}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a Category
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
                      <p className="mt-2">Loading your locations...</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom: "10px", fontSize: "1rem" }}>
                        Select a location to view or update categories.
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
                          <p className="mt-2">Loading categories...</p>
                        </div>
                      ) : isLoading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Deleting...</span>
                          </Spinner>
                          <p className="mt-2">Deleting...</p>
                        </div>
                      ) : (
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
                            onPageChange: handlePageChange,
                            onPageSizeChange: handlePageSizeChange,
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

      <CategoryRegistrationModal
        show={show}
        onHide={handleClose}
        category={selectedCategory}
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
          message="Are you sure you want to delete this room category?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, categoryId: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default Categories;