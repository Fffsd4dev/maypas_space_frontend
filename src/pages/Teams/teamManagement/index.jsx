import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import classNames from "classnames";
import { useAuthContext } from "@/context/useAuthContext";
import { useSearchParams } from "react-router-dom";
import Popup from "../../components/Popup/Popup";
import axios from "axios";

// components
import PageTitle from "../../components/PageTitle";
import Table2 from "../../components/Table2";
import AddSubscription from "./AddSubscription";

// dummy data
// import { subscriptions } from "./data";

/* name column render */
const NameColumn = ({ row }) => {
  return (
    <div className="table-user">
      <img src={row.original.avatar} alt="" className="me-2 rounded-circle" />
      <Link to="#" className="text-body fw-semibold">
        {row.original.name}
      </Link>
    </div>
  );
};

/* status column render */
const StatusColumn = ({ row }) => {
  return (
    <React.Fragment>
      <span
        className={classNames("badge", {
          "badge-soft-success": row.original.status === "Active",
          "badge-soft-danger": row.original.status === "Blocked",
        })}
      >
        {row.original.status}
      </span>
    </React.Fragment>
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
          e.stopPropagation();
          onUpdate(row.original.id)}
        }
      >
        {" "}
        <i className="mdi mdi-square-edit-outline"></i>
      </Link>
      <Link
        to="#"
        className="action-icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(row.original.id);
        }}
      >
        {" "}
        <i className="mdi mdi-delete"></i>
      </Link>
    </React.Fragment>
  );
};



