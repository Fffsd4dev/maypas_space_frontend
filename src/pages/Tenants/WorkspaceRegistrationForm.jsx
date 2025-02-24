// import React, { useState } from "react";
// import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
// import { useAuthContext } from '@/context/useAuthContext.jsx';

// const WorkspaceRegistrationModal = ({ show, onHide }) => {
//     const { user } = useAuthContext(); // Get the auth token from context
//       console.log("Auth Token:", user?.token);
//   // State to manage form inputs
//   const [formData, setFormData] = useState({
//     company_name: "",
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone: "",
//     company_no_location: "",
//     company_countries: "",
//   });

//   // State to handle API response messages
//   const [errorMessage, setErrorMessage] = useState("");
//   const [isError, setIsError] = useState(false);

//   // State to handle loading
//   const [isLoading, setIsLoading] = useState(false);

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true); // Start loading
//     setErrorMessage(""); // Clear previous error messages

//     try {
//     //   const token = localStorage.getItem("authToken"); // Get the authorization token from localStorage (or context/state)
//       if (!user?.token) {
//         throw new Error("Authorization token is missing.");
//       }

//       const response = await fetch(
//         "https://trial.maypasworkspace.com/system-admin/register-workspace",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${user?.token}`, // Add authorization header
//           },
//           body: JSON.stringify(formData),
//         }
//       );

//       const result = await response.json();
//       console.log(result)

//       if (response.ok) {
//         setErrorMessage("Workspace registered successfully!");
//         setIsError(false);
//         // Optionally, you can close the modal after successful submission
//         setTimeout(() => onHide(), 2000); // Close modal after 2 seconds
//       } else {
//         setErrorMessage(result.message || "Failed to register workspace.");
//         setIsError(true);
//       }
//     } catch (error) {
//       setErrorMessage(
//         error.message || "An error occurred while submitting the form."
//       );
//       setIsError(true);
//     } finally {
//       setIsLoading(false); // Stop loading
//     }
//   };

//   return (
//     <Modal
//       show={show}
//       onHide={onHide}
//       aria-labelledby="contained-modal-title-vcenter"
//       centered
//     >
//       <Modal.Header className="bg-light" closeButton>
//         <Modal.Title className="m-0">Add New Workspace</Modal.Title>
//       </Modal.Header>
//       <Modal.Body className="p-4">
//         {errorMessage && (
//           <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
//         )}
//         <Form onSubmit={handleSubmit}>
//           <Form.Group className="mb-3" controlId="company_name">
//             <Form.Label>Company Name</Form.Label>
//             <Form.Control
//               type="text"
//               name="company_name"
//               value={formData.company_name}
//               onChange={handleInputChange}
//               placeholder="Enter company name"
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="first_name">
//             <Form.Label>First Name</Form.Label>
//             <Form.Control
//               type="text"
//               name="first_name"
//               value={formData.first_name}
//               onChange={handleInputChange}
//               placeholder="Enter first name"
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="last_name">
//             <Form.Label>Last Name</Form.Label>
//             <Form.Control
//               type="text"
//               name="last_name"
//               value={formData.last_name}
//               onChange={handleInputChange}
//               placeholder="Enter last name"
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="email">
//             <Form.Label>Email</Form.Label>
//             <Form.Control
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               placeholder="Enter email"
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="phone">
//             <Form.Label>Phone</Form.Label>
//             <Form.Control
//               type="tel"
//               name="phone"
//               value={formData.phone}
//               onChange={handleInputChange}
//               placeholder="Enter phone number"
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="company_no_location">
//             <Form.Label>Number of Locations</Form.Label>
//             <Form.Control
//               type="number"
//               name="company_no_location"
//               value={formData.company_no_location}
//               onChange={handleInputChange}
//               placeholder="Enter number of locations"
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3" controlId="company_countries">
//             <Form.Label>Company Countries</Form.Label>
//             <Form.Control
//               type="text"
//               name="company_countries"
//               value={formData.company_countries}
//               onChange={handleInputChange}
//               placeholder="Enter countries (comma-separated)"
//               required
//             />
//           </Form.Group>

//           <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
//             {isLoading ? (
//               <>
//                 <Spinner
//                   as="span"
//                   animation="border"
//                   size="sm"
//                   role="status"
//                   aria-hidden="true"
//                 />{" "}
//                 Submitting...
//               </>
//             ) : (
//               "Submit"
//             )}
//           </Button>
//         </Form>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default WorkspaceRegistrationModal;






import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";

const WorkspaceRegistrationModal = ({ show, onHide }) => {
    const { user } = useAuthContext(); // Get the auth token from context

    // State to manage form inputs
    const [formData, setFormData] = useState({
        company_name: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company_no_location: "",
        company_countries: [],
    });

    // State to handle API response messages
    const [errorMessage, setErrorMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // State to handle loading
    const [isLoading, setIsLoading] = useState(false);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "company_countries" ? value.split(",").map(c => c.trim()) : value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading
        setErrorMessage(""); // Clear previous error messages

        try {
            if (!user?.token) {
                throw new Error("Authorization token is missing.");
            }

            const response = await fetch(
                "https://trial.maypasworkspace.com/api/system-admin/register-workspace",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user?.token}`, // Add authorization header
                    },
                    body: JSON.stringify({
                        ...formData,
                        company_countries: formData.company_countries.filter(c => c), // Remove empty values
                    }),
                }
            );

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                setErrorMessage("Workspace registered successfully!");
                setIsError(false);
                setFormData({ // Reset form after success
                    company_name: "",
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                    company_no_location: "",
                    company_countries: [],
                });
                setTimeout(() => onHide(), 2000); // Close modal after 2 seconds
            } else {
                setErrorMessage(result?.message || result?.error || "Failed to register workspace.");
                setIsError(true);
            }
        } catch (error) {
            setErrorMessage(error.message || "An error occurred while submitting the form.");
            setIsError(true);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header className="bg-light" closeButton>
                <Modal.Title className="m-0">Add New Workspace</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {errorMessage && (
                    <Alert variant={isError ? "danger" : "success"}>{errorMessage}</Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="company_name">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            placeholder="Enter company name"
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
                            placeholder="Enter first name"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="last_name">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            placeholder="Enter last name"
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

                    <Form.Group className="mb-3" controlId="phone">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            pattern="^\+?[0-9]{7,15}$"
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
                            placeholder="Enter number of locations"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="company_countries">
                        <Form.Label>Company Countries</Form.Label>
                        <Form.Control
                            type="text"
                            name="company_countries"
                            value={formData.company_countries.join(", ")} // Convert array to string for display
                            onChange={handleInputChange}
                            placeholder="Enter countries (comma-separated)"
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

export default WorkspaceRegistrationModal;
