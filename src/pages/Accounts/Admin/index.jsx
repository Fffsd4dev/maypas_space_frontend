import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Table } from "react-bootstrap";
import classNames from "classnames";
import PageTitle from "../../../components/PageTitle";
import AdminRegistrationForm from "./AdminRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";

const Admin = () => {
  const { user } = useAuthContext();
  console.log("Auth Token:", user?.token);
  const [show, setShow] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user?.token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("https://trial.maypasworkspace.com/api/system-admin/view-all", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${user?.token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Parsed response data:", result.data);

        if (result && Array.isArray(result.data)) {
          setData(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedAdmin(null);
  };

  const handleDelete = async (adminId) => {
    if (!user?.token) return;

    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      const response = await fetch("https://trial.maypasworkspace.com/api/system-admin/delete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: adminId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setData(data.filter((admin) => admin.id !== adminId));
      alert("Admin deleted successfully.");
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin.");
    }
  };

  return (
    <>
      <PageTitle breadCrumbItems={[{ label: "Administrators", path: "/account/admin", active: true }]} title="Administrators" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <Button variant="danger" className="waves-effect waves-light" onClick={() => setShow(true)}>
                    <i className="mdi mdi-plus-circle me-1"></i> Add Admin
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading Admins...</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(data) && data.map((admin) => (
                      <tr key={admin.id}>
                        <td>{admin.id}</td>
                        <td>{admin.first_name}</td>
                        <td>{admin.last_name}</td>
                        <td>{admin.email}</td>
                        <td>{admin.role.role}</td>
                        <td>
                          <Link to="#" className="action-icon" onClick={() => handleEdit(admin)}>
                            <i className="mdi mdi-square-edit-outline"></i>
                          </Link>
                          <Link to="#" className="action-icon" onClick={() => handleDelete(admin.id)}>
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

      <AdminRegistrationForm show={show} onHide={handleClose} selectedAdmin={selectedAdmin} />
    </>
  );
};

export default Admin;
