import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import RoomRegistrationModal from "./RoomRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";

const Rooms = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingFloor, setLoadingFloor] = useState(false);
  const [floorData, setFloorData] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const [isError, setIsError] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    myRoomID: null,
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

  const [formData, setFormData] = useState({
    name: "",
    location_id: "",
    floor_id: "",
  });

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
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setFormData((prev) => ({
      ...prev,
      location_id: locationId, // Update formData with the selected location ID
    }));
  };

  const fetchFloor = async (locationId) => {
    setLoadingFloor(true);
    console.log("loadingFloor...");
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/floor/list-floors/${locationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("result", result);
      if (result && Array.isArray(result.data.data)) {
        setFloorData(result.data.data); // Store floors in state
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message); // Replaced setErrorMessage with toast.error
    } finally {
      setLoadingFloor(false);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      fetchFloor(selectedLocation); // Fetch floors based on the selected location ID
    }
  }, [selectedLocation]);

  const fetchRoom = async (locationId, floorId, page = 1, pageSize = 10) => {
    setLoading(true);
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/space/list-spaces/${locationId}/${floorId}?page=${page}&per_page=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );
      console.log('response for api', response)

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("rooms:", result);
      if (result && Array.isArray(result)) {

        console.log("fff", result);

        const data = result;
        data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(data);
        setPagination({
          currentPage: result.current_page,
          totalPages: result.last_page,
          nextPageUrl: result.next_page_url,
          prevPageUrl: result.prev_page_url,
          pageSize: pageSize,
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message); // Replaced setErrorMessage with toast.error
      console.error(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenantToken) {
      fetchLocations();
    }
  }, [user?.tenantToken]);

  const handleFloorChange = (e) => {
    const floorId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      floor_id: floorId, // Update formData with the selected floor ID
      space_category_id: "", // Reset category when floor changes
    }));

    if (floorId && selectedLocation) {
      fetchRoom(selectedLocation, floorId, pagination.currentPage, pagination.pageSize); // Fetch rooms immediately after floor selection
    }
  };

  useEffect(() => {
    if (formData.floor_id && user?.tenantToken) {
      fetchRoom(selectedLocation, formData.floor_id, pagination.currentPage, pagination.pageSize);
    }
  }, [user?.tenantToken, selectedLocation, pagination.currentPage, pagination.pageSize]);

  const handleEditClick = (myRoom) => {
    setSelectedUser(myRoom);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);

    // Fetch rooms after closing the modal
    if (selectedLocation && formData.floor_id) {
      fetchRoom(selectedLocation, formData.floor_id, pagination.currentPage, pagination.pageSize);
    }
  };

  const handleDelete = async (myRoomID) => {
    if (!user?.tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myRoomID }),
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((myRoom) => myRoom.id !== myRoomID)
      );
      setPopup({
        message: "Room deleted successfully!",
        type: "success",
        isVisible: true,
      });
      if (formData.floor_id && selectedLocation) {
        fetchRoom(
          selectedLocation,
          pagination.currentPage,
          pagination.pageSize
        ); // Reload users after deleting a user
      }
    } catch (error) {
      toast.error("Failed to delete room!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteButton = (myRoomID) => {
    setDeletePopup({
      isVisible: true,
      myRoomID,
    });
  };

  const confirmDelete = () => {
    const { myRoomID } = deletePopup;
    handleDelete(myRoomID);
    setDeletePopup({ isVisible: false, myRoomID: null });
  };

  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Room Name",
      accessor: "space_name",
      sort: true,
    },
    {
      Header: "Space Number",
      accessor: "space_number",
      sort: true,
    },
    {
      Header: "Space Fee",
      accessor: "space_fee",
      sort: true,
    },
    {
      Header: "Category",
      accessor: "category.category",
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
          { label: "My Rooms", path: "/room/my-rooms", active: true },
        ]}
        title="My Rooms"
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
                    <i className="mdi mdi-plus-circle me-1"></i> Add a Room
                  </Button>
                </Col>
              </Row>

              <Card>
                <Card.Body style={{ background: "linear-gradient(to left,rgb(243, 233, 231),rgb(239, 234, 230))", marginTop: "30px" }}>
                  {loadingLocations ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>{" "}
                      Loading your locations...
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom: "10px", fontSize: "1rem" }}>
                        Select a location to view or update the room.
                      </p>
                      <Form.Select
                        style={{ marginBottom: "25px", fontSize: "1rem" }}
                        value={selectedLocation || ""}
                        onChange={handleLocationChange}
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
                  )}

                  {selectedLocation && (
                    <Form.Group className="mb-3" controlId="location_id">
                      {loadingFloor ? (
                        <div className="text-center">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading floors/sections...</span>
                          </Spinner>
                        </div>
                      ) : (
                        <>
                          <Form.Label>
                            Select the Floor of the room you want to view.
                          </Form.Label>
                          <Form.Select
                            name="floor_id"
                            value={formData.floor_id}
                            onChange={handleFloorChange}
                            required
                          >
                            <option value="">Select a Floor/Section</option>
                            {Array.isArray(floorData) &&
                              floorData.map((floor) => (
                                <option key={floor.id} value={floor.id}>
                                  {floor.name}
                                </option>
                              ))}
                          </Form.Select>
                        </>
                      )}
                    </Form.Group>
                  )}

                  {formData.floor_id && (
                    <>
                      {loading ? (
                        <p>Loading rooms...</p>
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
                            onPageChange: (page) =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: page,
                              })),
                            onPageSizeChange: (pageSize) =>
                              setPagination((prev) => ({ ...prev, pageSize })),
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

      <RoomRegistrationModal
        show={show}
        onHide={handleClose}
        myRoom={selectedUser}
        onSubmit={() => {
          if (selectedLocation && formData.floor_id) {
            fetchRoom(selectedLocation, formData.floor_id, pagination.currentPage, pagination.pageSize);
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
          message="Are you sure you want to delete this room?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, myRoomID: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default Rooms;
