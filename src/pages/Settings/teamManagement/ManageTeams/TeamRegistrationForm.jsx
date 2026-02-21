import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../../context/LogoColorContext";

const TeamsRegistrationModal = ({ show, onHide, team, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [formData, setFormData] = useState({
    company: "",
    department: "",
    description: "",
    manager: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when team changes
  useEffect(() => {
    if (team) {
      setFormData({
        company: team.company || "",
        department: team.department || "",
        description: team.description || "",
        manager: team.manager?.id || team.manager || "",
      });
    } else {
      setFormData({
        company: "",
        department: "",
        description: "",
        manager: "",
      });
    }
  }, [team]);

  const fetchUsers = useCallback(async () => {
    if (!tenantToken || !tenantSlug) return;
    
    setLoadingUsers(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-users?per_page=100`,
        {
          headers: { Authorization: `Bearer ${tenantToken}` },
        }
      );
      const result = await response.json();
      
      if (isMounted.current && response.ok) {
        setUsers(result.data?.data || []);
      } else if (isMounted.current) {
        throw new Error(result.message || "Failed to fetch users.");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoadingUsers(false);
      }
    }
  }, [tenantToken, tenantSlug]);

  // Fetch users when modal opens
  useEffect(() => {
    if (show && tenantToken && tenantSlug) {
      fetchUsers();
    }
  }, [show, tenantToken, tenantSlug, fetchUsers]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.company.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!formData.department.trim()) {
      toast.error("Department is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.manager) {
      toast.error("Please select a manager");
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

      const url = team
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/update/${team.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/create`;

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
          team
            ? "Team updated successfully!"
            : "Team created successfully!"
        );
        
        // Reset form
        setFormData({
          company: "",
          department: "",
          description: "",
          manager: "",
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
  }, [tenantToken, tenantSlug, team, formData, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {team ? "Edit Team" : "Add a New Team"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="company">
            <Form.Label>Company *</Form.Label>
            <Form.Control
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Enter company name"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="department">
            <Form.Label>Department *</Form.Label>
            <Form.Control
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Enter department name"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter team description"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="manager">
            <Form.Label>Manager *</Form.Label>
            {loadingUsers ? (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading users...</span>
              </div>
            ) : (
              <Form.Select
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Select a manager</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} - {user.email}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading || loadingUsers}
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
                {team ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{team ? "Update" : "Create"} Team</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TeamsRegistrationModal;