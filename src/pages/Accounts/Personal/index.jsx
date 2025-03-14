
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Table } from "react-bootstrap";
import classNames from "classnames";
import PageTitle from "../../../components/PageTitle";
import WorkspaceUserRegistrationModal from "./UsersRegistrationForm";
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
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  useEffect(() => {
    if (!tenantToken) return;

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
          setData(result.data.data);
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

    fetchData();
  }, [user]);

  const handleEditClick = (workspace) => {
    setSelectedWorkspace(workspace);
    setShow(true);
  };


  const handleDeleteClick = async (workspaceId) => {
    if (!user?.token) return;
  
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/delete-user`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({id: workspaceId})
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      setData((prevData) => prevData.filter((workspace) => workspace.id !== workspaceId));
      alert("Workspace deleted successfully!");
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
                  <Button variant="danger" className="waves-effect waves-light" onClick={() => { setShow(true); setSelectedWorkspace(null); }}>
                    <i className="mdi mdi-plus-circle me-1"></i> Add a User
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading Workspaces...</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Company Name</th>
                      <th>Amount of Locations</th>
                      <th>Countries</th>
                      <th>Created On</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((workspace) => (
                      <tr key={workspace.id}>
                        <td>{workspace.id}</td>
                        <td>{workspace.company_name}</td>
                        <td>{workspace.company_no_location}</td>
                        <td>{workspace.company_countries}</td>
                        <td>{workspace.created_at}</td>
                        <td>
                          <span className={classNames("badge", {
                            "bg-soft-success text-success": workspace.status === "Active",
                            "bg-soft-danger text-danger": workspace.status === "Blocked"
                          })}>
                            {workspace.status}
                          </span>
                        </td>
                        <td>
                          <Link to="#" className="action-icon" onClick={() => handleEditClick(workspace)}>
                            <i className="mdi mdi-square-edit-outline"></i>
                          </Link>
                          {/* <Link to="#" className="action-icon">
                            <i className="mdi mdi-delete"></i>
                          </Link> */}
                          <Link to="#" className="action-icon" onClick={() => handleDeleteClick(workspace.id)}>
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

      <WorkspaceUserRegistrationModal
        show={show}
        onHide={() => { setShow(false); setSelectedWorkspace(null); }}
        onSubmit={() => setShow(false)}
        workspace={selectedWorkspace}
      />
      
    </>
  );
};

export default Personal;
