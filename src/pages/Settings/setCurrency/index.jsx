import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import CurrencyRegistrationModal from "./CurrencyRegistration";
import TaxesRegistrationModal from "./TaxesRegistration";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";

const Currency = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetchingCurrency = useRef(false);
  const isFetchingTaxes = useRef(false);
  const isFetchingLocations = useRef(false);

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showTaxesModal, setShowTaxesModal] = useState(false);
  const [currencyData, setCurrencyData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [loadingCurrency, setLoadingCurrency] = useState(true);
  const [loadingTaxes, setLoadingTaxes] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedTax, setSelectedTax] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    currencyId: null,
  });

  const [taxDeletePopup, setTaxDeletePopup] = useState({
    isVisible: false,
    taxId: null,
  });

  const [currencyPagination, setCurrencyPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  const [taxPagination, setTaxPagination] = useState({
    currentPage: 1,
    totalPages: 1,
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

  const fetchCurrencyData = useCallback(async (locationId, page = 1, pageSize = 10) => {
    if (isFetchingCurrency.current || !tenantToken || !tenantSlug || !locationId) return;
    
    isFetchingCurrency.current = true;
    setLoadingCurrency(true);
    setError(null);
    
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
        
        setCurrencyData(sortedData);
        
        // Client-side pagination
        const totalPages = Math.ceil(sortedData.length / pageSize);
        setCurrencyPagination({
          currentPage: page,
          totalPages: totalPages,
          pageSize: pageSize,
        });
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
        setLoadingCurrency(false);
      }
      isFetchingCurrency.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchTaxData = useCallback(async (page = 1, pageSize = 10) => {
    if (isFetchingTaxes.current || !tenantToken || !tenantSlug) return;
    
    isFetchingTaxes.current = true;
    setLoadingTaxes(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/taxes?page=${page}&per_page=${pageSize}`,
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

      if (isMounted.current && Array.isArray(result)) {
        const sortedData = [...result].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        
        setTaxData(sortedData);
        
        // Client-side pagination
        const totalPages = Math.ceil(sortedData.length / pageSize);
        setTaxPagination({
          currentPage: page,
          totalPages: totalPages,
          pageSize: pageSize,
        });
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
        setLoadingTaxes(false);
      }
      isFetchingTaxes.current = false;
    }
  }, [tenantToken, tenantSlug]);

  // Fetch locations on mount
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchLocations();
      fetchTaxData();
    }
  }, [tenantToken, tenantSlug, fetchLocations, fetchTaxData]);

  // Fetch currency data when location changes
  useEffect(() => {
    if (tenantToken && tenantSlug && selectedLocation) {
      fetchCurrencyData(selectedLocation, currencyPagination.currentPage, currencyPagination.pageSize);
    } else {
      setCurrencyData([]);
    }
  }, [tenantToken, tenantSlug, selectedLocation, currencyPagination.currentPage, currencyPagination.pageSize, fetchCurrencyData]);

  const handleCurrencyEditClick = useCallback((currency) => {
    setSelectedCurrency(currency);
    setShowCurrencyModal(true);
  }, []);

  const handleTaxEditClick = useCallback((tax) => {
    setSelectedTax(tax);
    setShowTaxesModal(true);
  }, []);

  const handleCloseCurrencyModal = useCallback(() => {
    setShowCurrencyModal(false);
    setSelectedCurrency(null);
  }, []);

  const handleCloseTaxesModal = useCallback(() => {
    setShowTaxesModal(false);
    setSelectedTax(null);
  }, []);

  const handleDeleteCurrency = useCallback(async (currencyId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/currencies/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: currencyId }),
        }
      );
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || "Failed to delete.");

      setPopup({
        message: "Currency deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });

      // Refresh data
      if (selectedLocation) {
        fetchCurrencyData(selectedLocation, currencyPagination.currentPage, currencyPagination.pageSize);
      }
    } catch (error) {
      console.error("Error deleting currency:", error);
      toast.error("Failed to delete currency!");
      setPopup({
        message: "Failed to delete currency!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, selectedLocation, fetchCurrencyData, currencyPagination.currentPage, currencyPagination.pageSize]);

  const handleDeleteTax = useCallback(async (taxId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/taxes/delete/${taxId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || "Failed to delete.");

      setPopup({
        message: "Tax deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });

      // Refresh data
      fetchTaxData(taxPagination.currentPage, taxPagination.pageSize);
    } catch (error) {
      console.error("Error deleting tax:", error);
      toast.error("Failed to delete tax!");
      setPopup({
        message: "Failed to delete tax!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, fetchTaxData, taxPagination.currentPage, taxPagination.pageSize]);

  const handleDeleteButton = useCallback((currencyId) => {
    setDeletePopup({
      isVisible: true,
      currencyId,
    });
  }, []);

  const handleTaxDeleteButton = useCallback((taxId) => {
    setTaxDeletePopup({
      isVisible: true,
      taxId,
    });
  }, []);

  const confirmCurrencyDelete = useCallback(() => {
    handleDeleteCurrency(deletePopup.currencyId);
    setDeletePopup({ isVisible: false, currencyId: null });
  }, [deletePopup, handleDeleteCurrency]);

  const confirmTaxDelete = useCallback(() => {
    handleDeleteTax(taxDeletePopup.taxId);
    setTaxDeletePopup({ isVisible: false, taxId: null });
  }, [taxDeletePopup, handleDeleteTax]);

  const handleLocationChange = useCallback((e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setCurrencyPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleCurrencyPageChange = useCallback((page) => {
    setCurrencyPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleCurrencyPageSizeChange = useCallback((pageSize) => {
    setCurrencyPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const handleTaxPageChange = useCallback((page) => {
    setTaxPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleTaxPageSizeChange = useCallback((pageSize) => {
    setTaxPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const handleRefreshCurrency = useCallback(() => {
    if (selectedLocation) {
      fetchCurrencyData(selectedLocation, currencyPagination.currentPage, currencyPagination.pageSize);
    }
  }, [selectedLocation, fetchCurrencyData, currencyPagination.currentPage, currencyPagination.pageSize]);

  const handleRefreshTaxes = useCallback(() => {
    fetchTaxData(taxPagination.currentPage, taxPagination.pageSize);
  }, [fetchTaxData, taxPagination.currentPage, taxPagination.pageSize]);

  // Memoized currency columns
  const currencyColumns = useMemo(() => [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1 + (currencyPagination.currentPage - 1) * currencyPagination.pageSize,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Currency Name",
      accessor: "name",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Currency Symbol",
      accessor: "symbol",
      sort: true,
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
              handleCurrencyEditClick(row.original);
            }}
            style={{ marginRight: "10px" }}
            title="Edit Currency"
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
            title="Delete Currency"
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </div>
      ),
    },
  ], [currencyPagination.currentPage, currencyPagination.pageSize, handleCurrencyEditClick, handleDeleteButton, formatDateTime]);

  // Memoized tax columns
  const taxColumns = useMemo(() => [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1 + (taxPagination.currentPage - 1) * taxPagination.pageSize,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Tax Name",
      accessor: "name",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Description",
      accessor: "description",
      sort: true,
    },
    {
      Header: "Rate (%)",
      accessor: "percentage",
      sort: true,
      Cell: ({ value }) => value ? `${value}%` : "0%",
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
              handleTaxEditClick(row.original);
            }}
            style={{ marginRight: "10px" }}
            title="Edit Tax"
          >
            <i className="mdi mdi-square-edit-outline"></i>
          </Link>
          <Link
            to="#"
            className="action-icon text-danger"
            onClick={(e) => {
              e.preventDefault();
              handleTaxDeleteButton(row.original.id);
            }}
            title="Delete Tax"
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </div>
      ),
    },
  ], [taxPagination.currentPage, taxPagination.pageSize, handleTaxEditClick, handleTaxDeleteButton, formatDateTime]);

  // Paginate currency data
  const paginatedCurrencyData = useMemo(() => {
    const start = (currencyPagination.currentPage - 1) * currencyPagination.pageSize;
    const end = start + currencyPagination.pageSize;
    return currencyData.slice(start, end);
  }, [currencyData, currencyPagination.currentPage, currencyPagination.pageSize]);

  // Paginate tax data
  const paginatedTaxData = useMemo(() => {
    const start = (taxPagination.currentPage - 1) * taxPagination.pageSize;
    const end = start + taxPagination.pageSize;
    return taxData.slice(start, end);
  }, [taxData, taxPagination.currentPage, taxPagination.pageSize]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Currency & Taxes", path: "/settings/currency-taxes", active: true },
        ]}
        title="Currency & Taxes"
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
                      setSelectedCurrency(null);
                      setShowCurrencyModal(true);
                    }}
                    style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Set Currency
                  </Button>
                  
                  <Button
                    variant="outline-primary"
                    className="waves-effect waves-light"
                    onClick={() => {
                      setSelectedTax(null);
                      setShowTaxesModal(true);
                    }}
                    style={{ borderColor: primary, color: primary }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add Tax
                  </Button>
                </Col>
              </Row>

              {/* Currency Section */}
              <Card className="mb-4">
                <Card.Header>
                  <Row>
                    <Col>
                      <h5 className="mb-0">Currency Settings</h5>
                    </Col>
                    <Col className="text-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleRefreshCurrency}
                        disabled={loadingCurrency || !selectedLocation}
                      >
                        <i className="mdi mdi-refresh me-1"></i>
                        Refresh
                      </Button>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body style={{ background: secondary }}>
                  {loadingLocations ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading locations...</p>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <Form.Select
                        value={selectedLocation}
                        onChange={handleLocationChange}
                        required
                      >
                        <option value="">Select a location</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} - {location.state}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  )}
                  
                  {selectedLocation && (
                    <>
                      {error && !loadingCurrency ? (
                        <div className="alert alert-danger">
                          <i className="mdi mdi-alert-circle-outline me-2"></i>
                          Error: {error}
                        </div>
                      ) : loadingCurrency ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                          <p className="mt-2">Loading currencies...</p>
                        </div>
                      ) : (
                        <Table2
                          columns={currencyColumns}
                          data={paginatedCurrencyData}
                          pageSize={currencyPagination.pageSize}
                          isSortable
                          isSearchable
                          pagination
                          tableClass="table-striped dt-responsive nowrap w-100"
                          searchBoxClass="my-2"
                          paginationProps={{
                            currentPage: currencyPagination.currentPage,
                            totalPages: currencyPagination.totalPages,
                            onPageChange: handleCurrencyPageChange,
                            onPageSizeChange: handleCurrencyPageSizeChange,
                          }}
                        />
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>

              {/* Taxes Section */}
              <Card>
                <Card.Header>
                  <Row>
                    <Col>
                      <h5 className="mb-0">Tax Settings</h5>
                    </Col>
                    <Col className="text-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleRefreshTaxes}
                        disabled={loadingTaxes}
                      >
                        <i className="mdi mdi-refresh me-1"></i>
                        Refresh
                      </Button>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body style={{ background: secondary }}>
                  {loadingTaxes ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading taxes...</p>
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
                      columns={taxColumns}
                      data={paginatedTaxData}
                      pageSize={taxPagination.pageSize}
                      isSortable
                      isSearchable
                      pagination
                      tableClass="table-striped dt-responsive nowrap w-100"
                      searchBoxClass="my-2"
                      paginationProps={{
                        currentPage: taxPagination.currentPage,
                        totalPages: taxPagination.totalPages,
                        onPageChange: handleTaxPageChange,
                        onPageSizeChange: handleTaxPageSizeChange,
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <CurrencyRegistrationModal
        show={showCurrencyModal}
        onHide={handleCloseCurrencyModal}
        currency={selectedCurrency}
        locations={locations}
        onSubmit={() => {
          if (selectedLocation) {
            fetchCurrencyData(selectedLocation, currencyPagination.currentPage, currencyPagination.pageSize);
          }
        }}
      />

      <TaxesRegistrationModal
        show={showTaxesModal}
        onHide={handleCloseTaxesModal}
        tax={selectedTax}
        onSubmit={() => {
          fetchTaxData(taxPagination.currentPage, taxPagination.pageSize);
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
          message="Are you sure you want to delete this currency?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, currencyId: null })}
          buttonLabel="Yes, Delete"
          onAction={confirmCurrencyDelete}
        />
      )}

      {taxDeletePopup.isVisible && (
        <Popup
          message="Are you sure you want to delete this tax?"
          type="confirm"
          onClose={() => setTaxDeletePopup({ isVisible: false, taxId: null })}
          buttonLabel="Yes, Delete"
          onAction={confirmTaxDelete}
        />
      )}
    </>
  );
};

export default Currency;