import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const MyRolesRegistrationForm = ({ show, onHide, selectedRole }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    user_type: "",
    create_admin: "no",
    update_admin: "no",
    delete_admin: "no",
    view_admin: "no",
    create_user: "no",
    update_user: "no",
    delete_user: "no",
    view_user: "no",
    create_location: "no",
    update_location: "no",
    delete_location: "no",
    view_location: "no",
    create_floor: "no",
    update_floor: "no",
    delete_floor: "no",
    view_floor: "no",
    create_space: "no",
    update_space: "no",
    delete_space: "no",
    view_space: "no",
    create_booking: "no",
    update_booking: "no",
    delete_booking: "no",
    view_booking: "no",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (selectedRole) {
      setFormData({
        user_type: selectedRole.user_type || "",
        create_admin: selectedRole.create_admin || "no",
        update_admin: selectedRole.update_admin || "no",
        delete_admin: selectedRole.delete_admin || "no",
        view_admin: selectedRole.view_admin || "no",
        create_user: selectedRole.create_user || "no",
        update_user: selectedRole.update_user || "no",
        delete_user: selectedRole.delete_user || "no",
        view_user: selectedRole.view_user || "no",
        create_location: selectedRole.create_location || "no",
        update_location: selectedRole.update_location || "no",
        delete_location: selectedRole.delete_location || "no",
        view_location: selectedRole.view_location || "no",
        create_floor: selectedRole.create_floor || "no",
        update_floor: selectedRole.update_floor || "no",
        delete_floor: selectedRole.delete_floor || "no",
        view_floor: selectedRole.view_floor || "no",
        create_space: selectedRole.create_space || "no",
        update_space: selectedRole.update_space || "no",
        delete_space: selectedRole.delete_space || "no",
        view_space: selectedRole.view_space || "no",
        create_booking: selectedRole.create_booking || "no",
        update_booking: selectedRole.update_booking || "no",
        delete_booking: selectedRole.delete_booking || "no",
        view_booking: selectedRole.view_booking || "no",
      });
    } else {
      setFormData({
        user_type: "",
        create_admin: "no",
        update_admin: "no",
        delete_admin: "no",
        view_admin: "no",
        create_user: "no",
        update_user: "no",
        delete_user: "no",
        view_user: "no",
        create_location: "no",
        update_location: "no",
        delete_location: "no",
        view_location: "no",
        create_floor: "no",
        update_floor: "no",
        delete_floor: "no",
        view_floor: "no",
        create_space: "no",
        update_space: "no",
        delete_space: "no",
        view_space: "no",
        create_booking: "no",
        update_booking: "no",
        delete_booking: "no",
        view_booking: "no",
      });
    }
  }, [selectedRole]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked ? "yes" : "no" }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.user_type.trim()) {
      toast.error("Role name is required");
      return false;
    }
    return true;
  }, [formData.user_type]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (!tenantToken) throw new Error("Authorization token is missing.");

      const endpoint = selectedRole
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/usertype/update/${selectedRole.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/usertype/create`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantToken}`, // Fixed: using tenantToken
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          selectedRole
            ? "Role updated successfully!"
            : "Role created successfully!"
        );
        
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
      toast.error("An error occurred. Contact Admin");
      console.error("Submission error:", error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [tenantToken, tenantSlug, selectedRole, formData, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {selectedRole ? "Edit Role" : "Add New Role"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="user_type">
            <Form.Label>Role Name *</Form.Label>
            <Form.Control
              type="text"
              name="user_type"
              value={formData.user_type}
              onChange={handleInputChange}
              placeholder="Enter role name"
              required
              disabled={isLoading}
            />
          </Form.Group>

          {/* Permissions */}
          <Form.Group className="mb-3">
            <Form.Label>Permissions</Form.Label>
            <div className="d-flex flex-row flex-wrap">
              <div className="d-flex flex-column me-3">
                <Form.Check
                  type="checkbox"
                  label="Create Admin"
                  name="create_admin"
                  checked={formData.create_admin === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Update Admin"
                  name="update_admin"
                  checked={formData.update_admin === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Delete Admin"
                  name="delete_admin"
                  checked={formData.delete_admin === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="View Admin"
                  name="view_admin"
                  checked={formData.view_admin === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Create User"
                  name="create_user"
                  checked={formData.create_user === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Update User"
                  name="update_user"
                  checked={formData.update_user === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Delete User"
                  name="delete_user"
                  checked={formData.delete_user === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="View User"
                  name="view_user"
                  checked={formData.view_user === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
              </div>
              <div className="d-flex flex-column me-3">
                <Form.Check
                  type="checkbox"
                  label="Create Location"
                  name="create_location"
                  checked={formData.create_location === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Update Location"
                  name="update_location"
                  checked={formData.update_location === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Delete Location"
                  name="delete_location"
                  checked={formData.delete_location === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="View Location"
                  name="view_location"
                  checked={formData.view_location === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Create Floor"
                  name="create_floor"
                  checked={formData.create_floor === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Update Floor"
                  name="update_floor"
                  checked={formData.update_floor === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Delete Floor"
                  name="delete_floor"
                  checked={formData.delete_floor === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="View Floor"
                  name="view_floor"
                  checked={formData.view_floor === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
              </div>
              <div className="d-flex flex-column">
                <Form.Check
                  type="checkbox"
                  label="Create Space"
                  name="create_space"
                  checked={formData.create_space === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Update Space"
                  name="update_space"
                  checked={formData.update_space === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Delete Space"
                  name="delete_space"
                  checked={formData.delete_space === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="View Space"
                  name="view_space"
                  checked={formData.view_space === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Create Booking"
                  name="create_booking"
                  checked={formData.create_booking === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Update Booking"
                  name="update_booking"
                  checked={formData.update_booking === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="Delete Booking"
                  name="delete_booking"
                  checked={formData.delete_booking === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Form.Check
                  type="checkbox"
                  label="View Booking"
                  name="view_booking"
                  checked={formData.view_booking === "yes"}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </Form.Group>

          <Button
            style={{
              backgroundColor: primary,
              borderColor: primary,
              color: "#fff",
            }}
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
                {selectedRole ? "Updating..." : "Creating..."}
              </>
            ) : (
              selectedRole ? "Update Role" : "Create Role"
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MyRolesRegistrationForm;