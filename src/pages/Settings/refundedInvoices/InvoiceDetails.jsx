import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Spinner, Button, Alert } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";

const InvoiceDetails = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  
  const [invoice, setInvoice] = useState(null);
  const [bank, setBank] = useState(null);
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [charges, setCharges] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [error, setError] = useState(null);
  
  const printRef = useRef();
  const isMounted = useRef(true);

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

  const fetchCurrencySymbol = useCallback(async (locationId) => {
    if (!locationId || !tenantToken || !tenantSlug) return "₦";
    
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
        return result.data[0].symbol || "₦";
      }
      return "₦";
    } catch (err) {
      return "₦";
    }
  }, [tenantToken, tenantSlug]);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!tenantToken || !tenantSlug || !id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/invoice/show/${id}`,
          {
            headers: { 
              Authorization: `Bearer ${tenantToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch invoice. Status: ${response.status}`);
        }

        const result = await response.json();
        
        if (isMounted.current) {
          setInvoice(result.invoice || null);
          setBank(result.bank || null);
          setSpace(result.space_info || null);
          setCharges(Array.isArray(result.charges) ? result.charges : []);
          
          // Fetch currency symbol
          if (result.bank?.location_id) {
            const symbol = await fetchCurrencySymbol(result.bank.location_id);
            setCurrencySymbol(symbol);
          }
        }
      } catch (error) {
        if (isMounted.current) {
          setError(error.message);
          toast.error("Failed to fetch invoice details.");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchInvoice();
  }, [id, tenantToken, tenantSlug, fetchCurrencySymbol]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(() => {
    if (!printRef.current || !invoice) return;

    const opt = {
      margin: 0.5,
      filename: `Invoice_${invoice.invoice_ref}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(printRef.current).save();
  }, [invoice]);

  const calculateChargesTotal = useCallback(() => {
    return charges.reduce((total, charge) => total + (Number(charge.fee) || 0), 0);
  }, [charges]);

  const calculateBaseAmount = useCallback(() => {
    const invoiceAmount = Number(invoice?.amount) || 0;
    const chargesTotal = calculateChargesTotal();
    return invoiceAmount - chargesTotal;
  }, [invoice, calculateChargesTotal]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading invoice details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!invoice) {
    return (
      <Alert variant="warning" className="m-3">
        <Alert.Heading>No Data</Alert.Heading>
        <p>No invoice found.</p>
      </Alert>
    );
  }

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Invoices", path: "/settings/invoices" },
          { label: `Invoice ${invoice.invoice_ref}`, active: true },
        ]}
        title={`Invoice Details - ${invoice.invoice_ref}`}
      />

      <Card className="shadow">
        <Card.Body>
          <div ref={printRef}>
            <div className="mb-4">
              <h3 className="text-center mb-4">INVOICE</h3>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="mb-2">Billed To:</h6>
                  <p className="mb-1">
                    <strong>{invoice?.user?.first_name} {invoice?.user?.last_name}</strong>
                  </p>
                  <p className="mb-1">{invoice.email}</p>
                  <p className="mb-0">{invoice.phone_number}</p>
                </div>
                <div className="text-end">
                  <h6 className="mb-2">Invoice Details:</h6>
                  <p className="mb-1">
                    <strong>Ref:</strong> {invoice.invoice_ref}
                  </p>
                  <p className="mb-1">
                    <strong>Date:</strong> {formatDateTime(invoice.created_at)}
                  </p>
                  <p className="mb-0">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        invoice.status === "completed"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {invoice.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th className="text-end">Amount ({currencySymbol})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Space Booking</strong>
                    {space && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <div><strong>Space:</strong> {space.space_name}</div>
                          <div><strong>Location:</strong> {space.location_name}</div>
                          <div><strong>Floor:</strong> {space.floor_name}</div>
                          <div><strong>Category:</strong> {space.category_name}</div>
                          <div><strong>Booking Type:</strong> {space.booking_type}</div>
                        </small>
                      </div>
                    )}
                    
                    {invoice?.schedule?.length > 0 && (
                      <div className="mt-2">
                        <strong>Schedule:</strong>
                        <ul className="mt-1">
                          {invoice.schedule.map((item, index) => (
                            <li key={index} className="small">
                              {item.date}<br/>
                              {formatDateTime(item.start_time)} - {formatDateTime(item.end_time)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                  <td className="text-end align-middle">
                    <strong>{currencySymbol} {calculateBaseAmount().toLocaleString()}</strong>
                  </td>
                </tr>

                {charges.length > 0 ? (
                  charges.map((charge, index) => (
                    <tr key={`charge-${index}`}>
                      <td>
                        <strong>{charge.name || 'Additional Charge'}</strong>
                      </td>
                      <td className="text-end">
                        {currencySymbol} {Number(charge.fee).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center text-muted">
                      No additional charges
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th>Subtotal:</th>
                  <th className="text-end">{currencySymbol} {calculateBaseAmount().toLocaleString()}</th>
                </tr>
                
                {charges.length > 0 && (
                  <tr>
                    <th>Additional Charges:</th>
                    <th className="text-end">{currencySymbol} {calculateChargesTotal().toLocaleString()}</th>
                  </tr>
                )}
                
                <tr className="table-active">
                  <th>Total Amount:</th>
                  <th className="text-end">{currencySymbol} {Number(invoice.amount).toLocaleString()}</th>
                </tr>
              </tfoot>
            </table>
            
            {bank && (
              <div className="text-center mt-4 p-3 bg-light">
                <h6 className="mb-3">Payment Information</h6>
                <p className="mb-1">
                  <strong>Bank:</strong> {bank.bank_name}
                </p>
                <p className="mb-1">
                  <strong>Account Name:</strong> {bank.account_name}
                </p>
                <p className="mb-0">
                  <strong>Account Number:</strong> {bank.account_number}
                </p>
              </div>
            )}
            
            <div className="mt-4 text-muted small">
              <p className="mb-0">Invoice ID: {invoice.id}</p>
            </div>
          </div>

          <div className="text-end mt-4">
            <Button 
              variant="primary" 
              onClick={handlePrint} 
              className="me-2"
              disabled={loading}
            >
              <i className="mdi mdi-printer me-1"></i>
              Print Invoice
            </Button>
            <Button 
              variant="success" 
              onClick={handleDownloadPDF}
              disabled={loading}
            >
              <i className="mdi mdi-download me-1"></i>
              Download PDF
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default InvoiceDetails;