import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import classNames from "classnames";
import { useAuthContext } from "@/context/useAuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Popup from "../../../components/Popup/Popup";
import axios from "axios";

// components
import PageTitle from "../../../components/PageTitle";
import Table from "../../../components/Table";
import AddSubscription from "./AddSubscription";

// dummy data
import { subscriptions } from "./data";

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

/* last order column render */
// const LastOrderColumn = ({
//   row
// }) => {
//   return <>
//       {row.original.last_order.date}{" "}
//       <small className="text-muted">{row.original.last_order.time}</small>
//     </>;
// };

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
      {/* <Link to="#" className="action-icon">
        {" "}
        <i className="mdi mdi-eye"></i>
      </Link> */}
      <Link
        to="#"
        className="action-icon"
        onClick={() => onUpdate(row.original.id)}
      >
        {" "}
        <i className="mdi mdi-square-edit-outline"></i>
      </Link>
      <Link
        to="#"
        className="action-icon"
        onClick={() => onDelete(row.original.id)}
      >
        {" "}
        <i className="mdi mdi-delete"></i>
      </Link>
    </React.Fragment>
  );
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

const CreateSubscription = () => {
  const styles = {
    input: {
      width: "100%",
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

  const [queryPopup, setQueryPopup] = useState({
    isVisible: false,
    id: null,
    name: "",
    price: "",
    duration: "",
    errorMessage: "", // To display error message if required field is empty
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

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-plans`,
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
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchSubscriptions inside useEffect
  useEffect(() => {
    fetchSubscriptions();
  }, []);
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
    // if (!window.confirm("Are you sure you want to delete this plan?")) return;
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
    }
  };

  const handleUpdateSubmit = async () => {
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
      return;
    }

    try {
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/system-admin/update-plan/${id}`,
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
      fetchSubscriptions();
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
    }
  };

  const handleUpdateClick = (id) => {
    setQueryPopup({
      isVisible: true,
      id: id,
      name: "",
      price: "",
      duration: "",
      errorMessage: "", // Reset error message
    });
  };

  // columns to render
  const columns = [
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
    //  {
    //   Header: "Status",
    //   accessor: "status",
    //   sort: true,
    //   Cell: StatusColumn
    // },

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
      // WILL EDIT HERE
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/create-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      console.log(res);

      const result = await res.json();

      console.log(result);
      if (res.ok) {
        console.log(res.ok);

        // saveSession({ ...(result ?? {}), token: result.token });

        // saveSession({
        //   ...(res.data ?? {}),
        //   token: res.data.token
        // });

        setPopup({
          message: "Plan Created successful!",
          type: "success",
          isVisible: true,
          buttonLabel: "",
          buttonRoute: "/CreateSubscription",
        });

        redirectUser();
        // Refresh subscriptions table
        fetchSubscriptions();
      } else {
        console.error("Login Failed:", res);
        const errorMessages = result.message;
        setPopup({
          message: `Creating a Subcription Plan Failed: ${errorMessages}`,
          type: "error",
          isVisible: true,
          buttonLabel: "Retry",
          buttonRoute: `/CreateSubscription`,
        });
      }
    } catch (e) {
      console.error("Error during Login:", e);
      setPopup({
        message: "An error occurred. Please try again.",
        type: "error",
        isVisible: true,
        buttonLabel: "Retry",
        buttonRoute: `/CreateSubscription`,
      });

      if (e.response?.data?.error) {
        control.setError("email", {
          type: "custom",
          message: e.response?.data?.error,
        });
        control.setError("password", {
          type: "custom",
          message: e.response?.data?.error,
        });
      }
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

                <Col sm={8}>
                  {/* <div className="text-sm-end">
                      <Button className="btn btn-success mb-2 me-1">
                        <i className="mdi mdi-cog-outline"></i>
                      </Button>
  
                      <Button className="btn btn-light mb-2 me-1">Import</Button>
  
                      <Button className="btn btn-light mb-2">Export</Button>
                    </div> */}
                </Col>
              </Row>

              {isLoading ? (
                <p>Loading subscriptions...</p>
              ) : (
                <Table
                  columns={columns}
                  data={subscriptions}
                  pageSize={5}
                  sizePerPageList={sizePerPageList}
                  isSortable={true}
                  pagination={true}
                  isSelectable={false}
                  isSearchable={true}
                  tableClass="table-striped dt-responsive nowrap w-100"
                  searchBoxClass="my-2"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* add customer modal */}
      <AddSubscription
        show={show}
        onHide={onCloseModal}
        onSubmit={onSubmit}
        loading={loading}
        setLoading={setLoading}
      />

      {/* Render the Popup UI when it is visible */}
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
          {queryPopup.errorMessage && (
            <span style={{ color: "red" }}>{queryPopup.errorMessage}</span>
          )}

          <div>
            <button
              onClick={handleUpdateSubmit}
              className="btn btn-primary mt-2"
            >
              Update Subscription
            </button>
          </div>
        </Popup>
      )}
    </React.Fragment>
  );
};
export default CreateSubscription;
