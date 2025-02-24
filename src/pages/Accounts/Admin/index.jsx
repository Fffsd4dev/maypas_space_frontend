import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import classNames from "classnames";

// components
import PageTitle from "../../../components/PageTitle";
import Table from "../../../components/Table";
import AdminRegistrationForm from './AdminRegistrationForm';
import { useAuthContext } from '@/context/useAuthContext.jsx';

/* name column render */
const NameColumn = ({ row }) => {
  return (
    <div className="table-user">
      <img src={row.original.avatar || "default-avatar.png"} alt="" className="me-2 rounded-circle" />
      <Link to="#" className="text-body fw-semibold">{row.original.name}</Link>
    </div>
  );
};

/* status column render */
const StatusColumn = ({ row }) => {
  return (
    <span className={classNames("badge", {
      "bg-soft-success text-success": row.original.status === "Active",
      "bg-soft-danger text-danger": row.original.status === "Blocked"
    })}>
      {row.original.status}
    </span>
  );
};

/* action column render */
const ActionColumn = () => {
  return (
    <>
      <Link to="#" className="action-icon"><i className="mdi mdi-eye"></i></Link>
      <Link to="#" className="action-icon"><i className="mdi mdi-square-edit-outline"></i></Link>
      <Link to="#" className="action-icon"><i className="mdi mdi-delete"></i></Link>
    </>
  );
};

// Table columns
const columns = [
  { Header: "ID", accessor: "id", sort: true },
  { Header: "First Name", accessor: "first_name", sort: false },
  { Header: "Last Name", accessor: "last_name", sort: false },
  { Header: "Email", accessor: "email", sort: false },
  { Header: "Status", accessor: "status", sort: false, Cell: StatusColumn },
  { Header: "Action", accessor: "action", sort: false, classes: "table-action", Cell: ActionColumn }
];

// Main component
const Admin = () => {
  const { user } = useAuthContext(); // Get the auth token from context
  console.log("Auth Token:", user?.token);
  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log('Parsed response data:', result.data.data); // Ensure correct API response structure
  
        if (result && Array.isArray(result.data.data)) {
          setData(result.data.data); // Ensure data is an array
          // throw new Error("Invalid response format");
        } else {
          // setData(result.data.data); // Ensure data is an array
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
                <Col sm={8}>
                  <div className="text-sm-end mt-2 mt-sm-0">
                    <Button className="btn btn-success mb-2 me-1"><i className="mdi mdi-cog"></i></Button>
                    <Button className="btn btn-light mb-2 me-1">Import</Button>
                    <Button className="btn btn-light mb-2">Export</Button>
                  </div>
                </Col>
              </Row>

              {/* Display error or loading state */}
              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading Admins...</p>
              ) : (
                <Table columns={columns} data={data} pageSize={12} isSortable pagination isSelectable tableClass="table-nowrap table-striped" />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add User Modal */}
      <AdminRegistrationForm show={show} onHide={() => setShow(false)} onSubmit={() => setShow(false)} />
    </>
  );
};

export default Admin;






