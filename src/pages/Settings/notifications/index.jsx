import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import CreateNotificationModal from "./CreateNotificationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { useLogoColor } from "../../../context/LogoColorContext.jsx";
import { toast } from "react-toastify";

const Notification = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    notificationId: null,
  });

  const [publishPopup, setPublishPopup] = useState({
    isVisible: false,
    notificationId: null,
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

  const fetchData = useCallback(async (page = 1, pageSize = 10) => {
    if (isFetching.current || !tenantToken || !tenantSlug) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/notification/list-notifications?page=${page}&per_page=${pageSize}`,
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

      if (isMounted.current) {
        // Handle the response format - assuming result.data is the array
        const notificationsData = Array.isArray(result.data) ? result.data : [];
        
        const sortedData = [...notificationsData].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        
        setData(sortedData);
        
        // Update pagination if available
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.current_page || 1,
            totalPages: result.pagination.last_page || 1,
            nextPageUrl: result.pagination.next_page_url || null,
            prevPageUrl: result.pagination.prev_page_url || null,
            pageSize: pageSize,
          });
        }
      }
    } catch (error) {
      if (isMounted.current) {
        setError(error.message);
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [tenantToken, tenantSlug]);

  // Fetch data on mount and when pagination changes
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchData(pagination.currentPage, pagination.pageSize);
    }
  }, [tenantToken, tenantSlug, pagination.currentPage, pagination.pageSize, fetchData]);

  const handleEditClick = useCallback((notification) => {
    setSelectedNotification(notification);
    setShow(true);
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
    setSelectedNotification(null);
    // Don't fetch here - let useEffect handle it
  }, []);

  const handlePublish = useCallback(async (notificationId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/notification/toggle-publish/${notificationId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setPopup({
        message: "Notification published successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
      
      // Refresh data
      fetchData(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error("Error publishing notification:", error);
      setPopup({
        message: "Failed to publish notification!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDelete = useCallback(async (notificationId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/notification/delete/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((notification) => notification.id !== notificationId)
      );
      
      setPopup({
        message: "Notification deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
      
      // Refresh data
      fetchData(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting notification:", error);
      setPopup({
        message: "Failed to delete notification!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, fetchData, pagination.currentPage, pagination.pageSize]);

  const handlePublishButton = useCallback((notificationId) => {
    setPublishPopup({
      isVisible: true,
      notificationId,
    });
  }, []);

  const confirmPublish = useCallback(() => {
    const { notificationId } = publishPopup;
    handlePublish(notificationId);
    setPublishPopup({ isVisible: false, notificationId: null });
  }, [publishPopup, handlePublish]);

  const handleDeleteButton = useCallback((notificationId) => {
    setDeletePopup({
      isVisible: true,
      notificationId,
    });
  }, []);

  const confirmDelete = useCallback(() => {
    const { notificationId } = deletePopup;
    handleDelete(notificationId);
    setDeletePopup({ isVisible: false, notificationId: null });
  }, [deletePopup, handleDelete]);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(pagination.currentPage, pagination.pageSize);
  }, [fetchData, pagination.currentPage, pagination.pageSize]);

  // Memoized columns
  const columns = useMemo(() => [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Name",
      accessor: "name",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Description",
      accessor: "description",
      sort: true,
      Cell: ({ value }) =>
        value ? value : "",
    },
    {
      Header: "Status",
      accessor: "publish",
      sort: true,
      Cell: ({ value }) => (
        <span style={{ 
          color: value === "yes" ? "#28a745" : "#dc3545",
          fontWeight: "bold"
        }}>
          {value === "yes" ? "Published" : "Draft"}
        </span>
      ),
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
          {row.original.publish === "no" && (
            <Button
              size="sm"
              variant="success"
              className="me-2"
              onClick={(e) => {
                e.preventDefault();
                handlePublishButton(row.original.id);
              }}
              style={{
                backgroundColor: primary,
                borderColor: primary,
                color: "#fff",
              }}
              title="Publish Notification"
            >
              <i className="mdi mdi-send me-1"></i>
              Publish
            </Button>
          )}
          
          <Link
            to="#"
            className="action-icon"
            onClick={(e) => {
              e.preventDefault();
              handleEditClick(row.original);
            }}
            style={{ marginRight: "10px" }}
            title="Edit Notification"
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
            title="Delete Notification"
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </div>
      ),
    },
  ], [handleEditClick, handleDeleteButton, handlePublishButton, formatDateTime, primary]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          {
            label: "Notifications",
            path: "/settings/notifications",
            active: true,
          },
        ]}
        title="Notifications"
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
                      setSelectedNotification(null);
                    }}
                    style={{
                      backgroundColor: primary,
                      borderColor: primary,
                      color: "#fff",
                    }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add Notification
                  </Button>
                </Col>
                <Col sm={8} className="text-end">
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
                  <p className="mt-2">Loading notifications...</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Processing...</span>
                  </Spinner>
                  <p className="mt-2">Please wait...</p>
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
                  getRowProps={(row) => ({
                    style: {
                      backgroundColor:
                        row.original.publish === "yes"
                          ? `${secondary}40` // Add transparency
                          : "inherit",
                    },
                  })}
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
        </Col>
      </Row>

      <CreateNotificationModal
        show={show}
        onHide={handleClose}
        notification={selectedNotification}
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
          message="Are you sure you want to delete this notification?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, notificationId: null })}
          buttonLabel="Yes, Delete"
          onAction={confirmDelete}
        />
      )}

      {publishPopup.isVisible && (
        <Popup
          message="Are you sure you want to publish this notification? It will be sent to all users."
          type="confirm"
          onClose={() => setPublishPopup({ isVisible: false, notificationId: null })}
          buttonLabel="Yes, Publish"
          onAction={confirmPublish}
        />
      )}
    </>
  );
};

export default Notification;