import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import LocationRegistrationModal from "./LocationRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";

const MyLocations = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const { tenantSlug } = useParams();
  const tenantSlugg = user?.tenant;

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
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/location/list-locations?page=${page}&per_page=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result && Array.isArray(result.data.data)) {
        const data = result.data.data;
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

  const handleEditClick = (myUser) => {
    setSelectedUser(myUser);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    fetchData(pagination.currentPage, pagination.pageSize); // Reload users after closing the modal
  };

  const handleDelete = async (myUserID) => {
    if (!user?.tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/location/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myUserID }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((myUser) => myUser.id !== myUserID)
      );
      setPopup({
        message: "Location deleted successfully!",
        type: "success",
        isVisible: true,
      });
      fetchData(pagination.currentPage, pagination.pageSize); // Reload users after deleting a user
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

  const handleDeleteButton = (myUserID) => {
    setDeletePopup({
      isVisible: true,
      myUserID,
    });
  };

  const confirmDelete = () => {
    const { myUserID } = deletePopup;
    handleDelete(myUserID);
    setDeletePopup({ isVisible: false, myUserID: null });
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
      Header: "State",
      accessor: "state",
      sort: true,
    },
    {
      Header: "Address",
      accessor: "address",
      sort: true,
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
  ];

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "My Locations", path: "/account/admin", active: true },
        ]}
        title="My Locations"
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
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a Location
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading locations...</p>
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
                    onPageChange: (page) => setPagination((prev) => ({ ...prev, currentPage: page })),
                    onPageSizeChange: (pageSize) => setPagination((prev) => ({ ...prev, pageSize })),
                  }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <LocationRegistrationModal
        show={show}
        onHide={handleClose}
        myUser={selectedUser}
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
          message="Are you sure you want to delete this location?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, myUserID: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default MyLocations;
