import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";

const RolesRegistrationForm = ({ show, onHide, selectedAdmin }) => {
    const { user } = useAuthContext();

    // State for form inputs
    const [formData, setFormData] = useState({
        role: "",
        create_tenant: "no",
        update_tenant: "no",
        delete_tenant: "no",
        view_tenant: "no",
        view_tenant_income: "no",
        create_plan: "no",
    });

    const [isLoading, setIsLoading] = useState(false);

    // Pre-fill form if editing
    useEffect(() => {
        if (selectedAdmin) {
            setFormData({
                role: selectedAdmin.role || "",
                create_tenant: selectedAdmin.create_tenant || "no",
                update_tenant: selectedAdmin.update_tenant || "no",
                delete_tenant: selectedAdmin.delete_tenant || "no",
                view_tenant: selectedAdmin.view_tenant || "no",
                view_tenant_income: selectedAdmin.view_tenant_income || "no",
                create_plan: selectedAdmin.create_plan || "no",
            });
        } else {
            setFormData({
                role: "",
                create_tenant: "no",
                update_tenant: "no",
                delete_tenant: "no",
                view_tenant: "no",
                view_tenant_income: "no",
                create_plan: "no",
            });
        }
    }, [selectedAdmin]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle checkbox changes
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked ? "yes" : "no" }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!user?.token) throw new Error("Authorization token is missing.");

            const endpoint = selectedAdmin
                ? `https://trial.maypasworkspace.com/api/system-admin/update-role/${selectedAdmin.id}`
                : "https://trial.maypasworkspace.com/api/system-admin/create-role";

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
                toast.success(selectedAdmin ? "Role updated successfully!" : "Role created successfully!");
                setTimeout(() => onHide(), 2000);
            } else {
                toast.error(result.message || "Failed to submit form.");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while submitting the form.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header className="bg-light" closeButton>
                <Modal.Title>{selectedAdmin ? "Edit Role" : "Add New Role"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="role">
                        <Form.Label>Role Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="role" 
                            value={formData.role} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </Form.Group>

                    {/* Permissions */}
                    <Form.Group className="mb-3">
                        <Form.Label>Permissions</Form.Label>
                        <div className="d-flex flex-column">
                            <Form.Check 
                                type="checkbox" 
                                label="Create Tenant" 
                                name="create_tenant" 
                                checked={formData.create_tenant === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Update Tenant" 
                                name="update_tenant" 
                                checked={formData.update_tenant === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Delete Tenant" 
                                name="delete_tenant" 
                                checked={formData.delete_tenant === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="View Tenant" 
                                name="view_tenant" 
                                checked={formData.view_tenant === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="View Tenant Income" 
                                name="view_tenant_income" 
                                checked={formData.view_tenant_income === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Create Plan" 
                                name="create_plan" 
                                checked={formData.create_plan === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                        </div>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Submit"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RolesRegistrationForm;
