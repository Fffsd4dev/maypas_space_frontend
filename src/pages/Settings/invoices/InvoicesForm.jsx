import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InvoicesModal = ({ show, onHide, bankAccount, onSubmit, locations = [] }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    location_id: "",
    bank_name: "",
    account_number: "",
    account_name: "" 
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when bankAccount changes or modal closes
  useEffect(() => {
    if (bankAccount) {
      setFormData({
        location_id: bankAccount.location_id || "",
        bank_name: bankAccount.bank_name || "",
        account_number: bankAccount.account_number || "",
        account_name: bankAccount.account_name || "",
      });
    } else {
      setFormData({
        location_id: "",
        bank_name: "",
        account_number: "",
        account_name: ""
      });
    }
  }, [bankAccount, show]);

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
    if (!formData.bank_name.trim()) {
      toast.error("Bank name is required");
      return false;
    }
    if (!formData.account_number.trim()) {
      toast.error("Account number is required");
      return false;
    }
    if (!formData.account_name.trim()) {
      toast.error("Account name is required");
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

      const url = bankAccount
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/bank/update/${bankAccount.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/bank/create`;

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
          bankAccount
            ? "Bank details updated successfully!"
            : "Bank details added successfully!"
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
  }, [tenantToken, tenantSlug, bankAccount, formData, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {bankAccount ? "Edit Bank Details" : "Add Bank Details"}
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
              disabled={isLoading || bankAccount} // Disable when editing
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

          <Form.Group className="mb-3" controlId="bank_name">
            <Form.Label>Bank Name *</Form.Label>
            <Form.Control
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange}
              placeholder="Enter bank name"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="account_number">
            <Form.Label>Account Number *</Form.Label>
            <Form.Control
              type="text"
              name="account_number"
              value={formData.account_number}
              onChange={handleInputChange}
              placeholder="Enter account number"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="account_name">
            <Form.Label>Account Name *</Form.Label>
            <Form.Control
              type="text"
              name="account_name"
              value={formData.account_name}
              onChange={handleInputChange}
              placeholder="Enter account name"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
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
                {bankAccount ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{bankAccount ? "Update" : "Add"} Bank Details</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default InvoicesModal;