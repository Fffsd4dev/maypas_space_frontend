import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MemberRegistrationModal = ({ show, onHide, myTeam, onSubmit }) => {
    const { user } = useAuthContext();
    const tenantSlug = user?.tenant;
      const [loadingUsers, setLoadingUsers] = useState(true);
    

    const [teams, setTeams] = useState([]);
      const [users, setUsers] = useState([]);
    

    const [formData, setFormData] = useState({
        user_id: "",
        team_id: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (myTeam) {
            setFormData({
                user_id: myTeam.user_id || "",
                team_id: myTeam.team_id || "",
            });
        } else {
            setFormData({
                user_id: "",
                team_id: "",
            });
        }
    }, [myTeam]);

    // Fetch teams when modal opens
    const fetchTeams = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/teams`, {
                headers: { Authorization: `Bearer ${user.tenantToken}` },
            });
            const result = await response.json();
            if (response.ok) {
                if (result && Array.isArray(result[1])) {
                    console.log("Teams:", result);
                    setTeams(result[1] || []);
                    }  else {
                      throw new Error("Invalid response format");
                    }
                console.log("Teams:", result);
            } else {
                throw new Error(result.message || "Failed to fetch teams.");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

  
    useEffect(() => {
        if (show && user?.tenantToken) {
            fetchTeams();
        }
    }, [show, user?.tenantToken]);

      // fetch users when modal opens
     const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/${tenantSlug}/view-users`,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        console.log(formData);
        console.log(user?.tenantToken);

        try {
            if (!user?.tenantToken) throw new Error("Authorization token is missing.");

            const url = myTeam
                ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/update/${myTeam.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/add-member`;

            const method = myTeam ? "POST" : "POST";
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
                toast.success(myTeam ? "Member updated successfully!" : "Member added successfully!");
                setFormData({
                    user_id: "",
                    team_id: "",
                });
                setTimeout(() => {
                    onSubmit();
                    onHide();
                }, 1000);
            } else {
                let errorMsg = "An error occurred.";

                if (result?.errors) {
                    errorMsg = Object.values(result.errors)
                        .flat()
                        .join("\n");
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
                <Modal.Title>{myTeam ? "Member" : "Add a New Member to a Team"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                    {/* <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Member Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Member"
                        />
                    </Form.Group> */}

                    <Form.Group className="mb-3" controlId="team_id">
                        <Form.Label>Team</Form.Label>
                        <Form.Select name="team_id" value={formData.team_id} onChange={handleInputChange} required>
                            <option value="">Select a Team</option>
                            {Array.isArray(teams) && teams.map((team) => (
                                <option key={team.id} value={team.id}>{team.company} {team.last_name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="user_id">
                        <Form.Label>Users</Form.Label>
                        <Form.Select name="user_id" value={formData.user_id} onChange={handleInputChange} required>
                            <option value="">Select User</option>
                            {Array.isArray(users) && users.map((user) => (
                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    

                    <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" teams="status" aria-hidden="true" /> : myTeam ? "Update" : "Add"} Member
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default MemberRegistrationModal;