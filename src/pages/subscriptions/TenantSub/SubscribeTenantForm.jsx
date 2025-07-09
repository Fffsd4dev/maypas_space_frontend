import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const SubscribeTenantForm = ({ show, onHide, onSubmit }) => {
    const { user } = useAuthContext();
    const token = user?.token;

    // State for form inputs
    const [formData, setFormData] = useState({
        tenant_id: "",
        plan_id: "",
        duration: "",
    });

    // State for tenants(workspaces) and plans
    const [tenants, setTenants] = useState([]);
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch tenants(workspaces) when modal opens
    useEffect(() => {
        if (show && user?.token) {
            const fetchTenants = async () => {
                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-workspaces`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    const result = await response.json();
                    if (response.ok && result.data && Array.isArray(result.data.data)) {
                        setTenants(result.data.data);
                    } else {
                        throw new Error(result.message || "Failed to fetch tenants.");
                    }
                } catch (error) {
                    toast.error(error.message || "An error occurred while fetching tenants.");
                }
            };
            fetchTenants();
        }
    }, [show, token]);

    const fetchPlans = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-plans`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const result = await response.json();
            if (response.ok && result.data && Array.isArray(result.data)) {
                setPlans(result.data);
            } else {
                throw new Error(result.message || "Failed to fetch plans.");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while fetching plans.");
        }
    };

    useEffect(() => {
        if (show && user?.token) {
            fetchPlans();
        }
    }, [show, token]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { tenant_id, plan_id, duration } = formData;
        try {
            if (!user?.token) {
                throw new Error("Authorization token is missing.");
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/subscribe-tenant`,
                { tenant_id, plan_id, duration },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success("Tenant subscribed successfully!");
                setFormData({ tenant_id: "", plan_id: "", duration: "" });
                setTimeout(() => {
                    onSubmit();
                    onHide();
                    resetForm();
                    
                }, 1000);
            } else {
                throw new Error(response.data.message || "Failed to subscribe tenant.");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while submitting the form.");
        } finally {
            setIsLoading(false);
            fetchPlans();
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({ tenant_id: "", plan_id: "", duration: "" });
    };

    return (
        <Modal
            show={show}
            onHide={() => {
                onHide();
                onSubmit(); // Trigger fetchData on modal hide
            }}
            centered
        >
            <Modal.Header className="bg-light" closeButton>
                <Modal.Title>Subscribe a Tenant(Workspace)</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="tenant_id">
                        <Form.Label>Choose Tenant</Form.Label>
                        <Form.Select
                            name="tenant_id"
                            value={formData.tenant_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Tenant</option>
                            {tenants.map((tenant) => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.company_name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="plan_id">
                        <Form.Label>Choose Subscription Plan</Form.Label>
                        <Form.Select
                            name="plan_id"
                            value={formData.plan_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Plan</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} for NGN {plan.price}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Subscription Duration (in months)</Form.Label>
                        <Form.Control
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            placeholder="Enter duration in months"
                            required
                        />
                    </Form.Group>


                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />{" "}
                                Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default SubscribeTenantForm;