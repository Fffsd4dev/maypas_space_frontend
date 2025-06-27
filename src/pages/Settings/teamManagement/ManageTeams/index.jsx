import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../../components/PageTitle";
import TeamsRegistrationModal from "./TeamRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../../components/Popup/Popup";
import Table2 from "../../../../components/Table2";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../../context/LogoColorContext";

const TeamManagement = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
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
  const [formData, setFormData] = useState({
    company: "",
    department: "",
    description: "",
    manager: "",
  });

  const [isError, setIsError] = useState(false);
  const [locations, setLocations] = useState([]);

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    myTeamsID: null,
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

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/location/list-locations`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        console.log("Location:", result.data.data);
        setLocations(result.data.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      toast.error(error.message);
      setIsError(true);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/teams`,
        // ?page=${page}&per_page=${pageSize}
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log(result);

      if (result && Array.isArray(result[1])) {
        const data = result[1];
        data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(data);
        // setPagination({
        //   currentPage: result.data.current_page,
        //   totalPages: result.data.last_page,
        //   nextPageUrl: result.data.next_page_url,
        //   prevPageUrl: result.data.prev_page_url,
        //   pageSize: pageSize,
        // });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenantToken) {
      fetchLocations();
    }
  }, [user?.tenantToken]);

  useEffect(() => {
    if (user?.tenantToken) {
      fetchData(pagination.currentPage, pagination.pageSize);
    }
  }, [user?.tenantToken, pagination.currentPage, pagination.pageSize]);

  const handleEditClick = (myTeams) => {
    setSelectedUser(myTeams);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    if (user?.tenantToken) {
      fetchData(pagination.currentPage, pagination.pageSize);
      // Reload users after closing the modal
    }
    setFormData({}); // Reset inputs after success
  };

  const handleDelete = async (myTeamsID) => {
    if (!user?.tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ team_id: myTeamsID }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      setData((prevData) =>
        prevData.filter((myTeams) => myTeams.id !== myTeamsID)
      );
      setPopup({
        message: "Team deleted successfully!",
        type: "success",
        isVisible: true,
      });
      if (user?.tenantToken) {
        fetchData(pagination.currentPage, pagination.pageSize);
        // Reload users after deleting a user
      }
    } catch (error) {
      toast.error("Failed to delete plan!");
      setPopup({
        message: "Failed to delete plan!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteButton = (myTeamsID) => {
    setDeletePopup({
      isVisible: true,
      myTeamsID,
    });
  };

  const confirmDelete = () => {
    const { myTeamsID } = deletePopup;
    handleDelete(myTeamsID);
    setDeletePopup({ isVisible: false, myTeamsID: null });
  };

  // const handleLocationChange = (e) => {
  //   const locationId = e.target.value;
  //   setSelectedLocation(locationId);
  //   setFormData((prev) => ({
  //     ...prev,
  //     location_id: locationId, // Update formData with the selected location ID
  //   }));
  // };
  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Company",
      accessor: "company",
      sort: true,
    },
    {
      Header: "Department",
      accessor: "department",
      sort: true,
      // Cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      Header: "Description",
      accessor: "description",
      sort: true,
      // Cell: ({ row }) => formatDateTime(row.original.updated_at),
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
          { label: "My Teams", path: "/settings/manage-teams", active: true },
        ]}
        title="My Teams"
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
                    style={{
                      backgroundColor: primary,
                      borderColor: primary,
                      color: "#fff",
                    }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a Team
                  </Button>
                </Col>
              </Row>

              <Card>
                <Card.Body
                  style={{
                    background:
                      "linear-gradient(to left,rgb(243, 233, 231),rgb(239, 234, 230))",
                    marginTop: "30px",
                  }}
                >
                  {/* {loadingLocations ? (
                                      <div className="text-center">
                                        <Spinner animation="border" role="status">
                                          <span className="visually-hidden">Loading...</span>
                                        </Spinner>{" "}
                                        Loading your locations...
                                      </div>
                                    ) : (
                                      <div>
                                        <p style={{marginBottom: "10px", fontSize: "1rem" }}>Select a location to view or update the floor.</p>
                                        <Form.Select
                                          style={{ marginBottom: "25px", fontSize: "1rem" }}
                                          value={selectedLocation || ""}
                                          onChange={handleLocationChange} // Use the new handler
                                          required
                                        >
                                          <option value="" disabled>
                                            Select a location
                                          </option>
                                          {locations.map((location) => (
                                            <option key={location.id} value={location.id}>
                                              {location.name} at {location.state}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      </div>
                                    )} */}

                  <>
                    {error ? (
                      <p className="text-danger">Error: {error}</p>
                    ) : loading ? (
                      <p>Loading Teams...</p>
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
                        isSearchable
                        tableClass="table-striped dt-responsive nowrap w-100"
                        searchBoxClass="my-2"
                        // paginationProps={{
                        //   currentPage: pagination.currentPage,
                        //   totalPages: pagination.totalPages,
                        //   onPageChange: (page) =>
                        //     setPagination((prev) => ({
                        //       ...prev,
                        //       currentPage: page,
                        //     })),
                        //   onPageSizeChange: (pageSize) =>
                        //     setPagination((prev) => ({ ...prev, pageSize })),
                        // }}
                      />
                    )}
                  </>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <TeamsRegistrationModal
        show={show}
        onHide={handleClose}
        myTeams={selectedUser}
        onSubmit={() => fetchData(pagination.currentPage, pagination.pageSize)} // Reload users after adding or editing a user
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
          message="Are you sure you want to delete this team?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, myTeamsID: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default TeamManagement;
