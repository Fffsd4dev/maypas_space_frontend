import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const FloorRegistrationModal = ({ show, onHide, floor, locations = [], onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    location_id: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when floor changes or modal opens/closes
  useEffect(() => {
    if (floor) {
      setFormData({
        name: floor.name || "",
        location_id: floor.location_id || "",
      });
    } else {
      setFormData({
        name: "",
        location_id: "",
      });
    }
  }, [floor, show]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error("Floor name is required");
      return false;
    }
    if (!formData.location_id) {
      toast.error("Please select a location");
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

      const url = floor
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/update/${floor.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/create`;

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
          floor
            ? "Floor updated successfully!"
            : "Floor created successfully!"
        );
        
        // Reset form
        setFormData({
          name: "",
          location_id: "",
        });
        
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
  }, [tenantToken, tenantSlug, floor, formData, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {floor ? "Edit Floor/Section" : "Add a New Floor/Section"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Floor Name/Section Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Ground Floor, Section A"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="location_id">
            <Form.Label>Location *</Form.Label>
            <Form.Select
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">Select a location</option>
              {Array.isArray(locations) && locations.length > 0 ? (
                locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.state}
                  </option>
                ))
              ) : (
                <option value="" disabled>No locations available</option>
              )}
            </Form.Select>
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
                {floor ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{floor ? "Update" : "Create"} Floor</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FloorRegistrationModal;