import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateNotificationModal = ({ show, onHide, myNotification, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;

    // const [roles, setRoles] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (myNotification) {
            setFormData({
                name: myNotification.name || "",
                description: myNotification.description || "",
               
            });
        } else {
            setFormData({
                name: "",
                description: "",
               
            });
        }
    }, [myNotification]);

    // Fetch roles when modal opens
    // const fetchRoles = async () => {
    //     try {
    //         const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/usertype/list-user-types`, {
    //             headers: { Authorization: `Bearer ${user.tenantToken}` },
    //         });
    //         const result = await response.json();
    //         if (response.ok) {
    //             console.log("Roles:", result.data.data);
    //             setRoles(result.data.data || []);
    //         } else {
    //             throw new Error(result.message || "Failed to fetch roles.");
    //         }
    //     } catch (error) {
    //         toast.error(error.message);
    //     }
    // };

    // useEffect(() => {
    //     if (show && user?.tenantToken) {
    //         fetchRoles();
    //     }
    // }, [show, user?.tenantToken]);

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

            const url = myNotification
                ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/notification/update/${myNotification.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/notification/create`;

            const method = myNotification ? "POST" : "POST";
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
                toast.success(myNotification ? "Notification updated successfully!" : "Added Notification successfully!");
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
                <Modal.Title>{myNotification ? "Edit Notification" : "Add a New Notification"}</Modal.Title>
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
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                   

                    

                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : myNotification ? "Update" : "Add"} Notification
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateNotificationModal;