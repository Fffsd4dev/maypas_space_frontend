import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const UsersRegistrationModal = ({ show, onHide, myUser, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const { colour: primary } = useLogoColor();

  // Refs
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    user_type_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (myUser) {
      setFormData({
        first_name: myUser.first_name || "",
        last_name: myUser.last_name || "",
        email: myUser.email || "",
        phone: myUser.phone || "",
        user_type_id: myUser.user_type_id || "",
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        user_type_id: "",
      });
    }
  }, [myUser, show]);

  // Fetch roles when modal opens
  const fetchRoles = useCallback(async () => {
    // Prevent duplicate fetches
    if (isFetching.current || !tenantToken || !tenantSlug) return;
    
    isFetching.current = true;
    setRolesLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/usertype/list-user-types`,
        {
          headers: { 
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const result = await response.json();
      
      if (isMounted.current && response.ok) {
        setRoles(result.data?.data || []);
      } else if (isMounted.current) {
        throw new Error(result.message || "Failed to fetch roles.");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setRolesLoading(false);
      }
      isFetching.current = false;
    }
  }, [tenantToken, tenantSlug]);

  useEffect(() => {
    if (show && tenantToken && tenantSlug) {
      fetchRoles();
    }
  }, [show, tenantToken, tenantSlug, fetchRoles]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.first_name.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!formData.last_name.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!formData.user_type_id) {
      toast.error("Role is required");
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
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

      const url = myUser
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/update-user/${myUser.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/add-user`;

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
          myUser
            ? "User updated successfully!"
            : "User registered successfully!"
        );
        
        // Call onSubmit and close modal after success
        if (onSubmit) {
          await onSubmit();
        }
        
        // Small delay to show success message before closing
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
  }, [myUser, tenantToken, tenantSlug, formData, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>{myUser ? "Edit User" : "Add a New User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {rolesLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
            <p className="mt-2 mb-0">Loading roles...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="first_name">
              <Form.Label>First Name *</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter first name"
                required
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="last_name">
              <Form.Label>Last Name *</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter last name"
                required
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="user_type_id">
              <Form.Label>Role *</Form.Label>
              <Form.Select
                name="user_type_id"
                value={formData.user_type_id}
                onChange={handleInputChange}
                required
                disabled={isLoading || rolesLoading}
              >
                <option value="">Select a role</option>
                {Array.isArray(roles) &&
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.user_type}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading || rolesLoading}
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
                  {myUser ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{myUser ? "Update" : "Create"} User</>
              )}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default UsersRegistrationModal;