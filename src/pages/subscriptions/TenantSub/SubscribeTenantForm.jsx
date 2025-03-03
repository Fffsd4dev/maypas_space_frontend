import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import axios from "axios";

const SubscribeTenantForm = ({ show, onHide }) => {
    const { user } = useAuthContext();
    
    const token = user?.token;

    // State for form inputs
    const [formData, setFormData] = useState({
        tenant_id: "",
        plan_id: "",
    });

    // State for tenants(workspaces)
    const [tenants, setTenants] = useState([]);
    const [plans, setPlans] = useState([]);


    // State for error messages and loading
    const [errorMessage, setErrorMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch tenants(worspaces) when modal opens
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
                    console.log("API Response:", result);
    
                    if (response.ok && result.data && Array.isArray(result.data.data)) {
                        setTenants(result.data.data); // Ensure data is an array of tenants
                    } else {
                        throw new Error(result.message || "Failed to fetch tenants.");
                    }
                } catch (error) {
                    setErrorMessage(error.message);
                    setIsError(true);
                }
            };
    
            fetchTenants();
        }
    }, [show, token]);
    

    useEffect(() => {
        if (show && user?.token) {
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
                    console.log("API Response:", result);
    
                    if (response.ok && result.data && Array.isArray(result.data)) {
                        setPlans(result.data); // Ensure data is an array of plans
                    } else {
                        throw new Error(result.message || "Failed to fetch plans.");
                    }
                } catch (error) {
                    setErrorMessage(error.message);
                    setIsError(true);
                }
            };
    
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
        setErrorMessage("");
        
        const {tenant_id, plan_id} = formData
        try {
            if (!user?.token) {
                throw new Error("Authorization token is missing.");
            }

            const response = await axios.post(
               `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/subscribe-tenant`, {tenant_id, plan_id},
                {    headers: { Authorization: `Bearer ${token}` , "Content-Type": "multipart/form-data",}
                }
            );

            const result = response.data;
            
            if (response.status === 200 || response.ok || response.status == 201) {
                setErrorMessage("Tenant Subscribed successfully!");
                setIsError(false);
                setFormData({  plan_id: "", tenant_id: "" });
                setTimeout(() => { 
                    resetForm();
                }, 3000);
               
            } else {
                setErrorMessage(result.message || "Failed to subscribe tenant.");
                console.log(result.message)
                setIsError(true);
            }
        } catch (error) {
            setErrorMessage( error.message || "An error occurred while submitting the form.");
            setIsError(true);
            setTimeout(() => {
                    
                resetForm();
            }, 5000);
        } finally {
            setIsLoading(false);
            fetchData();
        }
    };

    // Reset form and error states
    const resetForm = () => {
        setFormData({ tenant_id: "", plan_id: "" });
        setErrorMessage("");
        setIsError(false);
    };

    return (
        <Modal show={show} onHide={() => { onHide(); resetForm(); }} centered>
            <Modal.Header className="bg-light" closeButton>
                <Modal.Title>Subscribe a Tenant(Workspace)</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {errorMessage && (
                    <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
                )}
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
                {tenant.company_name} {/* Ensure this field exists in API response */}
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
                {plan.name} for NGN {plan.price}{/* Ensure this field exists in API response */}
            </option>
        ))}
    </Form.Select>
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