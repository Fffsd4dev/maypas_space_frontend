import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import MyRolesRegistrationForm from "./MyRolesRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { useLogoColor } from "../../../context/LogoColorContext";

const WorkspaceRoles = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlugg = user?.tenant;

  const { colour: primary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);

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

  const [rowLoading, setRowLoading] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const formatDateTime = useCallback((isoString) => {
    if (!isoString) return "";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(isoString).toLocaleDateString("en-US", options);
  }, []);

  const handleRowClick = useCallback(async (id, event) => {
    if (event.target.closest(".action-icon") || !tenantToken || !tenantSlugg) return;

    setRowLoading(id);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/usertype/user-type/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      const newWindow = window.open(`/role-details/${id}`, "_blank");
      if (newWindow) {
        newWindow.roleData = result.data;
      }
    } catch (error) {
      console.error("Error fetching role details:", error);
      toast.error("Failed to fetch role details");
    } finally {
      if (isMounted.current) {
        setRowLoading(null);
      }
    }
  }, [tenantToken, tenantSlugg]);

  const fetchData = useCallback(async (page = 1, pageSize = 5) => {
    if (isFetching.current || !tenantToken || !tenantSlugg) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/usertype/list-user-types?page=${page}&per_page=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (isMounted.current && result?.data?.data) {
        const sortedData = [...result.data.data].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        
        setData(sortedData);
        setPagination({
          currentPage: result.data.current_page,
          totalPages: result.data.last_page,
          nextPageUrl: result.data.next_page_url,
          prevPageUrl: result.data.prev_page_url,
          pageSize: pageSize,
        });
      }
    } catch (error) {
      if (isMounted.current) {
        setError(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [tenantToken, tenantSlugg]);

  useEffect(() => {
    if (tenantToken && tenantSlugg) {
      fetchData(pagination.currentPage, pagination.pageSize);
    }
  }, [tenantToken, tenantSlugg, pagination.currentPage, pagination.pageSize, fetchData]);

  const handleEditClick = useCallback((role) => {
    setSelectedRole(role);
    setShow(true);
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
    setSelectedRole(null);
    fetchData(pagination.currentPage, pagination.pageSize);
  }, [fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDelete = useCallback(async (roleID) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/usertype/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`, // Fixed: using tenantToken
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: roleID }),
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) => prevData.filter((role) => role.id !== roleID));
      setPopup({
        message: "Role deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
      
      fetchData(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      setPopup({
        message: "Failed to delete role!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlugg, fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDeleteButton = useCallback((roleID) => {
    setDeletePopup({
      isVisible: true,
      roleID,
    });
  }, []);

  const confirmDelete = useCallback(() => {
    const { roleID } = deletePopup;
    handleDelete(roleID);
    setDeletePopup({ isVisible: false, roleID: null });
  }, [deletePopup, handleDelete]);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const columns = useMemo(() => [
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
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
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
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row.original);
            }}
            title="Edit Role"
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon text-danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteButton(row.original.id);
            }}
            title="Delete Role"
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </>
      ),
    },
  ], [handleEditClick, handleDeleteButton, formatDateTime]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Roles", path: "/account/roles", active: true },
        ]}
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
                    style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a Role
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>{" "}
                  Loading Roles...
                </div>
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
                    style: {
                      cursor: "pointer",
                      opacity: rowLoading === row.original.id ? 0.4 : 1,
                      transition: "opacity 0.3s ease",
                      position: "relative",
                    },
                    onClick: (event) => handleRowClick(row.original.id, event),
                  })}
                  paginationProps={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    onPageChange: handlePageChange,
                    onPageSizeChange: handlePageSizeChange,
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
        selectedRole={selectedRole}
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