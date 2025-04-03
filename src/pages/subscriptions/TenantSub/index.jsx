import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import classNames from "classnames";
import axios from "axios";

// components
import PageTitle from "../../../components/PageTitle";
import Table2 from "../../../components/Table2";
import SubscribeTenantForm from './SubscribeTenantForm';
import { useAuthContext } from '@/context/useAuthContext.jsx';
import Popup from "../../../components/Popup/Popup";

// Fetch data function
export const fetchData = async (token, setData, setLoading, setError, page, setPagination) => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-subscriptions?page=${page}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Parsed response data:', result);

    if (result?.data?.data && Array.isArray(result.data.data)) {
      // Sort by updated_at and created_at (latest first)
      const data = result.data.data;
      data.sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at) -
          new Date(a.updated_at || a.created_at)
      );
      setData(data); // Ensure data is an array
      setPagination({
        currentPage: result.data.current_page,
        totalPages: result.data.last_page,
        nextPageUrl: result.data.next_page_url,
        prevPageUrl: result.data.prev_page_url,
      });
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error fetching Subscription Plans:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

/* name column render */
const NameColumn = ({ row }) => {
  return (
    <div className="table-user">
      <img src={row.original.avatar || "default-avatar.png"} alt="" className="me-2 rounded-circle" />
      <Link to="#" className="text-body fw-semibold">{row.original.name}</Link>
    </div>
  );
};

/* status column render */
const StatusColumn = ({ row }) => {
  return (
    <span className={classNames("badge", {
      "bg-soft-success text-success": row.original.status === "active",
      "bg-soft-danger text-danger": row.original.status === "Blocked"
    })}>
      {row.original.status}
    </span>
  );
};

/* action column render */
const ActionColumn = ({ row, onDelete, onUpdate }) => {
  return (
    <React.Fragment>
      <Link
        to="#"
        className="action-icon"
        onClick={(e) => {
          e.stopPropagation(); // Stop event propagation
          onDelete(row.original.id);
        }}
      >
        {" "}
        <i className="mdi mdi-delete"></i>
      </Link>
    </React.Fragment>
  );
};

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

// Main component
const TenantSub = () => {
  const { user } = useAuthContext(); // Get the auth token from context
  const navigate = useNavigate();
  console.log("Auth Token:", user?.token);
  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowLoading, setRowLoading] = useState(null); // State for row loading
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
  });
  const token = user?.token;

  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    id: null,
  });

  const sizePerPageList = [
    {
      text: "5",
      value: 5,
    },
    {
      text: "10",
      value: 10,
    },
    {
      text: "15",
      value: 15,
    },
    {
      text: "25",
      value: 25,
    },
    {
      text: "All",
      value: data.length,
    },
  ];

  useEffect(() => {
    if (!user?.token) return;
    fetchData(user.token, setData, setLoading, setError, pagination.currentPage, setPagination);
  }, [user, pagination.currentPage]);

  const confirmDelete = () => {
    const { id } = deletePopup;
    handleDelete(id);
    setDeletePopup({ isVisible: false, id: null });
  };

  const handleDeleteButton = (id) => {
    setDeletePopup({
      isVisible: true,
      id,
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/delete-subscription`,
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove deleted plan from state
      setData((prev) => prev.filter((sub) => sub.id !== id));
      setPopup({
        message: "Plan deleted successfully!",
        type: "success",
        isVisible: true,
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      setPopup({
        message: "Failed to delete plan!",
        type: "error",
        isVisible: true,
      });
    }
  };

  const handleRowClick = async (id) => {
    setRowLoading(id); // Set the row loading state
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-subscription/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fetched subscription details:', result);
      
      const newWindow = window.open(`/subscription-details/${id}`, '_blank');
      if (newWindow) {
        newWindow.onload = () => {
          newWindow.subscription = result.data;
        };
      } else {
        console.error("Failed to open new window. It might be blocked by the browser.");
      }
    } catch (error) {
      console.error("Error fetching subscription details:", error);
    } finally {
      setRowLoading(null); // Reset the row loading state
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
    { Header: "Subscribed Plan", accessor: "plan.name", sort: true },
    { Header: "Price", accessor: "plan.price", sort: true },
    { Header: "Duration (months)", accessor: "plan.duration", sort: true },
    { Header: "Status", accessor: "status", sort: true, Cell: StatusColumn },
    { Header: "Updated At", accessor: "updated_at", sort: true, Cell: ({ row }) => formatDateTime(row.original.updated_at) },
    { Header: "Subscription Ends At", accessor: "ends_at", sort: true, Cell: ({ row }) => formatDateTime(row.original.ends_at) },
    {
      Header: "Action",
      accessor: "action",
      sort: false,
      Cell: ({ row }) => (
        <ActionColumn
          row={row}
          onDelete={handleDeleteButton}
        />
      ),
    },
  ];

  return (
    <>
      <PageTitle breadCrumbItems={[{ label: "Subcribe a Tenant", path: "/TenantSub", active: true }]} title="Submit Tenant Plan" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <Button variant="danger" className="waves-effect waves-light" onClick={() => setShow(true)}>
                    <i className="mdi mdi-plus-circle me-1"></i> Subcribe a Tenant(Workspace)
                  </Button>
                </Col>
                <Col sm={8}>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <>
                <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />{" "}
 Loading Tenant Plans...      </>
               
              ) : (
                <>
                  <Table2
                    columns={columns}
                    data={data}
                    pageSize={5}
                    isSortable
                    pagination
                    isSelectable={false}
                    isSearchable
                    sizePerPageList={sizePerPageList}
                    tableClass="table-wrap table-striped"
                    searchBoxClass="my-2"
                    getRowProps={(row) => ({
                      style: { cursor: 'pointer' },
                      onClick: () => handleRowClick(row.original.id)
                    })}
                    rowLoading={rowLoading} // Pass the row loading state
                  />
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <SubscribeTenantForm show={show} onHide={() => setShow(false)} onSubmit={() => setShow(false)} />
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
          message="Are you sure you want to delete this application?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, id: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default TenantSub;






