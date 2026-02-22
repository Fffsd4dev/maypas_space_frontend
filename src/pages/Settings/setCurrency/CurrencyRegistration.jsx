import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const CurrencyRegistrationModal = ({ show, onHide, currency, locations = [], onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    location_id: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when currency changes
  useEffect(() => {
    if (currency) {
      setFormData({
        name: currency.name || "",
        symbol: currency.symbol || "",
        location_id: currency.location_id || "",
      });
    } else {
      setFormData({
        name: "",
        symbol: "",
        location_id: "",
      });
    }
  }, [currency]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.location_id) {
      toast.error("Please select a location");
      return false;
    }
    if (!formData.name.trim()) {
      toast.error("Currency name is required");
      return false;
    }
    if (!formData.symbol.trim()) {
      toast.error("Currency symbol is required");
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

      const url = currency
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/currencies/update/${currency.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/currencies/create`;

      const payload = {
        name: formData.name,
        symbol: formData.symbol,
        tenant_id: user?.tenant_id,
        location_id: formData.location_id,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          currency
            ? "Currency updated successfully!"
            : "Currency created successfully!"
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
  }, [tenantToken, tenantSlug, currency, formData, user?.tenant_id, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {currency ? "Edit Currency" : "Add Currency"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="location_id">
            <Form.Label>Location *</Form.Label>
            <Form.Select
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              required
              disabled={isLoading || currency} // Disable when editing
            >
              <option value="">Select a location</option>
              {locations.length > 0 ? (
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

          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Currency Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., US Dollar, Nigerian Naira"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="symbol">
            <Form.Label>Currency Symbol *</Form.Label>
            <Form.Control
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              placeholder="e.g., $, ₦, €"
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
                {currency ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{currency ? "Update" : "Create"} Currency</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CurrencyRegistrationModal;