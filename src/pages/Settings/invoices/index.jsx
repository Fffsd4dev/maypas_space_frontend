import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form, Tooltip, OverlayTrigger } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import InvoicesModal from "./InvoicesForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import InvoiceDetailsView from "./InvoiceDetailsView"; // New component
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";

const Invoices = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  // Refs to prevent duplicate calls and track state
  const isMounted = useRef(true);
  const isFetching = useRef(false);
  const isFetchingLocations = useRef(false);
  const currencySymbolsRef = useRef({});
  const initialFetchDone = useRef(false);

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currencySymbols, setCurrencySymbols] = useState({});
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const [closeInvoicePopup, setCloseInvoicePopup] = useState({
    isVisible: false,
    invoiceId: null,
    invoiceRef: null,
  });
  const [locations, setLocations] = useState([]);
  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    spotId: null,
  });
  const [rowLoading, setRowLoading] = useState(null);
  
  // New state for invoice details view
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [invoiceDetailsLoading, setInvoiceDetailsLoading] = useState(false);
  const [invoiceBank, setInvoiceBank] = useState(null);
  const [invoiceSpace, setInvoiceSpace] = useState(null);
  const [invoiceCharges, setInvoiceCharges] = useState([]);

  const sizePerPageList = [
    { text: "5", value: 5 },
    { text: "10", value: 10 },
    { text: "15", value: 15 },
    { text: "25", value: 25 },
    { text: "All", value: 100 },
  ];

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const formatDateTime = useCallback((isoString) => {
    if (!isoString) return "N/A";
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(isoString).toLocaleDateString("en-US", options);
    } catch (error) {
      return "Invalid Date";
    }
  }, []);

  // Helper function to safely access space_payment properties
  const getSpacePayment = useCallback((invoice) => {
    if (!invoice) {
      return {
        amount: 0,
        payment_status: "N/A",
        created_at: null
      };
    }
    
    try {
      const payment = invoice.space_payment?.[0];
      return {
        amount: payment?.amount || 0,
        payment_status: payment?.payment_status || "N/A",
        created_at: payment?.created_at || invoice?.created_at || null
      };
    } catch (error) {
      console.error("Error in getSpacePayment:", error);
      return {
        amount: 0,
        payment_status: "N/A",
        created_at: invoice?.created_at || null
      };
    }
  }, []);

  const fetchCurrencySymbol = useCallback(async (locationId) => {
    if (!locationId || !tenantToken || !tenantSlug) return "$";
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/fetch/currency/location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tenantToken}`,
          },
          body: JSON.stringify({ location_id: locationId }),
        }
      );
      const result = await response.json();
      if (Array.isArray(result.data) && result.data.length > 0) {
        return result.data[0].symbol || "$";
      }
      return "$";
    } catch (err) {
      return "$";
    }
  }, [tenantToken, tenantSlug]);

  const handleViewInvoice = useCallback(async (id, event) => {
    event.stopPropagation(); // Prevent event bubbling
    
    setRowLoading(id);
    setInvoiceDetailsLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/invoice/show/${id}`,
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
        setSelectedInvoiceDetails(result.invoice || null);
        setInvoiceBank(result.bank || null);
        setInvoiceSpace(result.space_info || null);
        setInvoiceCharges(Array.isArray(result.charges) ? result.charges : []);
        
        // Fetch currency symbol
        if (result.bank?.location_id) {
          const symbol = await fetchCurrencySymbol(result.bank.location_id);
          setCurrencySymbols(prev => ({ ...prev, [id]: symbol }));
        }
        
        setShowInvoiceDetails(true);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast.error("Failed to fetch invoice details");
    } finally {
      if (isMounted.current) {
        setRowLoading(null);
        setInvoiceDetailsLoading(false);
      }
    }
  }, [tenantToken, tenantSlug, fetchCurrencySymbol]);

  const handleBackToList = useCallback(() => {
    setShowInvoiceDetails(false);
    setSelectedInvoiceDetails(null);
    setInvoiceBank(null);
    setInvoiceSpace(null);
    setInvoiceCharges([]);
  }, []);

  const fetchLocations = useCallback(async () => {
    if (isFetchingLocations.current || !tenantToken || !tenantSlug) return;
    
    isFetchingLocations.current = true;
    setLoadingLocations(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations?per_page=100`,
        {
          headers: { Authorization: `Bearer ${tenantToken}` },
        }
      );
      const result = await response.json();
      
      if (isMounted.current && response.ok) {
        setLocations(result.data?.data || []);
      } else if (isMounted.current) {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoadingLocations(false);
      }
      isFetchingLocations.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchCurrencySymbols = useCallback(async (locationIds) => {
    if (!tenantToken || !tenantSlug || locationIds.length === 0) return;

    const uniqueIds = [...new Set(locationIds)];
    const symbols = { ...currencySymbolsRef.current };
    let hasChanges = false;

    for (const locationId of uniqueIds) {
      if (symbols[locationId]) continue;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/fetch/currency/location`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tenantToken}`,
            },
            body: JSON.stringify({ location_id: locationId }),
          }
        );
        const result = await response.json();
        const symbol = Array.isArray(result.data) && result.data.length > 0
          ? result.data[0].symbol || "$"
          : "$";
        symbols[locationId] = symbol;
        hasChanges = true;
      } catch (err) {
        symbols[locationId] = "$";
        hasChanges = true;
      }
    }

    if (hasChanges && isMounted.current) {
      currencySymbolsRef.current = symbols;
      setCurrencySymbols(symbols);
    }
  }, [tenantToken, tenantSlug]);

  const fetchData = useCallback(async () => {
    if (isFetching.current || !tenantToken || !tenantSlug) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/invoices/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      if (isMounted.current && Array.isArray(result.invoices)) {
        const sortedData = result.invoices.sort((a, b) => {
          const dateA = getSpacePayment(a).created_at;
          const dateB = getSpacePayment(b).created_at;
          
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          
          return new Date(dateB) - new Date(dateA);
        });
        
        setData(sortedData);
      } else if (isMounted.current) {
        throw new Error(result?.message || "Invalid response format");
      }
    } catch (error) {
      console.error(error);
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
  }, [tenantToken, tenantSlug, getSpacePayment]);

  // Fetch locations on mount
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchLocations();
    }
  }, [tenantToken, tenantSlug, fetchLocations]);

  // Fetch invoices on mount - with initial fetch guard
  useEffect(() => {
    if (tenantToken && tenantSlug && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchData();
    }
  }, [tenantToken, tenantSlug, fetchData]);

  // Fetch currency symbols when data changes
  useEffect(() => {
    if (data.length > 0) {
      const locationIds = data.map(inv => inv.location_id).filter(Boolean);
      if (locationIds.length > 0) {
        fetchCurrencySymbols(locationIds);
      }
    }
  }, [data, fetchCurrencySymbols]);

  const handleEditClick = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setShow(true);
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
    setSelectedInvoice(null);
  }, []);

  const handleCloseInvoice = useCallback(async (invoiceId, invoiceRef) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/invoice/close`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoice_ref: invoiceRef }),
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setPopup({
        message: "Invoice marked as complete!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
      
      fetchData();
    } catch (error) {
      console.error("Error closing invoice:", error);
      setPopup({
        message: "Failed to close invoice!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, fetchData]);

  const handleDeleteBooking = useCallback(async (spotId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ book_spot_id: spotId }),
        }
      );
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || "Failed to cancel.");

      setPopup({
        message: "Booking canceled successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });

      fetchData();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel this booking!");
      setPopup({
        message: "Failed to cancel this booking!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, fetchData]);

  const handleDeleteButton = useCallback((spotId) => {
    setDeletePopup({
      isVisible: true,
      spotId,
    });
  }, []);

  const handleCloseInvoiceButton = useCallback((invoiceId, invoiceRef, paymentStatus) => {
    if (paymentStatus === "pending") {
      setCloseInvoicePopup({
        isVisible: true,
        invoiceId,
        invoiceRef,
      });
    }
  }, []);

  const confirmCloseInvoice = useCallback(() => {
    const { invoiceId, invoiceRef } = closeInvoicePopup;
    handleCloseInvoice(invoiceId, invoiceRef);
    setCloseInvoicePopup({
      isVisible: false,
      invoiceId: null,
      invoiceRef: null,
    });
  }, [closeInvoicePopup, handleCloseInvoice]);

  const confirmDelete = useCallback(() => {
    const { spotId } = deletePopup;
    handleDeleteBooking(spotId);
    setDeletePopup({ isVisible: false, spotId: null });
  }, [deletePopup, handleDeleteBooking]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Memoized columns
  const columns = useMemo(() => [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Invoice Ref",
      accessor: "invoice_ref",
      sort: true,
      Cell: ({ value }) => value || "",
    },
    {
      Header: "Amount",
      accessor: (row) => {
        const spacePayment = getSpacePayment(row);
        const symbol = currencySymbolsRef.current[row.location_id] || "$";
        return `${symbol} ${Number(spacePayment.amount || 0).toLocaleString()}`;
      },
      sort: true,
    },
    {
      Header: "Status",
      accessor: (row) => {
        const spacePayment = getSpacePayment(row);
        return spacePayment.payment_status;
      },
      sort: true,
      Cell: ({ value }) => (
        <span className={`badge ${value === 'completed' ? 'bg-success' : value === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
          {value ? value.toUpperCase() : 'N/A'}
        </span>
      ),
    },
    {
      Header: "Created On",
      accessor: (row) => {
        const spacePayment = getSpacePayment(row);
        return formatDateTime(spacePayment.created_at);
      },
      sort: true,
    },
    {
      Header: "Action",
      accessor: "action",
      sort: false,
      Cell: ({ row }) => {
        const spacePayment = getSpacePayment(row.original);
        const isPending = spacePayment.payment_status === "pending";
        const isNotCompleted = spacePayment.payment_status !== "completed" && 
                              spacePayment.payment_status !== "cancelled";
        
        return (
          <div style={{ whiteSpace: "nowrap" }}>
            {/* View Invoice Icon */}
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`tooltip-view-${row.original.id}`}>View Invoice</Tooltip>}
            >
              <Button
                variant="link"
                size="sm"
                className="me-2 p-0"
                onClick={(e) => handleViewInvoice(row.original.id, e)}
                style={{ color: primary, textDecoration: 'none' }}
                disabled={rowLoading === row.original.id}
              >
                {rowLoading === row.original.id ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <i className="fas fa-eye" style={{ fontSize: '1.1rem' }}></i>
                )}
              </Button>
            </OverlayTrigger>

            {isPending && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id={`tooltip-complete-${row.original.id}`}>Mark as Complete</Tooltip>}
              >
                <Button
                  variant="outline-success"
                  size="sm"
                  className="me-2"
                  onClick={() =>
                    handleCloseInvoiceButton(
                      row.original.id,
                      row.original.invoice_ref,
                      spacePayment.payment_status
                    )
                  }
                  style={{
                    borderColor: primary,
                    color: primary,
                  }}
                >
                  <i className="fas fa-check me-1"></i> Complete
                </Button>
              </OverlayTrigger>
            )}
            
            {isNotCompleted && (
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id={`tooltip-cancel-${row.original.book_spot_id}`}>Cancel Booking</Tooltip>}
              >
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteButton(row.original.book_spot_id)}
                  style={{
                    backgroundColor: primary,
                    borderColor: primary,
                    color: "#fff",
                  }}
                >
                  <i className="fas fa-times me-1"></i> Cancel
                </Button>
              </OverlayTrigger>
            )}
          </div>
        );
      },
    },
  ], [getSpacePayment, formatDateTime, handleCloseInvoiceButton, handleDeleteButton, handleViewInvoice, primary, rowLoading]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Invoices", path: "/settings/invoices", active: true },
        ]}
        title="Invoices"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={12} className="text-end">
                  {showInvoiceDetails ? (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleBackToList}
                    >
                      <i className="mdi mdi-arrow-left me-1"></i>
                      Back to Invoices
                    </Button>
                  ) : (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={loading}
                    >
                      <i className="mdi mdi-refresh me-1"></i>
                      Refresh
                    </Button>
                  )}
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
                  ) : showInvoiceDetails ? (
                    invoiceDetailsLoading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-2">Loading invoice details...</p>
                      </div>
                    ) : (
                      <InvoiceDetailsView
                        invoice={selectedInvoiceDetails}
                        bank={invoiceBank}
                        space={invoiceSpace}
                        charges={invoiceCharges}
                        currencySymbol={currencySymbols[selectedInvoiceDetails?.id] || "$"}
                        formatDateTime={formatDateTime}
                        onBack={handleBackToList}
                      />
                    )
                  ) : loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading your invoices...</p>
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
                      data={data}
                      pageSize={5}
                      pagination
                      isSortable
                      isSearchable
                      sizePerPageList={sizePerPageList}
                      tableClass="table-striped dt-responsive nowrap w-100"
                      searchBoxClass="my-2"
                    />
                  )}
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <InvoicesModal
        show={show}
        onHide={handleClose}
        bankAccount={selectedInvoice}
        onSubmit={fetchData}
        locations={locations}
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
          message="Are you sure you want to cancel this booking?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, spotId: null })}
          buttonLabel="Yes, Cancel"
          onAction={confirmDelete}
        />
      )}

      {closeInvoicePopup.isVisible && (
        <Popup
          message="Are you sure you want to mark this invoice as complete?"
          type="confirm"
          onClose={() => setCloseInvoicePopup({ isVisible: false, invoiceId: null, invoiceRef: null })}
          buttonLabel="Yes, Complete"
          onAction={confirmCloseInvoice}
        />
      )}
    </>
  );
};

export default Invoices;