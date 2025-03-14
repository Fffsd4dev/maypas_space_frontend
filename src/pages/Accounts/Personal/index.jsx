import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Table } from "react-bootstrap";
import classNames from "classnames";
import PageTitle from "../../../components/PageTitle";
import UsersRegistrationModal from "./UsersRegistrationForm";
import { useAuthContext } from '@/context/useAuthContext.jsx';


const Personal = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken
  console.log("Tenant Auth Token:", tenantToken);
  const { tenantSlug } = useParams();
  const tenantSlugg = user?.tenant;
  console.log("Tenant Slug:", tenantSlugg);

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const formatDateTime = (isoString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(isoString).toLocaleDateString("en-US", options);
  };


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/view-users`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user?.tenantToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
        console.log(response);
      }

      const result = await response.json();
      console.log('Parsed response data:', result.data.data);

      if (result && Array.isArray(result.data.data)) {
        const data = result.data.data;
        data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantToken) return;
    fetchData();
  }, [user]);

  const handleEditClick = (myUser) => {
    setSelectedUser(myUser);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    fetchData(); // Reload users after closing the modal
  };

  const handleDeleteClick = async (myUserID) => {
    if (!user?.token) return;
  
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/delete-user`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({id: myUserID})
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      setData((prevData) => prevData.filter((myUser) => myUser.id !== myUserID));
      alert("Workspace deleted successfully!");
      fetchData(); // Reload users after deleting a user
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alert("Failed to delete workspace. Please try again.");
    }
  };
  

  return (
    <>
      <PageTitle breadCrumbItems={[{ label: "Users", path: "/account/admin", active: true }]} title="Users" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <Button variant="danger" className="waves-effect waves-light" onClick={() => { setShow(true); setSelectedUser(null); }}>
                    <i className="mdi mdi-plus-circle me-1"></i> Add a User
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading Users...</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>S/N</th>
                      <th>ID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Created On</th>
                      <th>Updated On</th>
                      <th>User type</th>
                      {/* <th>Status</th> */}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((myUser, index) => (
                      <tr key={myUser.id}>
                        <td>{index + 1}</td> {/* Fix S/N column */}
                        <td>{myUser.id}</td>
                        <td>{myUser.first_name}</td>
                        <td>{myUser.last_name}</td>
                        <td>{myUser.email}</td>
                        <td>{myUser.phone}</td>
                        <td>{formatDateTime(myUser.created_at)}</td>
                        <td>{formatDateTime(myUser.updated_at)}</td>
                        <td>{myUser.user_type.user_type}</td>
                        {/* <td>
                          <span className={classNames("badge", {
                            "bg-soft-success text-success": myUser.status === "Active",
                            "bg-soft-danger text-danger": myUser.status === "Blocked"
                          })}>
                            {myUser.status}
                          </span>
                        </td> */}
                        <td>
                          <Link to="#" className="action-icon" onClick={() => handleEditClick(myUser)}>
                            <i className="mdi mdi-square-edit-outline"></i>
                          </Link>
                          {/* <Link to="#" className="action-icon">
                            <i className="mdi mdi-delete"></i>
                          </Link> */}
                          <Link to="#" className="action-icon" onClick={() => handleDeleteClick(myUser.id)}>
  <i className="mdi mdi-delete"></i>
</Link>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <UsersRegistrationModal
        show={show}
        onHide={handleClose}
        myUser={selectedUser}
        onSubmit={fetchData} // Reload users after adding or editing a user
      />
      
    </>
  );
};

export default Personal;
