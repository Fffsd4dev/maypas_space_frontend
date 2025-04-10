import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";

const WorkspaceRegistrationModal = ({ show, onHide, workspace, onSubmit }) => {
    const { user } = useAuthContext();

    const [formData, setFormData] = useState({
        company_name: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company_no_location: "",
        company_countries: [],
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (workspace) {
            setFormData({
                company_name: workspace.company_name || "",
                first_name: workspace.first_name || "",
                last_name: workspace.last_name || "",
                email: workspace.email || "",
                phone: workspace.phone || "",
                company_no_location: workspace.company_no_location || "",
                company_countries: (() => {
                    const countries = JSON.parse(workspace.company_countries);
                    return Array.isArray(countries) ? countries : [];
                })(),
            });
        } else {
            setFormData({
                company_name: "",
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                company_no_location: "",
                company_countries: [],
            });
        }
    }, [workspace]);

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

        try {
            if (!user?.token) throw new Error("Authorization token is missing.");

            const url = workspace
                ? `https://trial.maypasworkspace.com/api/system-admin/update-workspace/${workspace.id}`
                : "https://trial.maypasworkspace.com/api/system-admin/register-workspace";

            const method = workspace ? "POST" : "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                toast.success(workspace ? "Workspace updated successfully!" : "Workspace registered successfully!");
                setTimeout(() => {
                    onSubmit();
                    onHide();
                }, 2000);
            } else {
                let errorMsg = "Operation failed.";

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
            toast.error(error.message || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header className="bg-light" closeButton>
                <Modal.Title>{workspace ? "Edit Workspace" : "Add New Workspace"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="company_name">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="company_no_location">
                        <Form.Label>Number of Locations</Form.Label>
                        <Form.Control
                            type="number"
                            name="company_no_location"
                            value={formData.company_no_location}
                            onChange={handleInputChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="company_countries">
                        <Form.Label>Company Countries</Form.Label>
                        <Form.Control
                            type="text"
                            name="company_countries"
                            value={formData.company_countries}
                            onChange={handleInputChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="first_name">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            disabled={workspace}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="last_name">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            disabled={!!workspace}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!!workspace}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="phone">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!!workspace}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : workspace ? "Update" : "Create"} Workspace
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default WorkspaceRegistrationModal;
