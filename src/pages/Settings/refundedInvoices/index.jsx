import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import Table2 from "../../../components/Table2";
import InvoiceDetailsView from "./InvoiceDetailsView";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";

const Invoices = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { secondaryColor: secondary } = useLogoColor();

  // Refs to prevent duplicate calls and track state
  const isMounted = useRef(true);
  const isFetching = useRef(false);
  const currencySymbolsRef = useRef({});
  const initialFetchDone = useRef(false);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencySymbols, setCurrencySymbols] = useState({});
  const [rowLoading, setRowLoading] = useState(null);

  // Invoice details view state
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

  // Helper to safely pull the original booking fee off the invoice
  const getInvoiceAmount = useCallback((invoice) => {
    if (!invoice) return 0;
    return Number(invoice?.amount || 0);
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
    event.stopPropagation();

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

        if (result.bank?.location_id) {
          const symbol = await fetchCurrencySymbol(result.bank.location_id);
          setCurrencySymbols((prev) => ({ ...prev, [id]: symbol }));
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
        const symbol =
          Array.isArray(result.data) && result.data.length > 0
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
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/refunded/invoices`,
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
          const dateA = a?.created_at;
          const dateB = b?.created_at;

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
  }, [tenantToken, tenantSlug]);

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
      const locationIds = data.map((inv) => inv.location_id).filter(Boolean);
      if (locationIds.length > 0) {
        fetchCurrencySymbols(locationIds);
      }
    }
  }, [data, fetchCurrencySymbols]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Memoized columns
  const columns = useMemo(
    () => [
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
        Header: "Amount Refunded",
        accessor: (row) => {
          const symbol = currencySymbolsRef.current[row.location_id] || "₦";
          return `${symbol} ${getInvoiceAmount(row).toLocaleString()}`;
        },
        sort: true,
      },
      {
        Header: "Status",
        accessor: () => "refunded",
        sort: false,
        Cell: () => <span className="badge bg-success">REFUNDED</span>,
      },
      {
        Header: "Refunded On",
        accessor: (row) => formatDateTime(row.created_at),
        sort: true,
      },
      {
        Header: "Action",
        accessor: "action",
        sort: false,
        Cell: ({ row }) => (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={(e) => handleViewInvoice(row.original.id, e)}
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
              <>
                <i className="fas fa-eye me-1"></i> View
              </>
            )}
          </Button>
        ),
      },
    ],
    [getInvoiceAmount, formatDateTime, handleViewInvoice, rowLoading]
  );

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
                        currencySymbol={
                          currencySymbols[selectedInvoiceDetails?.id] || "₦"
                        }
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
    </>
  );
};

export default Invoices;