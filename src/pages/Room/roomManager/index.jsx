import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import RoomRegistrationModal from "./RoomRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";
import ChargesModal from "../../../components/ChargesModal";

const Rooms = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);
  const isFetchingLocations = useRef(false);
  const isFetchingFloors = useRef(false);

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingFloor, setLoadingFloor] = useState(false);
  const [floorData, setFloorData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
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
  const [selectedFloor, setSelectedFloor] = useState("");

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    roomId: null,
  });

  const [chargesModal, setChargesModal] = useState({
    isVisible: false,
    spaceId: null,
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

  const fetchFloors = useCallback(async (locationId) => {
    if (isFetchingFloors.current || !tenantToken || !tenantSlug || !locationId) return;
    
    isFetchingFloors.current = true;
    setLoadingFloor(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/list-floors/${locationId}?per_page=100`,
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
      
      if (isMounted.current && result?.data?.data) {
        setFloorData(result.data.data);
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoadingFloor(false);
      }
      isFetchingFloors.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchRooms = useCallback(async (locationId, floorId, page = 1, pageSize = 10) => {
    if (isFetching.current || !tenantToken || !tenantSlug || !locationId || !floorId) return;
    
    isFetching.current = true;
    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/list-spaces/${locationId}/${floorId}?page=${page}&per_page=${pageSize}`,
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
      
      if (isMounted.current && Array.isArray(result)) {
        const sortedData = [...result].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(sortedData);
        // Update pagination if available in response
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.current_page || 1,
            totalPages: result.pagination.last_page || 1,
            nextPageUrl: result.pagination.next_page_url || null,
            prevPageUrl: result.pagination.prev_page_url || null,
            pageSize: pageSize,
          });
        }
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
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

  // Fetch floors when location changes
  useEffect(() => {
    if (tenantToken && tenantSlug && selectedLocation) {
      fetchFloors(selectedLocation);
      // Reset floor selection when location changes
      setSelectedFloor("");
    }
  }, [tenantToken, tenantSlug, selectedLocation, fetchFloors]);

  // Fetch rooms when floor or pagination changes
  useEffect(() => {
    if (tenantToken && tenantSlug && selectedLocation && selectedFloor) {
      fetchRooms(selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize);
    }
  }, [tenantToken, tenantSlug, selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize, fetchRooms]);

  const handleLocationChange = useCallback((e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    // Reset to first page when location changes
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleFloorChange = useCallback((e) => {
    const floorId = e.target.value;
    setSelectedFloor(floorId);
    // Reset to first page when floor changes
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleEditClick = useCallback((room) => {
    setSelectedRoom(room);
    setShow(true);
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
    setSelectedRoom(null);
    // Don't fetch here - let useEffect handle it
  }, []);

  const handleDelete = useCallback(async (roomId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: roomId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((room) => room.id !== roomId)
      );
      
      setPopup({
        message: "Room deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
      
      // Refresh data
      if (selectedLocation && selectedFloor) {
        fetchRooms(selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize);
      }
    } catch (error) {
      toast.error("Failed to delete room!");
      setPopup({
        message: "Failed to delete room!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, selectedLocation, selectedFloor, fetchRooms, pagination.currentPage, pagination.pageSize]);

  const handleDeleteButton = useCallback((roomId) => {
    setDeletePopup({
      isVisible: true,
      roomId,
    });
  }, []);

  const confirmDelete = useCallback(() => {
    const { roomId } = deletePopup;
    handleDelete(roomId);
    setDeletePopup({ isVisible: false, roomId: null });
  }, [deletePopup, handleDelete]);

  const handleChargesButton = useCallback((spaceId) => {
    setChargesModal({ isVisible: true, spaceId });
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const handleRefresh = useCallback(() => {
    if (selectedLocation && selectedFloor) {
      fetchRooms(selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize);
    }
  }, [selectedLocation, selectedFloor, fetchRooms, pagination.currentPage, pagination.pageSize]);

  // Memoized columns
  const columns = useMemo(() => [
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
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Category",
      accessor: "category.category",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Space Number",
      accessor: "space_number",
      sort: true,
    },
    {
      Header: "Fee/Space",
      accessor: "space_fee",
      sort: true,
      Cell: ({ value }) => value ? `₦${value.toLocaleString()}` : "",
    },
    {
      Header: "Space Discount (%)",
      accessor: "space_discount",
      sort: true,
      Cell: ({ value }) => value ? `${value}%` : "0%",
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
          <OverlayTrigger
            overlay={<Tooltip id={`tooltip-edit-${row.original.id}`}>Edit Room</Tooltip>}
          >
            <Link
              to="#"
              className="action-icon"
              onClick={(e) => {
                e.preventDefault();
                handleEditClick(row.original);
              }}
              style={{ marginRight: "10px" }}
            >
              <i className="mdi mdi-square-edit-outline"></i>
            </Link>
          </OverlayTrigger>
          
          <OverlayTrigger
            overlay={<Tooltip id={`tooltip-delete-${row.original.id}`}>Delete Room</Tooltip>}
          >
            <Link
              to="#"
              className="action-icon"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteButton(row.original.id);
              }}
              style={{ marginRight: "10px" }}
            >
              <i className="mdi mdi-delete"></i>
            </Link>
          </OverlayTrigger>
          
          <OverlayTrigger
            overlay={<Tooltip id={`tooltip-charges-${row.original.id}`}>Manage Charges</Tooltip>}
          >
            <Link
              to="#"
              className="action-icon"
              onClick={(e) => {
                e.preventDefault();
                handleChargesButton(row.original.id);
              }}
            >
              <i className="mdi mdi-currency-usd"></i>
            </Link>
          </OverlayTrigger>
        </div>
      ),
    },
  ], [handleEditClick, handleDeleteButton, handleChargesButton, formatDateTime]);

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
                      setSelectedRoom(null);
                    }}
                    style={{
                      backgroundColor: primary,
                      borderColor: primary,
                      color: "#fff",
                    }}
                    disabled={!selectedLocation || !selectedFloor}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a Room
                  </Button>
                  {(!selectedLocation || !selectedFloor) && (
                    <small className="text-muted d-block mt-1">
                      Please select location and floor first
                    </small>
                  )}
                </Col>
                <Col sm={8} className="text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading || !selectedLocation || !selectedFloor}
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
                        Select a location to view or update rooms.
                      </p>
                      <Form.Select
                        style={{ marginBottom: "25px", fontSize: "1rem" }}
                        value={selectedLocation}
                        onChange={handleLocationChange}
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
                    <Form.Group className="mb-3" controlId="floor_id">
                      {loadingFloor ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" size="sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                          <p className="mt-2">Loading floors/sections...</p>
                        </div>
                      ) : (
                        <>
                          <Form.Label>
                            Select the Floor/Section to view rooms.
                          </Form.Label>
                          <Form.Select
                            name="floor_id"
                            value={selectedFloor}
                            onChange={handleFloorChange}
                            required
                          >
                            <option value="">Select a Floor/Section</option>
                            {floorData.map((floor) => (
                              <option key={floor.id} value={floor.id}>
                                {floor.name}
                              </option>
                            ))}
                          </Form.Select>
                        </>
                      )}
                    </Form.Group>
                  )}

                  {selectedFloor && (
                    <>
                      {loading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                          <p className="mt-2">Loading rooms...</p>
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

      <RoomRegistrationModal
        show={show}
        onHide={handleClose}
        room={selectedRoom}
        locations={locations}
        onSubmit={() => {
          if (selectedLocation && selectedFloor) {
            fetchRooms(selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize);
          }
        }}
      />

      <ChargesModal
        show={chargesModal.isVisible}
        onHide={() => setChargesModal({ isVisible: false, spaceId: null })}
        spaceId={chargesModal.spaceId}
        tenantSlug={tenantSlug}
        tenantToken={tenantToken}
        onSaved={() => {
          if (selectedLocation && selectedFloor) {
            fetchRooms(selectedLocation, selectedFloor, pagination.currentPage, pagination.pageSize);
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
          onClose={() => setDeletePopup({ isVisible: false, roomId: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default Rooms;