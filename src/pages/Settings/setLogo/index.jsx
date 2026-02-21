import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import AccountRegistrationModal from "./LogoAndColorRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext.jsx";

const LogoColor = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const formatDateTime = useCallback((isoString) => {
    if (!isoString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(isoString).toLocaleDateString("en-US", options);
  }, []);

  const fetchData = useCallback(async (page = 1, pageSize = 10) => {
    if (isFetching.current || !tenantToken || !tenantSlug) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-details`,
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

      if (isMounted.current) {
        // Handle different response formats
        let detailsData = [];
        if (Array.isArray(result.data)) {
          detailsData = result.data;
        } else if (result.data && typeof result.data === 'object') {
          detailsData = [result.data];
        } else {
          detailsData = [];
        }

        const sortedData = [...detailsData].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        
        setData(sortedData);
        
        // Client-side pagination
        const totalPages = Math.ceil(sortedData.length / pageSize);
        setPagination({
          currentPage: page,
          totalPages: totalPages,
          pageSize: pageSize,
        });
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
        setError(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [tenantToken, tenantSlug]);

  // Fetch data on mount
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchData(pagination.currentPage, pagination.pageSize);
    }
  }, [tenantToken, tenantSlug, pagination.currentPage, pagination.pageSize, fetchData]);

  const handleEditClick = useCallback((logo) => {
    setSelectedLogo(logo);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedLogo(null);
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(pagination.currentPage, pagination.pageSize);
  }, [fetchData, pagination.currentPage, pagination.pageSize]);

  // Memoized columns
  const columns = useMemo(() => [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1 + (pagination.currentPage - 1) * pagination.pageSize,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Logo",
      accessor: "logo",
      sort: false,
      Cell: ({ value }) =>
        value ? (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/storage/uploads/tenant_logo/${value}`}
            alt="Logo"
            style={{
              maxWidth: 60,
              maxHeight: 60,
              borderRadius: 25,
              border: "1px solid #ccc",
              objectFit: "contain",
              background: "#fff",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-logo.png"; // Fallback image
            }}
          />
        ) : (
          <span className="text-muted">No Logo</span>
        ),
    },
    {
      Header: "Color",
      accessor: "colour",
      sort: true,
      Cell: ({ value }) =>
        value ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: value,
                border: "2px solid #ccc",
              }}
              title={value}
            />
            <span>{value}</span>
          </div>
        ) : (
          <span className="text-muted">No Color</span>
        ),
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
        <div style={{ whiteSpace: "nowrap" }}>
          <Link
            to="#"
            className="action-icon"
            onClick={(e) => {
              e.preventDefault();
              handleEditClick(row.original);
            }}
            title="Edit Logo & Color"
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
        </div>
      ),
    },
  ], [pagination.currentPage, pagination.pageSize, handleEditClick, formatDateTime]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return data.slice(start, end);
  }, [data, pagination.currentPage, pagination.pageSize]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Branding", path: "/settings/branding", active: true },
        ]}
        title="Company Branding"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={6}>
                  <Button
                    style={{ background: primary, borderColor: primary, color: "#fff" }}
                    className="waves-effect waves-light"
                    onClick={() => {
                      setSelectedLogo(null);
                      setShowModal(true);
                    }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add Branding
                  </Button>
                </Col>
                <Col sm={6} className="text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <i className="mdi mdi-refresh me-1"></i>
                    Refresh
                  </Button>
                </Col>
              </Row>

              <Card>
                <Card.Body style={{ background: secondary, marginTop: "30px" }}>
                  {error ? (
                    <div className="alert alert-danger" role="alert">
                      <i className="mdi mdi-alert-circle-outline me-2"></i>
                      Error: {error}
                    </div>
                  ) : loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading branding details...</p>
                    </div>
                  ) : isLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Processing...</span>
                      </Spinner>
                      <p className="mt-2">Processing...</p>
                    </div>
                  ) : (
                    <Table2
                      columns={columns}
                      data={paginatedData}
                      pageSize={pagination.pageSize}
                      isSortable
                      isSearchable
                      pagination
                      tableClass="table-striped dt-responsive nowrap w-100"
                      searchBoxClass="my-2"
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AccountRegistrationModal
        show={showModal}
        onHide={handleCloseModal}
        logoData={selectedLogo}
        onSubmit={() => fetchData(pagination.currentPage, pagination.pageSize)}
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
    </>
  );
};

export default LogoColor;