import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";

const RoomRegistrationModal = ({ show, onHide, myRoom, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingFloor, setLoadingFloor] = useState(true);
  const [floorData, setFloorData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [categoryData, setCategoryData] = useState([]);

  const [formData, setFormData] = useState({
    space_name: "",
    space_number: "",
    floor_id: "",
    location_id: "",
    space_fee: "",
    space_category_id: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLocationName, setIsLocationName] = useState("");
  const [isFloorName, setIsFloorName] = useState("");

  useEffect(() => {
    if (myRoom) {
      setFormData({
        space_name: myRoom.space_name || "",
        space_number: myRoom.space_number || "",
        floor_id: myRoom.space || "",
        location_id: myRoom.location_id || "",
        space_fee: myRoom.space_fee || "",
        space_category_id: myRoom.space_category_id || "",
      });
    } else {
      setFormData({
        space_name: "",
        space_number: "",
        floor_id: "",
        location_id: "",
        space_fee: "",
        space_category_id: "",
      });
    }
  }, [myRoom]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
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

  useEffect(() => {
    if (show && user?.tenantToken) {
      fetchLocations();
    }
  }, [show, user?.tenantToken]);

  const fetchFloor = async (locationId) => {
    setLoadingFloor(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/list-floors/${locationId}`,
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
      if (result && Array.isArray(result.data.data)) {
        setFloorData(result.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingFloor(false);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      fetchFloor(selectedLocation);
    }
  }, [selectedLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setFormData((prev) => ({
      ...prev,
      location_id: locationId, // Update formData with the selected location ID
      floor_id: "", // Reset floor when location changes
      space_category_id: "", // Reset category when location changes
    }));
  };

  const fetchCategory = async () => {
    setLoadingCategory(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/category/list-categories`,
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
      if (result && Array.isArray(result.data)) {
        setCategoryData(result.data); // Store categories in state
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingCategory(false);
    }
  };

  useEffect(() => {
    if (user?.tenantToken) {
      fetchCategory(); // Fetch categories after a floor is selected
    }
  }, [user?.tenantToken]);

  const handleFloorChange = (e) => {
    const floorId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      floor_id: floorId, // Update formData with the selected floor ID
      space_category_id: "", // Reset category when floor changes
    }));
  };

  useEffect(() => {
    locations.map((location) => {
      if (location.id === myRoom?.location_id) {
        setSelectedLocation(location.id); // Set the selected location ID
        setIsLocationName(location.name); // Set the location name
      }
    });
  }, [user?.tenantToken, locations]);

  useEffect(() => {
    floorData.map((floor) => {
      if (floor.id === myRoom?.floor_id) {
        // setSelectedLocation(location.id); // Set the selected location ID
        setFormData((prev) => ({
          ...prev,
          floor_id: floor.id, // Update formData with the selected floor ID
        }));
        setIsFloorName(floor.name); // Set the location name
      }
    });
  }, [user?.tenantToken, floorData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.tenantToken) throw new Error("Authorization token is missing.");

      const url = myRoom
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/update/${myRoom.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/create`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.tenantToken}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(myRoom ? "Room updated successfully!" : "Room registered successfully!");
        setTimeout(() => {
          onSubmit(); // Trigger fetchRoom after success
          onHide();
        }, 1000);
      } else {
        toast.error(result?.message || "An error occurred.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>{myRoom ? "Room" : "Add a New Room"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* {errorMessage && (
          <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
        )} */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Room/Space Name</Form.Label>
            <Form.Control
              type="text"
              name="space_name"
              value={formData.space_name}
              onChange={handleInputChange}
              placeholder="Lavendier Room "
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="space_number">
            <Form.Label>Number of Spots in this Room/Space</Form.Label>
            <Form.Control
              type="number"
              name="space_number"
              value={formData.space_number}
              onChange={handleInputChange}
              placeholder="3"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="space_fee">
            <Form.Label>Fee per Spot</Form.Label>
            <Form.Control
              type="number"
              name="space_fee"
              value={formData.space_fee}
              onChange={handleInputChange}
              placeholder="30000"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="space_fee">
            <Form.Label>Total Fee</Form.Label>
            <Form.Control
              type="number"
              name="space_fee"
              value={formData.space_fee * formData.space_number || 0} // Multiply space_fee by space_number
              placeholder="30000"
              disabled // Disable the input
            />
          </Form.Group>

          <div>
            {myRoom ? (
              <>
                <Form.Label>
                  Select the location you want to add the room/space.
                </Form.Label>
                <Form.Select
                  style={{ marginBottom: "25px", fontSize: "1rem" }}
                  value={selectedLocation || ""}
                  onChange={handleLocationChange} // Use the updated handler
                  required
                >
                  {/* <option value="" disabled>
                Select a location
              </option> */}

                  <option disabled value={formData.location_id}>
                    {isLocationName}
                  </option>
                </Form.Select>
              </>
            ) : (
              <>
                <Form.Label>
                  Select the location you want to add the room/space.
                </Form.Label>
                <Form.Select
                  style={{ marginBottom: "25px", fontSize: "1rem" }}
                  value={selectedLocation || ""}
                  onChange={handleLocationChange} // Use the updated handler
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
              </>
            )}
          </div>

          {selectedLocation && (
            <Form.Group className="mb-3" controlId="location_id">
              {myRoom ? (
                <>
                <Form.Label>
                    Select the Floor you want to add the room/space.
                  </Form.Label>
                  <Form.Select
                    name="floor_id"
                    value={formData.floor_id}
                    onChange={handleFloorChange}
                    required
                  >
                    {/* <option value="">Select a Floor/Section</option> */}
                    <option disabled value={formData.floor_id}>
                    {isFloorName}
                  </option>
                  </Form.Select>
                </>    
                ): (
                  <>

              {loadingFloor ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">
                      Loading floors/sections...
                    </span>
                  </Spinner>
                </div>
              ) : (
                <>
                  <Form.Label>
                    Select the Floor you want to add the room/space.
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
              </>
            )
          }
            </Form.Group>
          )}

          {formData.floor_id && (
            <Form.Group className="mb-3" controlId="space_category_id">
              <Form.Label>Select a Category</Form.Label>
              <Form.Select
                name="space_category_id"
                value={formData.space_category_id}
                onChange={handleInputChange} // Update formData with the selected category ID
                required
              >
                <option value="">Select a Category</option>
                {Array.isArray(categoryData) &&
                  categoryData.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          )}

          <Button
            style={{
              backgroundColor:
                isLoading || loadingLocations || loadingFloor || loadingCategory
                  ? "#d3d3d3"
                  : "#FE0002", // Use primary color or disabled color
              borderColor:
                isLoading || loadingLocations || loadingFloor || loadingCategory
                  ? "#d3d3d3"
                  : "#FE0002", // Match border color
            }}
            type="submit"
            className="w-100"
            disabled={
              isLoading || loadingLocations || loadingFloor || loadingCategory
            } // Disable button if any loading state is true
          >
            {isLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : myRoom ? (
              "Update"
            ) : (
              "Create"
            )}{" "}
            Room
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RoomRegistrationModal;
