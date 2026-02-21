import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const TaxesRegistrationModal = ({ show, onHide, tax, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    percentage: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when tax changes
  useEffect(() => {
    if (tax) {
      setFormData({
        name: tax.name || "",
        description: tax.description || "",
        percentage: tax.percentage || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        percentage: "",
      });
    }
  }, [tax]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error("Tax name is required");
      return false;
    }
    if (!formData.percentage || formData.percentage <= 0) {
      toast.error("Please enter a valid percentage (greater than 0)");
      return false;
    }
    if (formData.percentage > 100) {
      toast.error("Percentage cannot exceed 100%");
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

      const url = tax
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/taxes/update/${tax.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/taxes/create`;

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
          tax
            ? "Tax updated successfully!"
            : "Tax created successfully!"
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
  }, [tenantToken, tenantSlug, tax, formData, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {tax ? "Edit Tax" : "Add Tax"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Tax Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., VAT, Sales Tax"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Value Added Tax"
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="percentage">
            <Form.Label>Percentage (%) *</Form.Label>
            <Form.Control
              type="number"
              name="percentage"
              value={formData.percentage}
              onChange={handleInputChange}
              placeholder="e.g., 15"
              min="0.01"
              max="100"
              step="0.01"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
            style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
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
                {tax ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{tax ? "Update" : "Create"} Tax</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TaxesRegistrationModal;