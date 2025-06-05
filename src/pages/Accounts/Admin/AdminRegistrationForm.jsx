import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";


const AdminRegistrationForm = ({ show, onHide, selectedAdmin }) => {
    const { user } = useAuthContext();

    // State for form inputs
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role_id: "",
    });

    // State for roles
    const [roles, setRoles] = useState([]);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Pre-fill form if editing
    useEffect(() => {
        if (selectedAdmin) {
            setFormData({
                first_name: selectedAdmin.first_name,
                last_name: selectedAdmin.last_name,
                email: selectedAdmin.email,
                role_id: selectedAdmin.role_id || "",
            });
        } else {
            setFormData({ first_name: "", last_name: "", email: "", role_id: "" });
        }
    }, [selectedAdmin]);

    // Fetch roles when modal opens
    useEffect(() => {
        if (user?.token) {
            const fetchRoles = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-roles`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    });
                    const result = await response.json();
                    if (response.ok) {
                        setRoles(result.data);
                    } else {
                        throw new Error(result.message || "Failed to fetch roles.");
                    }
                } catch (error) {
                    toast.error(error.message || "failed to load roles");
                    
                    setIsError(true);
                }
            };
            fetchRoles();
        }
    }, [ user?.token]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!user?.token) throw new Error("Authorization token is missing.");

            const endpoint = selectedAdmin
                ? `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/update/${selectedAdmin.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/add`;
            
            const method = selectedAdmin ? "POST" : "POST";
            
            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(selectedAdmin ? "Admin updated successfully!" : "Admin registered successfully!" );
                setIsError(false);
                setTimeout(() => onHide(), 1000);
            } else {
                toast.error(result.message || "Failed to submit form.");
                setIsError(true);
            }
        } catch (error) {
            toast.error(result.message || "An error occurred while submitting the form.");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header className="bg-light" closeButton>
                <Modal.Title>{selectedAdmin ? "Edit Admin" : "Add New Admin"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {/* {errorMessage && (
                    <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
                )} */}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="first_name">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="last_name">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="role_id">
                        <Form.Label>Role</Form.Label>
                        <Form.Select name="role_id" value={formData.role_id} onChange={handleInputChange} required>
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.role}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Submit"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AdminRegistrationForm;

