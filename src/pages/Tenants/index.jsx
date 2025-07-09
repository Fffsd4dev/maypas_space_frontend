import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import classNames from "classnames";
import PageTitle from "../../components/PageTitle";
import WorkspaceRegistrationForm from "../Tenants/WorkspaceRegistrationForm";
import { useAuthContext } from '@/context/useAuthContext.jsx';
import Table2 from "../../components/Table2";
import Popup from "../../components/Popup/Popup";

const Tenants = () => {
  const { user } = useAuthContext();
  console.log("Auth Token:", user?.token);

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
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


  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Company Name",
      accessor: "company_name",
      sort: true,
    },
    {
      Header: "Amount of Locations",
      accessor: "company_no_location",
      sort: true,
    },
    {
      Header: "Countries",
      accessor: "company_countries",
      sort: true,
      Cell: ({ row }) => {
        try {
          const countries = JSON.parse(row.original.company_countries);
          return Array.isArray(countries) ? countries.join(", ") : "N/A";
        } catch (error) {
          console.error("Error parsing company_countries:", error);
          return "N/A";
        }
      },
    },
    {
      Header: "Created On",
      accessor: "created_at",
      sort: true,
      Cell: ({ row }) => formatDateTime(row.original.created_at),
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
            onClick={() => handleDeleteClick(row.original.id)}
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-workspaces`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Parsed response data:", result.data.data);

      if (result && Array.isArray(result.data.data)) {
        const workspaces = result.data.data;
        workspaces.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(workspaces);
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(workspaces.length / prev.pageSize),
        }));
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
    if (!user?.token) return;

    fetchData();
  }, [user]);

  const handleEditClick = (workspace) => {
    setSelectedWorkspace(workspace);
    setShow(true);
  };

const handleDeleteClick = (workspaceId) => {
  setPopup({
    message: "Are you sure you want to delete this workspace?",
    type: "confirm",
    isVisible: true,
    buttonLabel: "Yes",
    buttonRoute: "",
    onAction: () => confirmDelete(workspaceId),
  });
};

const confirmDelete = async (workspaceId) => {
  if (!user?.token) return;

  setPopup({ ...popup, isVisible: false }); // Hide the confirmation popup

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/delete-workspace`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: workspaceId }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Contact Support! HTTP error! Status: ${response.status}`
      );
    }

    setData((prevData) =>
      prevData.filter((workspace) => workspace.id !== workspaceId)
    );
    setPopup({
      message: "Workspace deleted successfully!",
      type: "success",
      isVisible: true,
      buttonLabel: "OK",
      buttonRoute: "",
    });
  } catch (error) {
    setPopup({
      message: "Failed to delete workspace. Please try again.",
      type: "error",
      isVisible: true,
      buttonLabel: "OK",
      buttonRoute: "",
    });
  }
};

  const handleClose = () => {
    setShow(false);
    setSelectedWorkspace(null);
    fetchData();
  };

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Workspaces", path: "/account/admin", active: true },
        ]}
        title="Workspaces"
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
                      setSelectedWorkspace(null);
                    }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add Workspace
                  </Button>
                </Col>
              </Row>

              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading Workspaces...</p>
              ) : (
                <Table2
                  columns={columns}
                  data={data}
                  pageSize={pagination.pageSize}
                  isSortable
                  isSearchable
                  tableClass="table-striped dt-responsive nowrap w-100"
                  searchBoxClass="my-2"
                  paginationProps={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    onPageChange: (page) =>
                      setPagination((prev) => ({ ...prev, currentPage: page })),
                    onPageSizeChange: (pageSize) =>
                      setPagination((prev) => ({ ...prev, pageSize })),
                  }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <WorkspaceRegistrationForm
        show={show}
        onHide={handleClose}
        onSubmit={() => setShow(false)}
        workspace={selectedWorkspace}
      />

      {popup.isVisible && (
  <Popup
    message={popup.message}
    type={popup.type}
    onClose={() => setPopup({ ...popup, isVisible: false })}
    buttonLabel={popup.buttonLabel}
    buttonRoute={popup.buttonRoute}
    onAction={popup.onAction}
  />
)}
                  
            {deletePopup.isVisible && (
              <Popup
                message="Are you sure you want to delete this workspace?"
                type="confirm"
                onClose={() => setDeletePopup({ isVisible: false, myUserID: null })}
                buttonLabel="Yes"
                onAction={confirmDelete}
              />
            )}

    </>
  );
};

export default Tenants;
