import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const PaystackRegistrationModal = ({ show, onHide, paystackKey, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    key: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when paystackKey changes
  useEffect(() => {
    if (paystackKey) {
      setFormData({
        key: paystackKey.key || "",
      });
    } else {
      setFormData({
        key: "",
      });
    }
  }, [paystackKey]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.key.trim()) {
      toast.error("Paystack secret key is required");
      return false;
    }
    // Basic validation for Paystack key format (starts with sk_ or pk_)
    if (!formData.key.startsWith("sk_") && !formData.key.startsWith("pk_")) {
      toast.warning("Paystack keys usually start with 'sk_' or 'pk_'");
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (!tenantToken) throw new Error("Authorization token is missing.");

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/savepaystackkey`;

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
        toast.success("Paystack key saved successfully!");
        
        // Call onSubmit callback
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
  }, [tenantToken, tenantSlug, formData, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {paystackKey ? "Update Paystack Key" : "Add Paystack Secret Key"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="key">
            <Form.Label>Paystack Secret Key *</Form.Label>
            <Form.Control
              type="password"
              name="key"
              value={formData.key}
              onChange={handleInputChange}
              placeholder="Enter your Paystack secret key (sk_live_...)"
              required
              disabled={isLoading}
            />
            <Form.Text className="text-muted">
              Your secret key is stored securely and used for payment processing.
            </Form.Text>
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
                Saving...
              </>
            ) : (
              "Save Paystack Key"
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PaystackRegistrationModal;