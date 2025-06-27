import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import CreateNotificationModal from "./CreateNotificationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { useLogoColor } from "../../../context/LogoColorContext.jsx";

const Notification = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlugg = user?.tenant;
  const { colour: primary } = useLogoColor();

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
    myNotificationID: null,
  });

  const [publishPopup, setPublishPopup] = useState({
    isVisible: false,
    myNotifcationID: null,
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

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    console.log("Notification Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlugg}/notification/list-notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      console.log("Notification Response:", response);
      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Notification Result:", result);
      if (result && Array.isArray(result.data)) {
        const data = result.data;
        data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(data);
        setPagination({
          currentPage: result.data.current_page,
          totalPages: result.data.last_page,
          nextPageUrl: result.data.next_page_url,
          prevPageUrl: result.data.prev_page_url,
          pageSize: pageSize,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantToken) return;
    fetchData(pagination.currentPage, pagination.pageSize);
  }, [user, pagination.currentPage, pagination.pageSize]);

  const handleEditClick = (myNotification) => {
    setSelectedNotification(myNotification);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedNotification(null);
    fetchData(); // Reload users after closing the modal
  };

  const handlePublish = async (myNotifcationID) => {
    if (!user?.tenantToken) return;
    console.log(myNotifcationID);

    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlugg}/notification/toggle-publish/${myNotifcationID}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          // body: JSON.stringify({ id: myNotifcationID}),
        }
      );
      console.log("body", { id: myNotifcationID });

      console.log("Promote Response:", response);

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      setData((prevData) =>
        prevData.filter((myNotifcation) => myNotifcation.id !== myNotifcationID)
      );
      setPopup({
        message: "This notification has been published!",
        type: "success",
        isVisible: true,
      });
      if (user?.tenantToken) {
        fetchData(pagination.currentPage, pagination.pageSize); // Reload users after deleting a user
      }
    } catch (error) {
      console.error("Error promoting member:", error);
      setPopup({
        message: "Failed to publish this notification!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (myNotificationID) => {
    if (!user?.tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/delete-user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myNotificationID }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      setData((prevData) =>
        prevData.filter(
          (myNotification) => myNotification.id !== myNotificationID
        )
      );
      setPopup({
        message: "Plan deleted successfully!",
        type: "success",
        isVisible: true,
      });
      fetchData(); // Reload users after deleting a user
    } catch (error) {
      setPopup({
        message: "Failed to delete plan!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handlePublishButton = (myNotifcationID) => {
    setPublishPopup({
      isVisible: true,
      myNotifcationID,
    });
  };

  const confirmPublish = () => {
    const { myNotifcationID } = publishPopup;
    handlePublish(myNotifcationID);
    setPublishPopup({ isVisible: false, myNotifcationID: null });
  };

  const handleDeleteButton = (myNotificationID) => {
    setDeletePopup({
      isVisible: true,
      myNotificationID,
    });
  };

  const confirmDelete = () => {
    const { myNotificationID } = deletePopup;
    handleDelete(myNotificationID);
    setDeletePopup({ isVisible: false, myNotificationID: null });
  };

  const columns = [
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
    },
    {
      Header: "Description",
      accessor: "description",
      sort: true,
    },
    {
      Header: "Has Been Published?",
      accessor: "publish",
      sort: true,
    },
    ,
    // {
    //   Header: "Created On",
    //   accessor: "created_at",
    //   sort: true,
    //   Cell: ({ row }) => formatDateTime(row.original.created_at),
    // },
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
        <>
          {row.original.publish === "no" && ( // Only show the button if Manager is "no"
            <Button
              variant="danger"
              className="waves-effect waves-light"
              onClick={() => handlePublishButton(row.original.id)}
              style={{
                backgroundColor: primary,
                borderColor: primary,
                color: "#fff",
              }}
            >
              Publish Notification
            </Button>
          )}

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
  ];

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          {
            label: "Notifications",
            path: "/settings/create-notifications",
            active: true,
          },
        ]}
        title="Create Notifications"
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
                    <i className="mdi mdi-plus-circle me-1"></i> Add a New
                    Notification
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading Notifications...</p>
              ) : isLoading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">loading...</span>
                  </Spinner>{" "}
                  Please wait...
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
                        row.original.publish?.toString().toLowerCase() === "yes"
                          ? "#E8F5E9"
                          : "inherit",
                    },
                  })}
                  paginationProps={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    onPageChange: (page) =>
                      setPagination((prev) => ({ ...prev, currentPage: page })),
                    onPageSizeChange: (pageSize) =>
                      setPagination((prev) => ({ ...prev, pageSize })),
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
        myNotification={selectedNotification}
        onSubmit={fetchData} // Reload users after adding or editing a user
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
          onClose={() =>
            setDeletePopup({ isVisible: false, myNotificationID: null })
          }
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}

      {publishPopup.isVisible && (
        <Popup
          message="Are you sure you want to send this notification?"
          type="confirm"
          onClose={() =>
            setPublishPopup({ isVisible: false, myNotifcationID: null })
          }
          buttonLabel="Yes"
          onAction={confirmPublish}
        />
      )}
    </>
  );
};

export default Notification;
