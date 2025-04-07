import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FloorRegistrationModal = ({ show, onHide, myFloor, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;

    const [locations, setLocations] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        location_id: "",
    });

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
            toast.error(error.message);
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
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log(formData);
        console.log(user?.tenantToken);

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
                toast.success(myFloor ? "Floor updated successfully!" : "Floor registered successfully!");
                setFormData({
                    name: "",
                    location_id: "",
                });
                setTimeout(() => {
                    onSubmit();
                    onHide();
                }, 1000);
            } else {
                let errorMsg = "An error occurred.";

                if (result?.errors) {
                    errorMsg = Object.values(result.errors)
                        .flat()
                        .join("\n");
                } else if (result?.message) {
                    errorMsg = result.message;
                }

                toast.error(errorMsg);
                console.log(result);
            }
        } catch (error) {
            toast.error("An error occurred. Contact Admin");
            console.log(error);
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