import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Table, Spinner } from "react-bootstrap";
import classNames from "classnames";
import PageTitle from "../../../components/PageTitle";
import MyRolesRegistrationForm from "./MyRolesRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";

const WorkspaceRoles = () => {
  const { user } = useAuthContext();

  console.log("Auth Token:", user?.tenantToken, user?.tenant);
  
  const [show, setShow] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    adminId: null,
  });

  const tenantSlug = user?.tenant;

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/usertype/list-user-types`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Parsed response data:", result.data.data);

      if (result && Array.isArray(result.data.data)) {
        setData(result.data.data);
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
    if (!user?.tenantToken) return;
    fetchData();
  }, [user]);

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedAdmin(null);
    fetchData(); // Reload users after closing the modal
  };

  const handleDelete = async (adminId) => {
    if (!user?.tenantToken) return;
    setIsLoading(true);
    console.log(adminId);
    console.log(user?.user_type_id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/usertype/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: adminId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setData(data.filter((admin) => admin.id !== adminId));
      setPopup({
        message: "Role deleted successfully!",
        type: "success",
        isVisible: true,
      });
      fetchData(); // Reload users after deleting a user
    } catch (error) {
      setPopup({
        message: "Failed to delete role!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteButton = (adminId) => {
    setDeletePopup({
      isVisible: true,
      adminId,
    });
  };

  const confirmDelete = () => {
    const { adminId } = deletePopup;
    handleDelete(adminId);
    setDeletePopup({ isVisible: false, adminId: null });
  };

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          {
            label: "My Roles & Permissions",
            path: "/workspaceAccount/roles",
            active: true,
          },
        ]}
        title="My Roles & Permissions"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <Button
                    variant="danger"
                    className="waves-effect waves-light"
                    onClick={() => setShow(true)}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a Role
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading Roles...</p>
              ) : isLoading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Deleting...</span>
                  </Spinner>{" "}
                  Deleting...
                </div>
              ) : (
                <>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        
                        <th>S/N</th>
                        <th>Role Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((admin, index) => (
                        <tr key={admin.id}>
                           <td>{index + 1}</td>
                         
                          <td>{admin.user_type}</td>
                          <td>
                            <Link
                              to="#"
                              className="action-icon"
                              onClick={() => handleEdit(admin)}
                            >
                              <i className="mdi mdi-square-edit-outline"></i>
                            </Link>
                            <Link
                              to="#"
                              className="action-icon"
                              onClick={() => handleDeleteButton(admin.id)}
                            >
                              <i className="mdi mdi-delete"></i>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <MyRolesRegistrationForm
        show={show}
        onHide={handleClose}
        selectedAdmin={selectedAdmin}
      />

{popup.isVisible && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ ...popup, isVisible: false })}
          buttonLabel={popup.buttonLabel}
          buttonRoute={popup.buttonRoute}
        />
      )}

      {deletePopup.isVisible && (
        <Popup
          message="Are you sure you want to delete this role?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, adminId: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default WorkspaceRoles;
