import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../../context/LogoColorContext";

const MemberRegistrationModal = ({ show, onHide, member, teams = [], onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [formData, setFormData] = useState({
    user_id: "",
    team_id: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        user_id: member.user_id || "",
        team_id: member.team_id || "",
      });
    } else {
      setFormData({
        user_id: "",
        team_id: "",
      });
    }
  }, [member]);

  // Fetch users when modal opens
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
    if (!formData.team_id) {
      toast.error("Please select a team");
      return false;
    }
    if (!formData.user_id) {
      toast.error("Please select a user");
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

      const url = member
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/update/${member.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/add-member`;

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
          member
            ? "Member updated successfully!"
            : "Member added successfully!"
        );
        
        // Reset form
        setFormData({
          user_id: "",
          team_id: "",
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
  }, [tenantToken, tenantSlug, member, formData, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {member ? "Edit Team Member" : "Add Member to Team"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="team_id">
            <Form.Label>Team *</Form.Label>
            <Form.Select
              name="team_id"
              value={formData.team_id}
              onChange={handleInputChange}
              required
              disabled={isLoading || member} // Disable when editing
            >
              <option value="">Select a Team</option>
              {teams.length > 0 ? (
                teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.company} - {team.department}
                  </option>
                ))
              ) : (
                <option value="" disabled>No teams available</option>
              )}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="user_id">
            <Form.Label>User *</Form.Label>
            {loadingUsers ? (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading users...</span>
              </div>
            ) : (
              <Form.Select
                name="user_id"
                value={formData.user_id}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Select a User</option>
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
                {member ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{member ? "Update" : "Add"} Member</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MemberRegistrationModal;