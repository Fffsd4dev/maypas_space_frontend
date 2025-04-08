import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UsersRegistrationModal = ({ show, onHide, myUser, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;

    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role_id: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (myUser) {
            setFormData({
                name: myUser.name || "",
                email: myUser.email || "",
                role_id: myUser.role_id || "",
            });
        } else {
            setFormData({
                name: "",
                email: "",
                role_id: "",
            });
        }
    }, [myUser]);

    const fetchRoles = async () => {
        setLoadingRoles(true);
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
        } finally {
            setLoadingRoles(false);
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
            [name]: value,
        }));
    };

    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setFormData((prev) => ({
            ...prev,
            role_id: roleId,
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
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter name"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="role">
                        <Form.Label>Select Role</Form.Label>
                        <Form.Select
                            value={formData.role_id || ""}
                            onChange={handleRoleChange}
                            required
                        >
                            <option value="" disabled>
                                Select a role
                            </option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" locations="status" aria-hidden="true" /> : myUser ? "Update" : "Create"} User
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default UsersRegistrationModal;