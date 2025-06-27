import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../../context/LogoColorContext";

const TeamsRegistrationModal = ({ show, onHide, myTeams, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [floorData, setFloorData] = useState([]);
  const [selectedLocation, setSelectedUser] = useState(null);
  const [isLocationName, setIsUserName] = useState("");

  const [formData, setFormData] = useState({
    company: "",
    department: "",
    description: "",
    manager: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (myTeams) {
      setFormData({
        company: myTeams.company || "",
        department: myTeams.department || "",
        description: myTeams.description || "",
        manager: myTeams.manager || "",
      });
    } else {
      setFormData({
        company: "",
        department: "",
        description: "",
        manager: "",
      });
    }
  }, [myTeams]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-users`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        console.log("Users:", result.data.data);
        setUsers(result.data.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch users.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (show && user?.tenantToken) {
      fetchUsers();
    }
  }, [show, user?.tenantToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const managerId = e.target.value;
    setSelectedUser(managerId);
    setFormData((prev) => ({
      ...prev,
      manager: managerId,
    }));
  };

  useEffect(() => {
    users.map((user) => {
      if (user.id === myTeams?.manager) {
        setSelectedUser(user.id);
        setIsUserName(user.name);
      }
    });
  }, [user?.tenantToken, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(formData);
    console.log(user?.tenantToken);

    try {
      if (!user?.tenantToken)
        throw new Error("Authorization token is missing.");

      const url = myTeams
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/update/${
            myTeams.id
          }`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/create`;

      const method = myTeams ? "POST" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.tenantToken}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        toast.success(
          myTeams
            ? "Team updated successfully!"
            : "Team registered successfully!"
        );
        setFormData({
          company: "",
          department: "",
          description: "",
          manager: "",
        });
        setTimeout(() => {
          onSubmit();
          onHide();
        }, 1000);
      } else {
        let errorMsg = "An error occurred.";

        if (result?.errors) {
          errorMsg = Object.values(result.errors).flat().join("\n");
        } else if (result?.message) {
          errorMsg = result.message;
        }

        toast.error(errorMsg);
        console.log(result);
      }
    } catch (error) {
      toast.error("An error occurred. Contact Admin");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>{myTeams ? "Team" : "Add a New Team"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Company</Form.Label>
            <Form.Control
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Name "
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Department</Form.Label>
            <Form.Control
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Department "
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="textbox"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description "
              required
            />
          </Form.Group>

          <div>
            <Form.Group className="mb-3" controlId="manager">
              <Form.Label>Manager</Form.Label>
              <Form.Select
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a user</option>
                {Array.isArray(users) &&
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            {/* {myTeams ? (
                            <>
                                <Form.Label>
                                    Select the user you want to add the Room/Space Category.
                                </Form.Label>
                                <Form.Select
                                    style={{ marginBottom: "25px", fontSize: "1rem" }}
                                    value={selectedLocation || ""}
                                    onChange={handleLocationChange}
                                    required
                                >
                                    <option disabled value={formData.manager}>
                                        {isLocationName}
                                    </option>
                                </Form.Select>
                            </>
                        ) : (
                            <>
                                <Form.Label>Select the user you want to add the room/space.</Form.Label>
                                <Form.Select
                                    style={{ marginBottom: "25px", fontSize: "1rem" }}
                                    value={selectedLocation || ""}
                                    onChange={handleLocationChange}
                                    required
                                >
                                    <option value="" disabled>
                                        Select a user
                                    </option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} at {user.state}
                                        </option>
                                    ))}
                                </Form.Select>
                            </>
                        )} */}
          </div>
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
              <Spinner
                as="span"
                animation="border"
                size="sm"
                users="status"
                aria-hidden="true"
              />
            ) : myTeams ? (
              "Update"
            ) : (
              "Create"
            )}{" "}
            Team
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TeamsRegistrationModal;
