import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Modal, Form, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageTitle from "../../../components/PageTitle";
import UsersRegistrationModal from "./UsersRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { useLogoColor } from "../../../context/LogoColorContext";

const Personal = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlugg = user?.tenant;

  const { colour: primary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    myUserID: null,
  });

  // Email functionality states
  const [emailModal, setEmailModal] = useState(false);
  const [selectedEmailUser, setSelectedEmailUser] = useState(null);
  const [emailContent, setEmailContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Sent emails functionality states
  const [sentEmailsModal, setSentEmailsModal] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  const [loadingSentEmails, setLoadingSentEmails] = useState(false);
  const [sentEmailsError, setSentEmailsError] = useState(null);

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
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(isoString).toLocaleDateString("en-US", options);
  }, []);

  const formatDateShort = useCallback((isoString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(isoString).toLocaleDateString("en-US", options);
  }, []);

  const fetchData = useCallback(async (page = 1, pageSize = 10) => {
    // Prevent duplicate fetches
    if (isFetching.current || !tenantToken || !tenantSlugg) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/view-users?page=${page}&per_page=${pageSize}`,
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
      
      // Only update state if component is still mounted
      if (isMounted.current && result && Array.isArray(result.data?.data)) {
        const sortedData = [...result.data.data].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        
        // Batch state updates
        setData(sortedData);
        setPagination({
          currentPage: result.data.current_page,
          totalPages: result.data.last_page,
          nextPageUrl: result.data.next_page_url,
          prevPageUrl: result.data.prev_page_url,
          pageSize: pageSize,
        });
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (isMounted.current) {
        setError(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [tenantToken, tenantSlugg]);

  const fetchSentEmails = useCallback(async () => {
    if (!tenantToken || !tenantSlugg) return;
    
    setLoadingSentEmails(true);
    setSentEmailsError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/sent-emails`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sent emails! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (isMounted.current && result && Array.isArray(result.data)) {
        const sortedEmails = [...result.data].sort(
          (a, b) => new Date(b.sent_at || b.created_at) - new Date(a.sent_at || a.created_at)
        );
        setSentEmails(sortedEmails);
      } else if (isMounted.current) {
        throw new Error("Invalid response format for sent emails");
      }
    } catch (error) {
      if (isMounted.current) {
        setSentEmailsError(error.message);
        toast.error("Failed to load sent emails!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      if (isMounted.current) {
        setLoadingSentEmails(false);
      }
    }
  }, [tenantToken, tenantSlugg]);

  // Initial fetch and pagination changes
  useEffect(() => {
    if (tenantToken && tenantSlugg) {
      fetchData(pagination.currentPage, pagination.pageSize);
    }
  }, [tenantToken, tenantSlugg, pagination.currentPage, pagination.pageSize, fetchData]);

  const handleEditClick = useCallback((myUser) => {
    setSelectedUser(myUser);
    setShow(true);
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
    setSelectedUser(null);
    fetchData(pagination.currentPage, pagination.pageSize);
  }, [fetchData, pagination.currentPage, pagination.pageSize]);

  // Email handler functions
  const handleEmailClick = useCallback((myUser) => {
    setSelectedEmailUser(myUser);
    setEmailModal(true);
    setEmailContent("");
    setEmailSubject("");
    setAttachments([]);
  }, []);

  const handleEmailClose = useCallback(() => {
    setEmailModal(false);
    setSelectedEmailUser(null);
    setEmailContent("");
    setEmailSubject("");
    setAttachments([]);
  }, []);

  const handleAttachmentChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  }, []);

  const handleSendEmail = useCallback(async () => {
    if (!selectedEmailUser || !emailContent || !emailSubject) {
      toast.error("Please fill all required fields!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = attachments.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error("Some files exceed the 10MB size limit!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      const formData = new FormData();
      formData.append("user_id", selectedEmailUser.id);
      formData.append("content", emailContent);
      formData.append("subject", emailSubject);
      
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/sendmessage`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send email! Status: ${response.status}`);
      }

      const result = await response.json();
      
      toast.success("Email sent successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      handleEmailClose();
    } catch (error) {
      console.error("Email sending error:", error);
      
      toast.error(error.message || "Failed to send email. Please try again!", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSendingEmail(false);
    }
  }, [selectedEmailUser, emailContent, emailSubject, attachments, tenantToken, tenantSlugg, handleEmailClose]);

  // Sent emails handler functions
  const handleViewSentEmails = useCallback(() => {
    setSentEmailsModal(true);
    fetchSentEmails();
  }, [fetchSentEmails]);

  const handleCloseSentEmails = useCallback(() => {
    setSentEmailsModal(false);
    setSentEmails([]);
    setSentEmailsError(null);
  }, []);

  const handleDelete = useCallback(async (myUserID) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/delete-user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myUserID }),
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((myUser) => myUser.id !== myUserID)
      );
      
      setPopup({
        message: "User deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
      
      fetchData(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      setPopup({
        message: "Failed to delete user!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlugg, fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDeleteButton = useCallback((myUserID) => {
    setDeletePopup({
      isVisible: true,
      myUserID,
    });
  }, []);

  const confirmDelete = useCallback(() => {
    const { myUserID } = deletePopup;
    handleDelete(myUserID);
    setDeletePopup({ isVisible: false, myUserID: null });
  }, [deletePopup, handleDelete]);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  // Columns for users table - memoized to prevent unnecessary re-renders
  const columns = React.useMemo(() => [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "First Name",
      accessor: "first_name",
      sort: true,
      Cell: ({ value }) =>
        value
          ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          : "",
    },
    {
      Header: "Last Name",
      accessor: "last_name",
      sort: true,
      Cell: ({ value }) =>
        value
          ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          : "",
    },
    {
      Header: "Email",
      accessor: "email",
      sort: true,
      Cell: ({ value }) => (value ? value.toLowerCase() : ""),
    },
    {
      Header: "Phone",
      accessor: "phone",
      sort: true,
      Cell: ({ value }) =>
        value
          ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          : "",
    },
    {
      Header: "User type",
      accessor: "user_type.user_type",
      sort: true,
      Cell: ({ value }) =>
        value
          ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          : "",
    },
    {
      Header: "Created On",
      accessor: "created_at",
      sort: true,
      Cell: ({ row }) => formatDateTime(row.original.created_at),
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
            onClick={() => handleEditClick(row.original)}
            style={{ marginRight: "10px" }}
            title="Edit User"
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon"
            onClick={() => handleEmailClick(row.original)}
            style={{ marginRight: "10px" }}
            title="Send Email"
          >
            <i className="mdi mdi-email-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon text-danger"
            onClick={() => handleDeleteButton(row.original.id)}
            title="Delete User"
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </div>
      ),
    },
  ], [handleEditClick, handleEmailClick, handleDeleteButton, formatDateTime]);

  // Columns for sent emails table - memoized
  const sentEmailColumns = React.useMemo(() => [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Recipient",
      accessor: "recipient_name",
      sort: true,
      Cell: ({ row }) => (
        <div>
          <div className="fw-medium">{row.original.recipient_name}</div>
          <small className="text-muted">{row.original.recipient_email}</small>
        </div>
      ),
    },
    {
      Header: "Subject",
      accessor: "subject",
      sort: true,
      Cell: ({ value }) => (
        <div className="text-truncate" style={{ maxWidth: "200px" }} title={value}>
          {value}
        </div>
      ),
    },
    {
      Header: "Attachments",
      accessor: "attachments_count",
      sort: true,
      Cell: ({ value }) => (
        <Badge bg={value > 0 ? "primary" : "secondary"}>
          {value} {value === 1 ? 'file' : 'files'}
        </Badge>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      sort: true,
      Cell: ({ value }) => (
        <Badge bg={value === 'sent' ? 'success' : value === 'failed' ? 'danger' : 'warning'}>
          {value}
        </Badge>
      ),
    },
    {
      Header: "Sent At",
      accessor: "sent_at",
      sort: true,
      Cell: ({ row }) => formatDateShort(row.original.sent_at || row.original.created_at),
    },
    {
      Header: "Actions",
      accessor: "actions",
      sort: false,
      Cell: ({ row }) => (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => {
            toast.info(`Subject: ${row.original.subject}`, {
              position: "top-right",
              autoClose: 3000,
            });
          }}
        >
          View Details
        </Button>
      ),
    },
  ], [formatDateShort]);

  return (
    <>
      <PageTitle title="Users" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={6}>
                  <div className="d-flex gap-2">
                    <Button
                      variant="danger"
                      className="waves-effect waves-light"
                      onClick={() => {
                        setShow(true);
                        setSelectedUser(null);
                      }}
                      style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
                    >
                      <i className="mdi mdi-plus-circle me-1"></i> Add a User
                    </Button>
                    
                    <Button
                      variant="outline-primary"
                      className="waves-effect waves-light"
                      onClick={handleViewSentEmails}
                      style={{ backgroundColor: "#fff", borderColor: primary, color: primary }}
                    >
                      <i className="mdi mdi-email-send-outline me-1"></i> View All Sent Emails
                    </Button>
                  </div>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>{" "}
                  Loading Users...
                </div>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <UsersRegistrationModal
        show={show}
        onHide={handleClose}
        myUser={selectedUser}
        onSubmit={fetchData}
      />

      {/* Email Modal */}
      <Modal show={emailModal} onHide={handleEmailClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Send Email to {selectedEmailUser?.first_name} {selectedEmailUser?.last_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="subject">
              <Form.Label>Subject *</Form.Label>
              <Form.Control
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="content">
              <Form.Label>Content *</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Enter email content"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="attachments">
              <Form.Label>Attachments (Max 10MB per file)</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleAttachmentChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <Form.Text className="text-muted">
                You can select multiple files (PDF, Word, Excel, Images)
              </Form.Text>
              {attachments.length > 0 && (
                <div className="mt-2">
                  <small>Selected files:</small>
                  <ul className="list-unstyled">
                    {attachments.map((file, index) => (
                      <li key={index} className="text-muted">
                        <i className="mdi mdi-file-outline me-1"></i>
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEmailClose} disabled={isSendingEmail}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            style={{ backgroundColor: primary, borderColor: primary }}
          >
            {isSendingEmail ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Sending...
              </>
            ) : (
              "Send Email"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sent Emails Modal */}
      <Modal show={sentEmailsModal} onHide={handleCloseSentEmails} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="mdi mdi-email-send-outline me-2"></i>
            Sent Emails History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingSentEmails ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading sent emails...</p>
            </div>
          ) : sentEmailsError ? (
            <div className="alert alert-danger">
              <i className="mdi mdi-alert-circle-outline me-2"></i>
              {sentEmailsError}
            </div>
          ) : sentEmails.length === 0 ? (
            <div className="text-center py-5">
              <i className="mdi mdi-email-remove-outline text-muted" style={{ fontSize: "48px" }}></i>
              <h5 className="mt-3">No Sent Emails Found</h5>
              <p className="text-muted">No emails have been sent yet.</p>
            </div>
          ) : (
            <Table2
              columns={sentEmailColumns}
              data={sentEmails}
              pageSize={10}
              isSortable
              pagination
              isSearchable
              tableClass="table-striped dt-responsive nowrap w-100"
              searchBoxClass="my-2"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSentEmails}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={fetchSentEmails}
            disabled={loadingSentEmails}
          >
            {loadingSentEmails ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Refreshing...
              </>
            ) : (
              <>
                <i className="mdi mdi-refresh me-1"></i>
                Refresh
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

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
          message="Are you sure you want to delete this user?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, myUserID: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default Personal;