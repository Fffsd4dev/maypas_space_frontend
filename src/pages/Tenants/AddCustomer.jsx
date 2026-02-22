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
        `${import.meta.env.VITE_BACKEND_URL}/system-admin/register-workspace`,
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