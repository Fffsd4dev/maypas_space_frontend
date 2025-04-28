import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import Table2 from "../../../components/Table2";
import RolesRegistrationForm from "./RolesRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";

const Admin = () => {
  const { user } = useAuthContext();
  const [show, setShow] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://trial.maypasworkspace.com/api/system-admin/view-roles", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
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

  useEffect(() => {
    if (!user?.token) return;
    fetchData();
  }, [user]);

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedAdmin(null);
    fetchData();
  };

  const handleDelete = async (adminId) => {
    if (!user?.token) return;

    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      const response = await fetch("https://trial.maypasworkspace.com/api/system-admin/delete-role", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: adminId }),
      });

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData(data.filter((admin) => admin.id !== adminId));
      alert("Admin deleted successfully.");
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin.");
    }
  };

  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    { Header: "Role", accessor: "role", sort: true },
    {
      Header: "Action",
      accessor: "action",
      sort: false,
      Cell: ({ row }) => (
        <>
          <Link to="#" className="action-icon" onClick={() => handleEdit(row.original)}>
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link to="#" className="action-icon" onClick={() => handleDelete(row.original.id)}>
            <i className="mdi mdi-delete"></i>
          </Link>
        </>
      ),
    },
  ];

  return (
    <>
      <PageTitle breadCrumbItems={[{ label: "Roles", path: "/account/roles", active: true }]} title="Roles" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <Button variant="danger" className="waves-effect waves-light" onClick={() => setShow(true)}>
                    <i className="mdi mdi-plus-circle me-1"></i> Add Roles
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                <Table2
                  columns={columns}
                  data={data}
                  pageSize={5}
                  isSortable
                  pagination
                  isSearchable
                  tableClass="table-wrap table-striped"
                  searchBoxClass="my-2"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <RolesRegistrationForm show={show} onHide={handleClose} selectedAdmin={selectedAdmin} />
    </>
  );
};

export default Admin;