import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import AccountRegistrationModal from "./AccountRegistrationForm";
import PaystackRegistrationModal from "./PaystackRegistrationModal";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";

const BankAccount = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  const [showBankModal, setShowBankModal] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedPaystack, setSelectedPaystack] = useState(null);
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
    bankAccountId: null,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
    pageSize: 10,
  });

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
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/banks?page=${page}&per_page=${pageSize}`,
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

      if (isMounted.current && Array.isArray(result.data)) {
        const sortedData = [...result.data].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        
        setData(sortedData);
        
        // Update pagination if available
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.current_page || page,
            totalPages: result.pagination.last_page || 1,
            nextPageUrl: result.pagination.next_page_url || null,
            prevPageUrl: result.pagination.prev_page_url || null,
            pageSize: pageSize,
          });
        } else {
          // Client-side pagination
          const totalPages = Math.ceil(sortedData.length / pageSize);
          setPagination({
            currentPage: page,
            totalPages: totalPages,
            nextPageUrl: page < totalPages ? `?page=${page + 1}` : null,
            prevPageUrl: page > 1 ? `?page=${page - 1}` : null,
            pageSize: pageSize,
          });
        }
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
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

  // Fetch data on mount and when pagination changes
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchData(pagination.currentPage, pagination.pageSize);
    }
  }, [tenantToken, tenantSlug, pagination.currentPage, pagination.pageSize, fetchData]);

  const handleEditClick = useCallback((bankAccount) => {
    setSelectedBank(bankAccount);
    setShowBankModal(true);
  }, []);

  const handlePaystackClick = useCallback(() => {
    setSelectedPaystack(null);
    setShowPaystackModal(true);
  }, []);

  const handleCloseBankModal = useCallback(() => {
    setShowBankModal(false);
    setSelectedBank(null);
  }, []);

  const handleClosePaystackModal = useCallback(() => {
    setShowPaystackModal(false);
    setSelectedPaystack(null);
  }, []);

  const handleDelete = useCallback(async (bankAccountId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/bank/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: bankAccountId }),
        }
      );
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || "Failed to delete.");

      setPopup({
        message: "Bank details deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });

      // Refresh data
      fetchData(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting bank details:", error);
      toast.error("Failed to delete bank details!");
      setPopup({
        message: "Failed to delete bank details!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDeleteButton = useCallback((bankAccountId) => {
    setDeletePopup({
      isVisible: true,
      bankAccountId,
    });
  }, []);

  const confirmDelete = useCallback(() => {
    handleDelete(deletePopup.bankAccountId);
    setDeletePopup({ isVisible: false, bankAccountId: null });
  }, [deletePopup, handleDelete]);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }));
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
      Header: "Bank Name",
      accessor: "bank_name",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Account Number",
      accessor: "account_number",
      sort: true,
    },
    {
      Header: "Account Name",
      accessor: "account_name",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Location",
      accessor: "location.name",
      sort: true,
      Cell: ({ row }) => row.original.location?.name || "N/A",
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
            style={{ marginRight: "10px" }}
            title="Edit Bank Details"
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon text-danger"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteButton(row.original.id);
            }}
            title="Delete Bank Details"
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </div>
      ),
    },
  ], [pagination.currentPage, pagination.pageSize, handleEditClick, handleDeleteButton, formatDateTime]);

  // Paginate data for client-side pagination
  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return data.slice(start, end);
  }, [data, pagination.currentPage, pagination.pageSize]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Bank Accounts", path: "/settings/bank-accounts", active: true },
        ]}
        title="Bank Accounts"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={6}>
                  <Button
                    variant="danger"
                    className="waves-effect waves-light me-2"
                    onClick={() => {
                      setSelectedBank(null);
                      setShowBankModal(true);
                    }}
                    style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add Bank Account
                  </Button>
                  
                  <Button
                    variant="outline-primary"
                    className="waves-effect waves-light"
                    onClick={handlePaystackClick}
                    style={{ borderColor: primary, color: primary }}
                  >
                    <i className="mdi mdi-key me-1"></i> Set Paystack Key
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
                <Card.Body
                  style={{
                    background: secondary,
                    marginTop: "30px",
                  }}
                >
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
                      <p className="mt-2">Loading bank details...</p>
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
        show={showBankModal}
        onHide={handleCloseBankModal}
        bankAccount={selectedBank}
        onSubmit={() => fetchData(pagination.currentPage, pagination.pageSize)}
      />

      <PaystackRegistrationModal
        show={showPaystackModal}
        onHide={handleClosePaystackModal}
        paystackKey={selectedPaystack}
        onSubmit={() => {
          // Show success message or handle paystack key saved
          toast.success("Paystack key saved successfully!");
        }}
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
          message="Are you sure you want to delete these bank details?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, bankAccountId: null })}
          buttonLabel="Yes, Delete"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default BankAccount;