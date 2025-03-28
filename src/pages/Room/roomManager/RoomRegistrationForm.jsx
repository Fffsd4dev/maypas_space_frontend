import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";

const RoomRegistrationModal = ({ show, onHide, myRoom, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;

    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(true);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [loadingFloor, setLoadingFloor] = useState(true);
    const [error, setError] = useState(null);
    const [floorData, setFloorData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [categoryData, setCategoryData] = useState([]); // State to store categories

    const [formData, setFormData] = useState({
        name: "",
        location_id: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (myRoom) {
            setFormData({
                name: myRoom.name || "",
                space_number: myRoom.space_number || "",    
                floor_id: myRoom.space || "",
                location_id: myRoom.location_id || "",
                space_fee: myRoom.space_fee || "",
                space_category_id: myRoom.space_category_id || ""
            });
        } else {
            setFormData({
                name: "",
                space_number: "",    
                floor_id: "",
                location_id: "",
                space_fee: "",
                space_category_id: ""
            });
        }
    }, [myRoom]);

    // Fetch locations when modal opens
    const fetchLocations = async () => {
        setLoadingLocations(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations`, {
                headers: { Authorization: `Bearer ${user.tenantToken}` },
            });
            const result = await response.json();
            if (response.ok) {
                console.log("Locations:", result.data.data);
                setLocations(result.data.data || []);
            } else {
                throw new Error(result.message || "Failed to fetch locations.");
            }
        } catch (error) {
            setErrorMessage(error.message);
            setIsError(true);
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
        setError(null);
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
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
    
          const result = await response.json();
          if (result && Array.isArray(result.data.data)) {
            setFloorData(result.data.data); // Store floors in state
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setLoadingFloor(false);
        }
      };

useEffect(() => {
    if (selectedLocation) {
      fetchFloor(selectedLocation); // Fetch floors based on the selected location ID
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
        setError(null);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/list-categories`,
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
          console.log(result)
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        console.log(formData);
        console.log(user?.tenantToken);

        try {
            if (!user?.tenantToken) throw new Error("Authorization token is missing.");

            const url = myRoom
                ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/update/${myRoom.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/create`;
            
            const method = myRoom ? "POST" : "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.tenantToken}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                setErrorMessage(myRoom ? "Room updated successfully!" : "Room registered successfully!");
                setIsError(false);
                setFormData({ name: "", location_id: "", floor_id: "", space_number: "", space_fee: "", space_category_id: "" }); // Reset inputs after success
                setTimeout(() => {
                    onSubmit(); // Call onSubmit to reload users
                    onHide();
                }, 2000);
            } else {
                let errorMsg = "An error Occured."; // Default message

                if (result?.errors) {
                    // Extract all error messages and join them into a single string
                    errorMsg = Object.values(result.errors)
                        .flat() // Flatten array in case multiple errors per field
                        .join("\n"); // Join errors with line breaks
                } else if (result?.message) {
                    errorMsg = result.message;
                }
            
                setErrorMessage(errorMsg);
                
                console.log(result);
                setIsError(true);
            }
        } catch (error) {
            setErrorMessage( "An error occurred. Contact Admin");
            console.log(error);
            setIsError(true);
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
                {errorMessage && (
                    <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Room/Space Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Lavendier Room "
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="space_number">
                        <Form.Label>Room/Space Number</Form.Label>
                        <Form.Control
                            type="number"
                            name="space_number"
                            value={formData.space_number}
                            onChange={handleInputChange}
                            placeholder="3"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="space_fee">
                        <Form.Label>Room/Space Fee</Form.Label>
                        <Form.Control
                            type="number"
                            name="space_fee"
                            value={formData.space_fee}
                            onChange={handleInputChange}
                            placeholder="30000"
                        />
                    </Form.Group>
                                         <div>
                                         <Form.Label>Select the location you want to add the room/space.</Form.Label>
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
                                         </div>
                                    

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
        <Form.Label>Select the Floor you want to add the room/space.</Form.Label>
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
                        backgroundColor: isLoading || loadingLocations || loadingFloor || loadingCategory ? "#d3d3d3" : "#FE0002", // Use primary color or disabled color
                        borderColor: isLoading || loadingLocations || loadingFloor || loadingCategory ? "#d3d3d3" : "#FE0002", // Match border color
                      }}
                      type="submit"
                      className="w-100"
                      disabled={isLoading || loadingLocations || loadingFloor || loadingCategory} // Disable button if any loading state is true
                    >
                      {isLoading ? (
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      ) : myRoom ? "Update" : "Create"} Room
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RoomRegistrationModal;