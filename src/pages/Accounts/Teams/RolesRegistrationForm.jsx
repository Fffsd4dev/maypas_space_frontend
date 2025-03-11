
// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
// import { useAuthContext } from "@/context/useAuthContext.jsx";

// const RolesRegistrationForm = ({ show, onHide, selectedAdmin }) => {
//     const { user } = useAuthContext();

//     // State for form inputs
//     const [formData, setFormData] = useState({
//         first_name: "",
//         last_name: "",
//         email: "",
//         role_id: "",
//     });

//     // State for roles
//     const [roles, setRoles] = useState([]);
//     const [errorMessage, setErrorMessage] = useState("");
//     const [isError, setIsError] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);

//     // Pre-fill form if editing
//     useEffect(() => {
//         if (selectedAdmin) {
//             setFormData({
//                 first_name: selectedAdmin.first_name,
//                 last_name: selectedAdmin.last_name,
//                 email: selectedAdmin.email,
//                 role_id: selectedAdmin.role_id || "",
//             });
//         } else {
//             setFormData({ first_name: "", last_name: "", email: "", role_id: "" });
//         }
//     }, [selectedAdmin]);

//     // Fetch roles when modal opens
//     useEffect(() => {
//         if (show && user?.token) {
//             const fetchRoles = async () => {
//                 try {
//                     const response = await fetch("https://trial.maypasworkspace.com/api/system-admin/view-roles", {
//                         headers: { Authorization: `Bearer ${user.token}` },
//                     });
//                     const result = await response.json();
//                     if (response.ok) {
//                         setRoles(result.data);
//                     } else {
//                         throw new Error(result.message || "Failed to fetch roles.");
//                     }
//                 } catch (error) {
//                     setErrorMessage(error.message);
//                     setIsError(true);
//                 }
//             };
//             fetchRoles();
//         }
//     }, [show, user?.token]);

//     // Handle form input changes
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setErrorMessage("");

//         try {
//             if (!user?.token) throw new Error("Authorization token is missing.");

//             const endpoint = selectedAdmin
//                 ? `https://trial.maypasworkspace.com/api/system-admin/update-role/${selectedAdmin.id}`
//                 : "https://trial.maypasworkspace.com/api/system-admin/create-role";
            
//             const method = selectedAdmin ? "POST" : "POST";
            
//             const response = await fetch(endpoint, {
//                 method,
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${user.token}`,
//                 },
//                 body: JSON.stringify(formData),
//             });

//             const result = await response.json();

//             if (response.ok) {
//                 setErrorMessage(selectedAdmin ? "Admin updated successfully!" : "Admin registered successfully!");
//                 setIsError(false);
//                 setTimeout(() => onHide(), 2000);
//             } else {
//                 setErrorMessage(result.message || "Failed to submit form.");
//                 setIsError(true);
//             }
//         } catch (error) {
//             setErrorMessage(error.message || "An error occurred while submitting the form.");
//             setIsError(true);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <Modal show={show} onHide={onHide} centered>
//             <Modal.Header className="bg-light" closeButton>
//                 <Modal.Title>{selectedAdmin ? "Edit Role" : "Add New Role"}</Modal.Title>
//             </Modal.Header>
//             <Modal.Body className="p-4">
//                 {errorMessage && (
//                     <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
//                 )}
//                 <Form onSubmit={handleSubmit}>
//                     <Form.Group className="mb-3" controlId="first_name">
//                         <Form.Label>First Name</Form.Label>
//                         <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="last_name">
//                         <Form.Label>Last Name</Form.Label>
//                         <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="email">
//                         <Form.Label>Email</Form.Label>
//                         <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required />
//                     </Form.Group>

//                     <Form.Group className="mb-3" controlId="role_id">
//                         <Form.Label>Role</Form.Label>
//                         <Form.Select name="role_id" value={formData.role_id} onChange={handleInputChange} required>
//                             <option value="">Select a role</option>
//                             {roles.map((role) => (
//                                 <option key={role.id} value={role.id}>{role.role}</option>
//                             ))}
//                         </Form.Select>
//                     </Form.Group>

//                     <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
//                         {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Submit"}
//                     </Button>
//                 </Form>
//             </Modal.Body>
//         </Modal>
//     );
// };

// export default RolesRegistrationForm;






import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";

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
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [isError, setIsError] = useState(false);
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
            });
        } else {
            setFormData({
                role: "",
                create_tenant: "no",
                update_tenant: "no",
                delete_tenant: "no",
                view_tenant: "no",
                view_tenant_income: "no",
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
                setErrorMessage(selectedAdmin ? "Role updated successfully!" : "Role created successfully!");
                setIsError(false);
                setTimeout(() => onHide(), 2000);
            } else {
                setErrorMessage(result.message || "Failed to submit form.");
                setIsError(true);
            }
        } catch (error) {
            setErrorMessage(error.message || "An error occurred while submitting the form.");
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
