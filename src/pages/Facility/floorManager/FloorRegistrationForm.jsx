import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";

const FloorRegistrationModal = ({ show, onHide, myFloor, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;

    const [locations, setLocations] = useState([]);

    // const [locations, setLocations] = useState([
    //     { id: 1, locations: "Owner" },
    //     { id: 2, locations: "Admin" },
    // ]);
    
    
   
    const [formData, setFormData] = useState({
        name: "",
        location_id: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (myFloor) {
            setFormData({
                name: myFloor.name || "",
                location_id: myFloor.location_id || "",
            });
        } else {
            setFormData({
                name: "",
                location_id: "",
            });
        }
    }, [myFloor]);

    // Fetch locations when modal opens
    const fetchLocations = async () => {
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
        }
    };

    useEffect(() => {
        if (show && user?.tenantToken) {
            fetchLocations();
        }
    }, [show, user?.tenantToken]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "company_countries" ? value.split(",").map(c => c.trim()) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        console.log(formData)
        console.log(user?.tenantToken)

        try {
            if (!user?.tenantToken) throw new Error("Authorization token is missing.");

            const url = myFloor
                ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/update/${myFloor.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/create`;
            
            const method = myFloor ? "POST" : "POST";
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
                setErrorMessage(myFloor ? "Floor updated successfully!" : "Floor registered successfully!");
                setIsError(false);
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
                <Modal.Title>{myFloor ? "Floor" : "Add a New Floor/Section"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {errorMessage && (
                    <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Floor Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ground Floor"
                        />
                    </Form.Group>

                    {/* <Form.Group className="mb-3" controlId="id">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                            type="text"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                        />
                    </Form.Group> */}
                     <Form.Group className="mb-3" controlId="location_id">
                                            <Form.Label>Location</Form.Label>
                                            <Form.Select name="location_id" value={formData.location_id} onChange={handleInputChange} required>
                                                <option value="">Select a location</option>
                                                {Array.isArray(locations) && locations.map((location) => (
                                                    <option key={location.id} value={location.id}>{location.name} at {location.state} state</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                   

                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" locations="status" aria-hidden="true" /> : myFloor ? "Update" : "Create"} Floor
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default FloorRegistrationModal;