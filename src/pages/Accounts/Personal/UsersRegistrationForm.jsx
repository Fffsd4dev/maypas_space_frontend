import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";

const UsersRegistrationModal = ({ show, onHide, myUser, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;

    const [roles, setRoles] = useState([]);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        user_type_id: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (myUser) {
            setFormData({
                first_name: myUser.first_name || "",
                last_name: myUser.last_name || "",
                email: myUser.email || "",
                phone: myUser.phone || "",
                user_type_id: myUser.user_type_id || "",
            });
        } else {
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                user_type_id: "",
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
        console.log(formData);
        console.log(user?.tenantToken);

        try {
            if (!user?.tenantToken) throw new Error("Authorization token is missing.");

            const url = myUser
                ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/update-user/${myUser.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/add-user`;

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
                toast.success(myUser ? "User updated successfully!" : "User registered successfully!");
                setTimeout(() => {
                    onSubmit();
                    onHide();
                }, 2000);
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
                <Modal.Title>{myUser ? "Edit User" : "Add a New User"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="first_name">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="last_name">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="phone">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="user_type_id">
                        <Form.Label>Role</Form.Label>
                        <Form.Select name="user_type_id" value={formData.user_type_id} onChange={handleInputChange} required>
                            <option value="">Select a role</option>
                            {Array.isArray(roles) && roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.user_type}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : myUser ? "Update" : "Create"} User
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default UsersRegistrationModal;