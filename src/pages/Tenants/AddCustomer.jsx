// import { Modal, Button, Spinner, Alert } from "react-bootstrap";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useForm } from "react-hook-form";
// import { useState, useEffect } from "react";
// import axios from "axios";

// // components
// import { FormInput } from "../../components";

// const AddCustomer = ({ show, onHide }) => {
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   /*
//     Form validation schema
//   */
//   const schema = yup.object().shape({
//     company_name: yup.string().required("Please enter company name"),
//     first_name: yup.string().required("Please enter first name"),
//     last_name: yup.string().required("Please enter last name"),
//     email: yup.string().required("Please enter email").email("Please enter a valid email"),
//     phone: yup.string().required("Please enter phone"),
//     company_no_location: yup.string().required("Please enter company location"),
//     company_countries: yup.string().required("Please enter at least one country"),
//   });

//   const {
//     handleSubmit,
//     register,
//     formState: { errors },
//     reset,
//   } = useForm({ resolver: yupResolver(schema) });

//   // Reset form when modal is closed
//   useEffect(() => {
//     if (!show) {
//       reset(); // Clears form state
//       setErrorMessage(""); // Clears any previous errors
//     }
//   }, [show, reset]);

//   const onSubmit = async (data) => {
//     setLoading(true);
//     setErrorMessage("");

//     try {
//       const payload = {
//         company_name: data.company_name,
//         first_name: data.first_name,
//         last_name: data.last_name,
//         email: data.email,
//         phone: data.phone,
//         company_no_location: data.company_no_location,
//         company_countries: data.company_countries.split(",").map((c) => c.trim()), // Convert string to array
//       };

//       const response = await axios.post("https://trial.maypasworkspace.com/system-admin/register-workspace", payload);

//       console.log(payload)

//       if (response.status === 201 || response.status === 200) {
//         alert("Workspace created successfully!");
//         reset(); // Clear the form
//         onHide(); // Close the modal
//       }
//     } catch (error) {
//       console.error("Error creating workspace:", error);
//       setErrorMessage(error.response?.data?.message || "Failed to create workspace. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide} aria-labelledby="contained-modal-title-vcenter" centered>
//       <Modal.Header className="bg-light" closeButton>
//         <Modal.Title className="m-0">Add New Workspace</Modal.Title>
//       </Modal.Header>
//       <Modal.Body className="p-4">
//         {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

//         <form onSubmit={handleSubmit(onSubmit)}>
//           <FormInput
//             label="Company Name"
//             type="text"
//             name="company_name"
//             placeholder="Enter company name"
//             containerClass="mb-3"
//             register={register}
//             error={errors.company_name?.message}
//             className={errors.company_name ? "is-invalid" : ""}
//           />
//           <FormInput
//             label="First Name"
//             type="text"
//             name="first_name"
//             placeholder="Enter first name"
//             containerClass="mb-3"
//             register={register}
//             error={errors.first_name?.message}
//             className={errors.first_name ? "is-invalid" : ""}
//           />
//           <FormInput
//             label="Last Name"
//             type="text"
//             name="last_name"
//             placeholder="Enter last name"
//             containerClass="mb-3"
//             register={register}
//             error={errors.last_name?.message}
//             className={errors.last_name ? "is-invalid" : ""}
//           />
//           <FormInput
//             label="Email address"
//             type="email"
//             name="email"
//             placeholder="Enter email"
//             containerClass="mb-3"
//             register={register}
//             error={errors.email?.message}
//             className={errors.email ? "is-invalid" : ""}
//           />
//           <FormInput
//             label="Phone"
//             type="text"
//             name="phone"
//             placeholder="Enter phone number"
//             containerClass="mb-3"
//             register={register}
//             error={errors.phone?.message}
//             className={errors.phone ? "is-invalid" : ""}
//           />
//           <FormInput
//             label="Company Location"
//             type="text"
//             name="company_no_location"
//             placeholder="Enter company location"
//             containerClass="mb-3"
//             register={register}
//             error={errors.company_no_location?.message}
//             className={errors.company_no_location ? "is-invalid" : ""}
//           />
//           <FormInput
//             label="Company Countries"
//             type="text"
//             name="company_countries"
//             placeholder="Enter countries (comma-separated)"
//             containerClass="mb-3"
//             register={register}
//             error={errors.company_countries?.message}
//             className={errors.company_countries ? "is-invalid" : ""}
//           />

//           <div className="text-end">
//             <Button variant="success" type="submit" className="waves-effect waves-light" disabled={loading}>
//               {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
//             </Button>
//           </div>
//         </form>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default AddCustomer;





import React, { useState } from "react";
import { Button, Form, Container, Alert } from "react-bootstrap";

const WorkspaceRegistrationForm = () => {
  // State to manage form inputs
  const [formData, setFormData] = useState({
    company_name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_no_location: "",
    company_countries: "",
  });

  // State to handle API response messages
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://trial.maypasworkspace.com/system-admin/register-workspace",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage("Workspace registered successfully!");
        setIsError(false);
      } else {
        setMessage(result.message || "Failed to register workspace.");
        setIsError(true);
      }
    } catch (error) {
      setMessage("An error occurred while submitting the form.");
      setIsError(true);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Register Workspace</h2>
      {message && (
        <Alert variant={isError ? "danger" : "success"}>{message}</Alert>
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
            value={formData.company_countries}
            onChange={handleInputChange}
            placeholder="Enter countries (comma-separated)"
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default WorkspaceRegistrationForm;