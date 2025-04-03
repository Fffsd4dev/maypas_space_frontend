import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import MyRolesRegistrationForm from "./MyRolesRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";

const WorkspaceRoles = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlugg = user?.tenant;

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
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
    roleID: null,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
    pageSize: 5,
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
      const [rowLoading, setRowLoading] = useState(null); // State for row loading
    
      const handleRowClick = async (id) => {
        setRowLoading(id); // Set the row loading state
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/usertype/user-type/${id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${user?.tenantToken}`,
              },
            }
          );
    
          if (!response.ok) {
            throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
          }
    
          const result = await response.json();
          console.log("Fetched role details:", result);
    
          const newWindow = window.open(`/role-details/${id}`, "_blank");
          if (newWindow) {
            newWindow.onload = () => {
              newWindow.role = result.data;
            };
          } else {
            console.error(
              "Failed to open new window. It might be blocked by the browser."
            );
          }
        } catch (error) {
          console.error("Error fetching Subscription Plan details:", error);
        } finally {
          setRowLoading(null); // Reset the row loading state
        }
      };
    
  const fetchData = async (page = 1, pageSize = 5) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/usertype/list-user-types?page=${page}&per_page=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
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
        setPagination({
          currentPage: result.data.current_page,
          totalPages: result.data.last_page,
          nextPageUrl: result.data.next_page_url,
          prevPageUrl: result.data.prev_page_url,
          pageSize: pageSize,
        });
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
    fetchData(pagination.currentPage, pagination.pageSize);
  }, [user, pagination.currentPage, pagination.pageSize]);

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedRole(null);
    fetchData(pagination.currentPage, pagination.pageSize); // Reload roles after closing the modal
  };

  const handleDelete = async (roleID) => {
    if (!user?.tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/usertype/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: roleID }),
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((role) => role.id !== roleID)
      );
      setPopup({
        message: "Role deleted successfully!",
        type: "success",
        isVisible: true,
      });
      fetchData(pagination.currentPage, pagination.pageSize); // Reload roles after deleting a role
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

  const handleDeleteButton = (roleID) => {
    setDeletePopup({
      isVisible: true,
      roleID,
    });
  };

  const confirmDelete = () => {
    const { roleID } = deletePopup;
    handleDelete(roleID);
    setDeletePopup({ isVisible: false, roleID: null });
  };

  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Role Name",
      accessor: "user_type",
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
            onClick={() => handleEditClick(row.original)}
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon"
            onClick={() => handleDeleteButton(row.original.id)}
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </>
      ),
    },
  ];

  return (
    <>
      <PageTitle
        breadCrumbItems={[{ label: "Roles", path: "/account/roles", active: true }]}
        title="Roles"
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
                      setSelectedRole(null);
                    }}
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
                <Table2
                  columns={columns}
                  data={data}
                  pageSize={pagination.pageSize}
                  isSortable
                  pagination
                  isSearchable
                  tableClass="table-striped dt-responsive nowrap w-100"
                  searchBoxClass="my-2"
                  getRowProps={(row) => ({
                    style: { cursor: "pointer" },
                    onClick: () => handleRowClick(row.original.id),
                  })}
                  rowLoading={rowLoading} // Pass the row loading state
                  paginationProps={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    onPageChange: (page) => setPagination((prev) => ({ ...prev, currentPage: page })),
                    onPageSizeChange: (pageSize) => setPagination((prev) => ({ ...prev, pageSize })),
                  }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <MyRolesRegistrationForm
        show={show}
        onHide={handleClose}
        selectedAdmin={selectedRole}
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
          onClose={() => setDeletePopup({ isVisible: false, roleID: null })}
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default WorkspaceRoles;
