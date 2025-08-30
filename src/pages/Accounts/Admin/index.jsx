import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Table } from "react-bootstrap";
import classNames from "classnames";
import PageTitle from "../../../components/PageTitle";
import AdminRegistrationForm from "./AdminRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Table2 from "../../../components/Table2";

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

  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "First Name",
      accessor: "first_name",
      sort: true,
    },
    {
      Header: "Last Name",
      accessor: "last_name",
      sort: true,
    },
    {
      Header: "Email",
      accessor: "email",
      sort: true,
    },
    {
      Header: "Role",
      accessor: "role.role",
      sort: true,
    },
    {
      Header: "Created On",
      accessor: "created_at",
      sort: true,
      Cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      Header: "Updated On",
      accessor: "updated_at",
      sort: true,
      Cell: ({ row }) => formatDateTime(row.original.updated_at),
    },
    {
      Header: "Action",
      accessor: "action",
      sort: false,
      Cell: ({ row }) => (
        <>
          <Link
            to="#"
            className="action-icon"
            onClick={() => handleEdit(row.original)}
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon"
            onClick={() => handleDelete(row.original.id)}
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-all`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });


      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Parsed response data:", result.data);

      if (result && Array.isArray(result.data.data)) {
        const data = result?.data?.data;
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-admin/delete`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
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
                <Table2
                  columns={columns}
                  data={data}
                  pageSize={itemsPerPage}
                  isSortable
                  isSearchable
                  tableClass="table-striped dt-responsive nowrap w-100"
                  searchBoxClass="my-2"
                  paginationProps={{
                    currentPage,
                    totalPages: Math.ceil(data.length / itemsPerPage),
                    onPageChange: (page) => setCurrentPage(page),
                  }}
                />
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
