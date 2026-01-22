import React, { useEffect, useState, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import axios from "axios";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";

const InvoiceDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const [invoice, setInvoice] = useState(location.state?.invoice);
  const [bank, setBank] = useState("");
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(!invoice);
  const [charges, setCharges] = useState([]);
  const tenantSlug = user?.tenant;
  const printRef = useRef();
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;

    const opt = {
      margin: 0.5,
      filename: `Invoice_${invoice.invoice_ref}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    // console.log("Updated user context:", user);
  }, [user]);

  const calculateChargesTotal = () => {
    return charges.reduce((total, charge) => total + (Number(charge.fee) || 0), 0);
  };

  const calculateBaseAmount = () => {
    const invoiceAmount = Number(invoice?.amount) || 0;
    const chargesTotal = calculateChargesTotal();
    return invoiceAmount - chargesTotal;
  };

  const calculateGrandTotal = () => {
    const baseAmount = calculateBaseAmount();
    const chargesTotal = calculateChargesTotal();
    return baseAmount + chargesTotal;
  };

  useEffect(() => {
    if (!invoice) {
      const fetchInvoice = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/invoice/show/${id}`,
            {
              headers: { Authorization: `Bearer ${user?.tenantToken}` },
            }
          );
          console.log("response", response);
          
          if (response.data.invoice || response.data.bank) {
            setInvoice(response.data.invoice);
            setBank(response.data.bank);
            setSpace(response.data.space_info);
            setCharges(response.data.charges);
            setSelectedLocation(response.data.bank.location_id);
            
            if (response.data.charges && Array.isArray(response.data.charges)) {
              setCharges(response.data.charges);
            } else {
              setCharges([]);
            }
          } else {
            toast.error("No invoice details found.");
          }
        } catch (error) {
          toast.error("Failed to fetch invoice details.");
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [id, invoice, user]);

  const fetchCurrencySymbol = async (locationId) => {
    if (!locationId) {
      setCurrencySymbol("₦");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/fetch/currency/location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.tenantToken}`,
          },
          body: JSON.stringify({ location_id: locationId }),
        }
      );
      const result = await response.json();
      if (Array.isArray(result.data) && result.data.length > 0) {
        setCurrencySymbol(result.data[0].symbol || "₦");
      } else {
        setCurrencySymbol("₦");
      }
    } catch (err) {
      setCurrencySymbol("₦");
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      fetchCurrencySymbol(selectedLocation);
    }
  }, [selectedLocation]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!invoice) {
    return <p>No invoice found.</p>;
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
            <div className="mb-2">
              <h3 className="text-center">Invoice</h3>
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="mb-1">Billed To:</h5>
                  <p className="mb-0">{invoice?.user?.first_name} {invoice?.user?.last_name}</p>
                  <p className="mb-0">{invoice.email}</p>
                  <p>{invoice.phone_number}</p>
                </div>
                <div className="text-end">
                  <h6 className="mb-1">Invoice Ref:</h6>
                  <p>{invoice.invoice_ref}</p>
                  <h6 className="mb-1">Date Issued:</h6>
                  <p>{formatDateTime(invoice.created_at)}</p>
                </div>
              </div>
            </div>

            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th>Amount ({currencySymbol})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>Space Booking - {space?.space_name || 'Spot'}</b>
                    <div className="ms-3 mt-2">
                      {space ? (
                        <div>
                          <small>
                            <b>Location:</b> {space?.location_name}<br/>
                            <b>Floor:</b> {space?.floor_name}<br/>
                            <b>Category:</b> {space?.category_name}<br/>
                            <b>Booking Type:</b> {space?.booking_type}
                          </small>
                        </div>
                      ) : (
                        <small>Reserved spot - No spot reserved yet, status might be pending</small>
                      )}
                    </div>
                    <div className="ms-3 mt-2">
                      <small>
                        <b>Booking Details:</b><br/>
                        {invoice?.schedule?.map((item, index) => (
                          <div key={index}>
                            Date: {item.date}<br/>
                            Start: {formatDateTime(item.start_time)}<br/>
                            End: {formatDateTime(item.end_time)}
                          </div>
                        ))}
                      </small>
                    </div>
                  </td>
                  <td className="align-middle">
                    {calculateBaseAmount().toLocaleString()}
                  </td>
                </tr>

                {charges.length > 0 ? (
                  charges.map((charge, index) => (
                    <tr key={`charge-${index}`}>
                      <td>
                        <b>{charge.name || 'Additional Charge'}</b>
                      </td>
                      <td className="align-middle">
                        {Number(charge.fee).toLocaleString()}
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
                  <th>Base Amount:</th>
                  <th>{currencySymbol} {calculateBaseAmount().toLocaleString()}</th>
                </tr>
                
                {charges.length > 0 && (
                  <tr>
                    <th>Additional Charges:</th>
                    <th>{currencySymbol} {calculateChargesTotal().toLocaleString()}</th>
                  </tr>
                )}
                
                <tr className="table-active">
                  <th>Grand Total:</th>
                  <th>{currencySymbol} {Number(invoice.amount).toLocaleString()}</th>
                </tr>
              </tfoot>
            </table>
            
            {bank && (
              <div className="text-center mt-4">
                <h6>Payment Information</h6>
                <p className="mb-1">
                  <b>Bank Name:</b> {bank?.bank_name}
                </p>
                <p className="mb-1">
                  <b>Account Name:</b> {bank?.account_name}
                </p>
                <p className="mb-0">
                  <b>Account Number:</b> {bank?.account_number}
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`badge ${
                    invoice.status === "completed"
                      ? "bg-success"
                      : "bg-warning text-dark"
                  }`}
                >
                  {invoice.status.toUpperCase()}
                </span>
              </p>
              <p className="text-muted">
                <small>Invoice ID: {invoice.id}</small>
              </p>
            </div>
          </div>

          <div className="text-end mt-3">
            <Button variant="primary" onClick={handlePrint} className="me-2">
              Print Invoice
            </Button>
            <Button variant="success" onClick={handleDownloadPDF}>
              Download as PDF
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default InvoiceDetails;