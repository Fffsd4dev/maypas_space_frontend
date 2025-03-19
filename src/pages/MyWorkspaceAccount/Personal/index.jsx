import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Table, Spinner } from "react-bootstrap";
import classNames from "classnames";
import PageTitle from "../../../components/PageTitle";
import UsersRegistrationModal from "./UsersRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";

const Personal = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const { tenantSlug } = useParams();
  const tenantSlugg = user?.tenant;

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
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
    myUserID: null,
  });

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
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/view-users`,
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

  const handleDelete = async (myUserID) => {
    if (!user?.tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/delete-user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myUserID }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((myUser) => myUser.id !== myUserID)
      );
      setPopup({
        message: "Plan deleted successfully!",
        type: "success",
        isVisible: true,
      });
      fetchData(); // Reload users after deleting a user
    } catch (error) {
      setPopup({
        message: "Failed to delete plan!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteButton = (myUserID) => {
    setDeletePopup({
      isVisible: true,
      myUserID,
    });
  };

  const confirmDelete = () => {
    const { myUserID } = deletePopup;
    handleDelete(myUserID);
    setDeletePopup({ isVisible: false, myUserID: null });
  };

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Users", path: "/account/admin", active: true },
        ]}
        title="Users"
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
                    onClick={() => {
                      setShow(true);
                      setSelectedUser(null);
                    }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a User
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading Users...</p>
              ) : isLoading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Deleting...</span>
                  </Spinner>{" "}
                  Deleting...
                </div>
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
                        <td>
                          <Link
                            to="#"
                            className="action-icon"
                            onClick={() => handleEditClick(myUser)}
                          >
                            <i className="mdi mdi-square-edit-outline"></i>
                          </Link>
                          <Link
                            to="#"
                            className="action-icon"
                            onClick={() => handleDeleteButton(myUser.id)}
                          >
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
          message="Are you sure you want to delete this User?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, myUserID: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default Personal;
