import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const LocationRegistrationModal = ({ show, onHide, myUser, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;

    const [roles, setRoles] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        state: "",
        address: "",
    });

    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (myUser) {
            setFormData({
                name: myUser.name || "",
                state: myUser.state || "",
                address: myUser.address || "",
            });
        } else {
            setFormData({
                name: "",
                state: "",
                address: "",
            });
        }
    }, [myUser]);

    // Fetch roles when modal opens
    const fetchRoles = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/usertype/list-user-types`, {
                headers: { Authorization: `Bearer ${user.tenantToken}` },
            });
            const result = await response.json();
            if (response.ok) {
                console.log("Roles:", result.data.data);
                setRoles(result.data.data || []);
            } else {
                throw new Error(result.message || "Failed to fetch roles.");
            }
        } catch (error) {
            toast.error(error.message);
            setIsError(true);
        }
    };

    useEffect(() => {
        if (show && user?.tenantToken) {
            fetchRoles();
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
        console.log(formData)
        console.log(user?.tenantToken)

        try {
            if (!user?.tenantToken) throw new Error("Authorization token is missing.");

            const url = myUser
                ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/update/${myUser.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/create`;
            
            const method = myUser ? "POST" : "POST";
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
                toast.success(myUser ? "Location updated successfully!" : "Location registered successfully!");
                setIsError(false);
                setTimeout(() => {
                    onSubmit(); // Call onSubmit to reload users
                    onHide();
                }, 2000);
            } else {
                let errorMsg = "An error Occurred."; // Default message

                if (result?.errors) {
                    // Extract all error messages and join them into a single string
                    errorMsg = Object.values(result.errors)
                        .flat() // Flatten array in case multiple errors per field
                        .join("\n"); // Join errors with line breaks
                } else if (result?.message) {
                    errorMsg = result.message;
                }
            
                toast.error(errorMsg);
                console.log(result);
                setIsError(true);
            }
        } catch (error) {
            toast.error("An error occurred. Contact Admin");
            console.log(error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header className="bg-light" closeButton>
                <Modal.Title>{myUser ? "Location User" : "Add a New Location"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Location Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="state">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                            type="text"
                            name="state"
                            value={formData.state}
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
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : myUser ? "Update" : "Create"} Location
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default LocationRegistrationModal;