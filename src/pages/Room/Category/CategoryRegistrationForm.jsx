import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";

const CategoryRegistrationModal = ({ show, onHide, myCategory, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;

    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(true);
    const [error, setError] = useState(null);
    const [floorData, setFloorData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLocationName, setIsLocationName] = useState("");


    // const [locations, setLocations] = useState([
    //     { id: 1, locations: "Owner" },
    //     { id: 2, locations: "Admin" },
    // ]);
    
    
   
    const [formData, setFormData] = useState({
        category: "",
        location_id: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (myCategory) {
            setFormData({
                category: myCategory.category || "",
                // space_number: myCategory.space_number || "",    
                // floor_id: myCategory.space || "",
                location_id: myCategory.location_id || "",
                // space_fee: myCategory.space_fee || "",
                // space_category_id: myCategory.space_category_id || ""
            });
        } else {
            setFormData({
                category: "",
                // space_number: "",    
                // floor_id: "",
                location_id: "",
                // space_fee: "",
                // space_category_id: ""
            });
        }
    }, [myCategory]);

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


    // const fetchFloor = async (locationId, ) => {
    //     setLoadingFloor(true);
    //     setError(null);
    //     console.log("User Token:", user?.tenantToken);
    //     try {
    //       const response = await fetch(
    //         `${
    //           import.meta.env.VITE_BACKEND_URL
    //         }/api/${tenantSlug}/floor/list-floors/${locationId}`,
    //         {
    //           method: "GET",
    //           headers: {
    //             Authorization: `Bearer ${user?.tenantToken}`,
    //           },
    //         }
    //       );
    
    //       if (!response.ok) {
    //         throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
    //       }
    
    //       const result = await response.json();
    //       if (result && Array.isArray(result.data.data)) {
    //         const data = result.data.data;
    //         data.sort(
    //           (a, b) =>
    //             new Date(b.updated_at || b.created_at) -
    //             new Date(a.updated_at || a.created_at)
    //         );
    //         setFloorData(data);
    //       } else {
    //         throw new Error("Invalid response format");
    //       }
    //     } catch (error) {
    //       setError(error.message);
    //     } finally {
    //       setLoadingFloor(false);
    //     }
    //   };

// useEffect(() => {
//     if (selectedLocation) {
//       fetchFloor(selectedLocation);
//     }
//   }, [selectedLocation]);
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
        }));
      };

      useEffect(() => {
        locations.map((location) => {
          if (location.id === myCategory?.location_id) {
            setSelectedLocation(location.id); // Set the selected location ID
            setIsLocationName(location.name); // Set the location name
          }
        });
      }, [user?.tenantToken, locations]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        console.log(formData);
        console.log(user?.tenantToken);

        try {
            if (!user?.tenantToken) throw new Error("Authorization token is missing.");

            const url = myCategory
                ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/update/${myCategory.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/create`;
            
            const method = myCategory ? "POST" : "POST";
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
                setErrorMessage(myCategory ? "Category updated successfully!" : "Category registered successfully!");
                setIsError(false);
                setFormData({ category: "", location_id: "" }); // Reset inputs after success
                setTimeout(() => {
                    onSubmit(); // Call onSubmit to reload users
                    onHide();
                    setErrorMessage(myCategory ? " " : " ");

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
                <Modal.Title>{myCategory ? "Category" : "Add a New Category"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {errorMessage && (
                    <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Category Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            placeholder="Podcast studio "
                            required
                            
                        />
                    </Form.Group>
                    {/* <Form.Group className="mb-3" controlId="space_number">
                        <Form.Label>Category Number</Form.Label>
                        <Form.Control
                            type="number"
                            name="space_number"
                            value={formData.space_number}
                            onChange={handleInputChange}
                            placeholder="3"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="space_fee">
                        <Form.Label>Category Fee</Form.Label>
                        <Form.Control
                            type="number"
                            name="space_fee"
                            value={formData.space_fee}
                            onChange={handleInputChange}
                            placeholder="30000"
                        />
                    </Form.Group> */}
                                         <div>
                                            {myCategory ? (
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
                                         <Form.Label>Select the location you want to add the room/space.</Form.Label>
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
                                           </>
            )}
                                         </div>
                                    

                                        {/* {selectedLocation ? (
                                             <Form.Group className="mb-3" controlId="location_id">
                                             <Form.Label>Select the Floor you want to add the room/space.</Form.Label>
                                             <Form.Select name="floor_id" value={formData.floor_id} onChange={handleInputChange} required>
                                                 <option value="">Select a Floor/Section</option>
                                                 {Array.isArray(floorData) && locations.map((floor) => (
                                                     <option key={floor.id} value={floor.id}>{floor.name} </option>
                                                 ))}
                                             </Form.Select>
                                         </Form.Group>
                                        ) : ("")} */}

                   

                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" locations="status" aria-hidden="true" /> : myCategory ? "Update" : "Create"} Category
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CategoryRegistrationModal;