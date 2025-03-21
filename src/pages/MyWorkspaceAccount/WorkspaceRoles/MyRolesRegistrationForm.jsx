import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";


const MyRolesRegistrationForm = ({ show, onHide, selectedAdmin }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;

    // State for form inputs
    const [formData, setFormData] = useState({
        user_type: "",
        create_admin: "no",
        update_admin: "no",
        delete_admin: "no",
        view_admin: "no",
        create_user: "no",
        update_user: "no",
        delete_user: "no",
        view_user: "no",
        create_location: "no", 
        update_location: "no",
        delete_location: "no",
        view_location: "no",
        create_floor: "no",
        update_floor: "no",
        delete_floor: "no",
        view_floor: "no",
        create_space: "no",
        update_space: "no",
        delete_space: "no",
        view_space: "no",
        create_booking: "no",
        update_booking: "no",
        delete_booking: "no",
        view_booking: "no",

    });

    const [errorMessage, setErrorMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Pre-fill form if editing
    useEffect(() => {
        if (selectedAdmin) {
            setFormData({
                user_type: selectedAdmin.user_type || "",
                create_admin: selectedAdmin.create_admin || "no",
                update_admin: selectedAdmin.update_admin || "no",
                delete_admin: selectedAdmin.delete_admin || "no",
                view_admin: selectedAdmin.view_admin || "no",
                create_user: selectedAdmin.create_user || "no",
                update_user: selectedAdmin.update_user || "no",
                delete_user: selectedAdmin.delete_user || "no",
                view_user: selectedAdmin.view_user || "no",
                create_location: selectedAdmin.create_location || "no",
                update_location: selectedAdmin.update_location || "no",
                delete_location: selectedAdmin.delete_location || "no",
                view_location: selectedAdmin.view_location || "no",
                create_floor: selectedAdmin.create_floor || "no",
                update_floor: selectedAdmin.update_floor || "no",
                delete_floor: selectedAdmin.delete_floor || "no",
                view_floor: selectedAdmin.view_floor || "no",
                create_space: selectedAdmin.create_space || "no",
                update_space: selectedAdmin.update_space || "no",
                delete_space: selectedAdmin.delete_space || "no",
                view_space: selectedAdmin.view_space || "no",
                create_booking: selectedAdmin.create_booking || "no",
                update_booking: selectedAdmin.update_booking || "no",
                delete_booking: selectedAdmin.delete_booking || "no",
                view_booking: selectedAdmin.view_booking || "no",

            });
        } else {
            setFormData({
                user_type: "",
                create_admin: "no",
                update_admin: "no",
                delete_admin: "no",
                view_admin: "no",
                create_user: "no",
                update_user: "no",
        delete_user: "no",
        view_user: "no",
        create_location: "no", 
        update_location: "no",
        delete_location: "no",
        view_location: "no",
        create_floor: "no",
        update_floor: "no",
        delete_floor: "no",
        view_floor: "no",
        create_space: "no",
        update_space: "no",
        delete_space: "no",
        view_space: "no",
        create_booking: "no",
        update_booking: "no",
        delete_booking: "no",
        view_booking: "no",

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
        setErrorMessage("");
        console.log(formData)
        console.log(JSON.stringify(formData))

        try {
            if (!user?.token) throw new Error("Authorization token is missing.");

            const endpoint = selectedAdmin
                ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/usertype/update/${selectedAdmin.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/usertype/create`;

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
                setErrorMessage(selectedAdmin ? "Role updated successfully!" : "Role created successfully!");
                setIsError(false);
                setTimeout(() => onHide(), 2000);
            } else {
                let errorMsg = "An error Occured."; // Default message

                if (result?.errors) {
                    console.log(result.errors)
                    // Extract all error messages and join them into a single string
                    errorMsg = Object.values(result.errors)
                        .flat() // Flatten array in case multiple errors per field
                        .join("\n"); // Join errors with line breaks
                } else if (result?.message) {
                    errorMsg = result.message;
                }
            
                setErrorMessage(errorMsg);
                
                console.log(result);
                setIsError(true);
            }
        } catch (error) {
            setErrorMessage( "An error occurred. Contact Admin");
            console.log(error);
            setIsError(true);
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
                {errorMessage && (
                    <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="user_type">
                        <Form.Label>Role Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="user_type" 
                            value={formData.user_type} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </Form.Group>

                    {/* Permissions */}
                    <Form.Group className="mb-3">
                        <Form.Label>Permissions</Form.Label>
                        <div className="d-flex flex-row">
                        <div className="d-flex flex-column">
                            <Form.Check 
                                type="checkbox" 
                                label="Create Admin" 
                                name="create_admin" 
                                checked={formData.create_admin === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Update Admin" 
                                name="update_admin" 
                                checked={formData.update_admin === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Delete Admin" 
                                name="delete_admin" 
                                checked={formData.delete_admin === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="View Admin" 
                                name="view_admin" 
                                checked={formData.view_admin === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Create User" 
                                name="create_user" 
                                checked={formData.create_user === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Update User" 
                                name="update_user" 
                                checked={formData.update_user === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Delete User" 
                                name="delete_user" 
                                checked={formData.delete_user === "yes"} 
                                onChange={handleCheckboxChange} 
                            />

                            <Form.Check
                                type="checkbox"     
                                label="View User"
                                name="view_user"
                                checked={formData.view_user === "yes"}
                                onChange={handleCheckboxChange}
                            />
                            </div>
                            <div className="d-flex flex-column ms-3">
                            <Form.Check 
                                type="checkbox" 
                                label="Create Location" 
                                name="create_location" 
                                checked={formData.create_location === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Update Location" 
                                name="update_location" 
                                checked={formData.update_location === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Delete Location" 
                                name="delete_location" 
                                checked={formData.delete_location === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="View Location" 
                                name="view_location" 
                                checked={formData.view_location === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                           
                           
                            <Form.Check 
                                type="checkbox" 
                                label="Create Floor" 
                                name="create_floor" 
                                checked={formData.create_floor === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Update Floor" 
                                name="update_floor" 
                                checked={formData.update_floor === "yes"} 
                                onChange={handleCheckboxChange}
                                />

                                 <Form.Check 
                                type="checkbox" 
                                label="Delete Floor" 
                                name="delete_floor" 
                                checked={formData.delete_floor === "yes"} 
                                onChange={handleCheckboxChange}
                                />
                                
                                 <Form.Check
                                type="checkbox"
                                label="View Floor"
                                name="view_floor"
                                checked={formData.view_floor === "yes"}
                                onChange={handleCheckboxChange}
                                />
                                 </div>
                                 <div className="d-flex flex-column ms-3">
, 
<Form.Check 
                                type="checkbox" 
                                label="Create Space" 
                                name="create_space" 
                                checked={formData.create_space === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Update Space" 
                                name="update_space" 
                                checked={formData.update_space === "yes"} 
                                onChange={handleCheckboxChange}
                                />

                                 <Form.Check 
                                type="checkbox" 
                                label="Delete Space" 
                                name="delete_space" 
                                checked={formData.delete_space === "yes"} 
                                onChange={handleCheckboxChange}
                                />
                                
                                 <Form.Check
                                type="checkbox"
                                label="View Space"
                                name="view_space"
                                checked={formData.view_space === "yes"}
                                onChange={handleCheckboxChange}
                                />
                                 <Form.Check 
                                type="checkbox" 
                                label="Create Booking" 
                                name="create_booking" 
                                checked={formData.create_booking === "yes"} 
                                onChange={handleCheckboxChange} 
                            />
                            <Form.Check 
                                type="checkbox" 
                                label="Update Booking" 
                                name="update_booking" 
                                checked={formData.update_booking === "yes"} 
                                onChange={handleCheckboxChange}
                                />

                                 <Form.Check 
                                type="checkbox" 
                                label="Delete Booking" 
                                name="delete_booking" 
                                checked={formData.delete_booking === "yes"} 
                                onChange={handleCheckboxChange}
                                />
                                
                                 <Form.Check
                                type="checkbox"
                                label="View Booking"
                                name="view_booking"
                                checked={formData.view_booking === "yes"}
                                onChange={handleCheckboxChange}
                                />
                                


                        </div>
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

export default MyRolesRegistrationForm;