const CreateSubscription = () => {
  const styles = {
    input: {
      width: "75%",
      padding: "10px",
      marginTop: "5px",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
  };
  const [show, setShow] = useState(false);
  const onCloseModal = () => setShow(false);
  const onOpenModal = () => setShow(true);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUser = () => {
    const redirectLink = searchParams.get("redirectTo");
    if (redirectLink) navigate(redirectLink);
    else navigate("/CreateSubscription");
  };

  const [loading, setLoading] = useState(false);

  const { user } = useAuthContext();
  const token = user?.token;

  /*
            handle form submission
            */

  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    id: null,
  });
  const [rowLoading, setRowLoading] = useState(null); // State for row loading
  const [queryPopup, setQueryPopup] = useState({
    isVisible: false,
    id: null,
    name: "",
    price: "",
    duration: "",
    errorMessage: "", // To display error message if required field is empty
  });

  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
    pageSize: 5,
  });

  const fetchSubscriptions = async (page = 1, pageSize = 5) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-plans?page=${page}&per_page=${pageSize}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response);
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : response.data?.data?.subscriptions || [];

      // Sort by updated_at and created_at (latest first)
      data.sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at) -
          new Date(a.updated_at || a.created_at)
      );
      setSubscriptions(data);
      setPagination({
        currentPage: response.data.current_page,
        totalPages: response.data.last_page,
        nextPageUrl: response.data.next_page_url,
        prevPageUrl: response.data.prev_page_url,
        pageSize: pageSize,
      });
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

    
  // give page size
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
    value: subscriptions.length,
  },
];

  // Call fetchSubscriptions inside useEffect
  useEffect(() => {
    fetchSubscriptions(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage, pagination.pageSize]);

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
    setDeleteLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/delete-plan`,
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove deleted plan from state
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
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
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    setUpdateLoading(true);
    const { id, name, price, duration } = queryPopup;

    // Validation check
    if (
      !name.trim() ||
      isNaN(price) ||
      price <= 0 ||
      isNaN(duration) ||
      duration <= 0
    ) {
      setQueryPopup((prev) => ({
        ...prev,
        errorMessage: "All fields must be valid and non-empty.",
      }));
      setUpdateLoading(false);
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/update-plan/${id}`,
        { name, price, duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show success message
      setPopup({
        message: "Subscription updated successfully!",
        type: "success",
        isVisible: true,
      });

      // Close popup and reset form fields
      setQueryPopup({
        isVisible: false,
        id: null,
        name: "",
        price: "",
        duration: "",
        errorMessage: "",
      });

      // Refresh subscriptions
      fetchSubscriptions(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      setQueryPopup({
        isVisible: false,
        id: null,
        name: "",
        price: "",
        duration: "",
        errorMessage: "",
      });
      setPopup({
        message: "Update failed. Please try again.",
        type: "error",
        isVisible: true,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateClick = (id) => {
    const subscription = subscriptions.find((sub) => sub.id === id);

    if (subscription) {
      setQueryPopup({
        isVisible: true,
        id: subscription.id,
        name: subscription.name,
        price: subscription.price,
        duration: subscription.duration,
        errorMessage: "", // Reset error message
      });
    }
  };

  const handleRowClick = async (id) => {
    setRowLoading(id); // Set the row loading state
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-plan/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched Subscription Plan details:", result);

      const newWindow = window.open(`/plan-details/${id}`, "_blank");
      if (newWindow) {
        newWindow.onload = () => {
          newWindow.plan = result.data;
        };
      } else {
        console.error(
          "Failed to open new window. It might be blocked by the browser."
        );
      }
    } catch (error) {
      console.error("Error fetching Subscription Plan details:", error);
    } finally {
      setRowLoading(null); // Reset the row loading state
    }
  };

  // columns to render
  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Subscription Name",
      accessor: "name",
      sort: true,
      classes: "table-user",
    },
    {
      Header: "Price",
      accessor: "price",
      sort: true,
    },
    {
      Header: "Duration",
      accessor: "duration",
      sort: true,
    },
    {
      Header: "Created At",
      accessor: "created_at",
      sort: true,
      Cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      Header: "Updated At",
      accessor: "updated_at",
      sort: true,
      Cell: ({ row }) => formatDateTime(row.original.updated_at),
    },

    {
      Header: "Action",
      accessor: "action",
      sort: false,
      Cell: ({ row }) => (
        <ActionColumn
          row={row}
          onDelete={handleDeleteButton}
          onUpdate={handleUpdateClick}
        />
      ),
    },
  ];

  const onSubmit = async (data) => {
    console.log("submitting");
    console.log(data);
    try {
      console.log(token);
      setLoading(true);
      
        const payload = {
          name: data.name,
          price: data.price,
          duration: data.duration,
        };
  
        const res = await axios.post (
          `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/create-plan`, payload,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            
          }
        );

      const result = res;
      console.log(res);
      console.log(result);


      if (res.status === 201 || res.status === 200) {
        console.log(res.ok);

        setPopup({
          message: "Plan Created successfully!",
          type: "success",
          isVisible: true,
          buttonLabel: "",
          buttonRoute: "/CreateSubscription",
        });

        redirectUser();
        // Refresh subscriptions table
        fetchSubscriptions(pagination.currentPage, pagination.pageSize);
      } else {
        console.error("Creating a Subscription Plan Failed:", res);
        const errorMessages = result?.data?.message;

        setPopup({
          message: `Creating a Subscription Plan Failed: ${JSON.stringify(errorMessages)}`,
          type: "error",
          isVisible: true,
          buttonLabel: "Retry",
          buttonRoute: `/CreateSubscription`,
        });
      }
    } catch (e) {
      console.error("Error during creating Subscription Plan:", e);
      setPopup({
        message: "An error occurred. Please try again.",
        type: "error",
        isVisible: true,
        buttonLabel: "Retry",
        buttonRoute: `/CreateSubscription`,
      });
    } finally {
      setLoading(false);
    }
    onCloseModal();
  };

  return (
    <React.Fragment>
      <PageTitle
        breadCrumbItems={[
          {
            label: "Subscriptions",
            path: "/CreateSubscription",
          },
          {
            label: "Create Subscription Plan",
            path: "/CreateSubscription",
            active: true,
          },
        ]}
        title={"Subscription Plans"}
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row>
                <Col sm={4}>
                  <Button
                    variant="danger"
                    className="waves-effect waves-light"
                    onClick={onOpenModal}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a
                    Subscription Plan
                  </Button>
                </Col>

                <Col sm={8}></Col>
              </Row>

              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Loading Subscription plans...
                </>
              ) : (
                <Table2
                  columns={columns}
                  data={subscriptions}
                  pageSize={pagination.pageSize}
                  sizePerPageList={sizePerPageList}
                  isSortable
                  pagination
                  isSelectable={false}
                  isSearchable
                  tableClass="table-striped dt-responsive nowrap w-100"
                  searchBoxClass="my-2"
                  getRowProps={(row) => ({
                    style: { cursor: "pointer", 
                      opacity: rowLoading === row.original.id ? 0.4 : 1, // visually indicate loading

                      transition: "opacity 0.3s ease",
                      position: "relative",
                      display:
                        rowLoading === row.original.id ? "hidden" : "table-row",
                     },
                    onClick: () => handleRowClick(row.original.id),
                  })}
                  rowLoading={rowLoading} // Pass the row loading state
                  paginationProps={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    onPageChange: (page) => setPagination((prev) => ({ ...prev, currentPage: page })),
                    onPageSizeChange: (pageSize) => setPagination((prev) => ({ ...prev, pageSize })),
                  }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddSubscription
        show={show}
        onHide={onCloseModal}
        onSubmit={onSubmit}
        loading={loading}
        setLoading={setLoading}
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
          message="Are you sure you want to delete this application?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, id: null })}
          // buttonLabel="Yes"
          onAction={confirmDelete}
        >
          <button onClick={confirmDelete} className="btn btn-danger mt-2" disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Yes"}
          </button>
        </Popup>
      )}

      {queryPopup.isVisible && (
        <Popup
          message="Update Subscription Plan"
          type="input"
          onClose={() =>
            setQueryPopup({
              isVisible: false,
              id: null,
              name: "",
              price: "",
              duration: "",
              errorMessage: "",
            })
          }
        >
          <div>
            <label htmlFor="">PlanName: </label>
            <input
              style={styles.input}
              type="text"
              value={queryPopup.name}
              onChange={(e) =>
                setQueryPopup({ ...queryPopup, name: e.target.value })
              }
              placeholder="New Plan Name"
              required
            />
          </div>

          <div>
            <label htmlFor="">Price/fee: </label>
            <input
              style={styles.input}
              type="number"
              value={queryPopup.price}
              onChange={(e) =>
                setQueryPopup({ ...queryPopup, price: e.target.value })
              }
              placeholder="New Price"
              required
            />
          </div>

          <div>
            <label htmlFor="">Duration: </label>
            <input
              style={styles.input}
              type="number"
              value={queryPopup.duration}
              onChange={(e) =>
                setQueryPopup({ ...queryPopup, duration: e.target.value })
              }
              placeholder="Duration"
              required
            />
          </div>

          {queryPopup.errorMessage && (
            <span style={{ color: "red" }}>{queryPopup.errorMessage}</span>
          )}

          <div>
            <button onClick={handleUpdateSubmit} className="btn btn-primary mt-2" disabled={updateLoading}>
              {updateLoading ? "Updating..." : "Update Subscription"}
            </button>
          </div>
        </Popup>
      )}
    </React.Fragment>
  );
};

export default CreateSubscription;
