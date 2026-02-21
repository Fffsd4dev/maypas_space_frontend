import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";

const LocationRegistrationModal = ({ show, onHide, location, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when location changes or modal opens/closes
  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || "",
        state: location.state || "",
        address: location.address || "",
      });
    } else {
      setFormData({
        name: "",
        state: "",
        address: "",
      });
    }
  }, [location, show]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error("Location name is required");
      return false;
    }
    if (!formData.state.trim()) {
      toast.error("State is required");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (!tenantToken) throw new Error("Authorization token is missing.");

      const url = location
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/update/${location.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/create`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantToken}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          location
            ? "Location updated successfully!"
            : "Location created successfully!"
        );
        
        // Call onSubmit to refresh the list
        if (onSubmit) {
          await onSubmit();
        }
        
        // Close modal after success
        setTimeout(() => {
          if (isMounted.current) {
            onHide();
          }
        }, 1500);
      } else {
        let errorMsg = "An error occurred.";

        if (result?.errors) {
          errorMsg = Object.values(result.errors).flat().join("\n");
        } else if (result?.message) {
          errorMsg = result.message;
        }

        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred. Contact Admin");
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [tenantToken, tenantSlug, location, formData, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {location ? "Edit Location" : "Add a New Location"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Location Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter location name"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="state">
            <Form.Label>State *</Form.Label>
            <Form.Control
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="Enter state"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter full address"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
            style={{
              backgroundColor: primary,
              borderColor: primary,
              color: "#fff",
            }}
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {location ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{location ? "Update" : "Create"} Location</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LocationRegistrationModal;