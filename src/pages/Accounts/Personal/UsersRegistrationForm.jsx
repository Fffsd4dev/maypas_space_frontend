import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import TenantSub from "../../subscriptions/TenantSub";
import { useParams } from "react-router-dom";

const UsersRegistrationModal = ({ show, onHide, myUser, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;
    const tenantID = user?.tenant_id;
    console.log(tenantID)
    
    const [formData, setFormData] = useState({
       
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        user_type_id: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (myUser) {
            setFormData({
               
                first_name: myUser.first_name || "",
                last_name: myUser.last_name || "",
                email: myUser.email || "",
                phone: myUser.phone || "",
                user_type_id: myUser.user_type_id || tenantID,
               
            });
        } else {
            setFormData({
                
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                user_type_id: tenantID,
            });
        }
    }, [myUser]);

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
        setErrorMessage("");
        console.log(formData)
        console.log(user?.tenantToken)

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
                setErrorMessage(myUser ? "User updated successfully!" : "myUser registered successfully!");
                setIsError(false);
                setTimeout(() => {
                    onSubmit();
                    onHide();
                }, 2000);
            } else {
                let errorMsg = "An error Occured."; // Default message

                if (result?.errors) {
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
                <Modal.Title>{myUser ? "Edit myUser" : "Add a New myUser"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {errorMessage && (
                    <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
                )}
                <Form onSubmit={handleSubmit}>
  

{/* <Form.Group className="mb-3" controlId="company_no_location">
    <Form.Label>Number of Locations</Form.Label>
    <Form.Control
        type="number"
        name="company_no_location"
        value={formData.user_type_id}
        onChange={handleInputChange}
        required
    />
</Form.Group> */}

{/* <Form.Group className="mb-3" controlId="company_countries">
    <Form.Label>Company Countries</Form.Label>
    <Form.Control
        type="text"
        name="company_countries"
        value={formData.company_countries} // Ensure it's displayed properly
        onChange={handleInputChange}
        required
    />
</Form.Group> */}

{/* Disable all other fields if editing */}
<Form.Group className="mb-3" controlId="first_name">
    <Form.Label>First Name</Form.Label>
    <Form.Control
        type="text"
        name="first_name"
        value={formData.first_name}
        onChange={handleInputChange}
        disabled={!!myUser}  // Disable when editing
    />
</Form.Group>

<Form.Group className="mb-3" controlId="last_name">
    <Form.Label>Last Name</Form.Label>
    <Form.Control
        type="text"
        name="last_name"
        value={formData.last_name}
        onChange={handleInputChange}
        disabled={!!myUser}
    />
</Form.Group>

<Form.Group className="mb-3" controlId="email">
    <Form.Label>Email</Form.Label>
    <Form.Control
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        disabled={!!myUser}
    />
</Form.Group>

<Form.Group className="mb-3" controlId="phone">
    <Form.Label>Phone</Form.Label>
    <Form.Control
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleInputChange}
        disabled={!!myUser}
    />
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






