import React, { useRef, useCallback, useState, useEffect } from "react";
import { Button, Spinner, Badge } from "react-bootstrap";
import html2pdf from "html2pdf.js";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useLogoColor } from "../../../context/LogoColorContext";
import profileImg from "@/assets/images/users/user-1.jpg";

const InvoiceDetailsView = ({
  invoice,
  bank,
  space,
  charges = [],
  currencySymbol = "$",
  formatDateTime,
  onBack,
}) => {
  const printRef = useRef();
  const { user } = useAuthContext();
  const { colour: brandColor } = useLogoColor();

  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const [logo, setLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [loadingLogo, setLoadingLogo] = useState(false);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!tenantToken || !tenantSlug) return;
      setLoadingLogo(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-details`,
          {
            headers: { Authorization: `Bearer ${tenantToken}` },
          }
        );
        const result = await response.json();
        if (response.ok && result.data) {
          const { logo, company_name } = result.data;
          if (logo) setLogo(logo);
          if (company_name) setCompanyName(company_name);
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoadingLogo(false);
      }
    };
    fetchCompanyDetails();
  }, [tenantToken, tenantSlug]);

  // Calculations
  const calculateChargesTotal = useCallback(() => {
    return charges.reduce(
      (total, charge) => total + (Number(charge.fee) || 0),
      0
    );
  }, [charges]);

  const calculateBaseAmount = useCallback(() => {
    const invoiceAmount = Number(invoice?.amount) || 0;
    return invoiceAmount - calculateChargesTotal();
  }, [invoice, calculateChargesTotal]);

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

  const getLogoSrc = useCallback(() => {
    if (logo) {
      if (logo.startsWith("http")) return logo;
      return `${import.meta.env.VITE_BACKEND_URL}/storage/uploads/tenant_logo/${logo}`;
    }
    return profileImg;
  }, [logo]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'paid': 'success',
      'pending': 'warning',
      'cancelled': 'danger',
      'overdue': 'danger',
      'completed': 'success'
    };
    return statusMap[status?.toLowerCase()] || 'secondary';
  };

  if (!invoice) return null;

  const expiryDate = invoice?.book_spot?.expiry_day;
  const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

  return (
    <>
      {loadingLogo && (
        <div className="text-center mb-4 p-3 bg-light rounded no-print">
          <Spinner animation="border" size="sm" />
          <span className="ms-2 text-muted">Loading company details...</span>
        </div>
      )}

      <div ref={printRef} className="invoice-container p-4 bg-white">
        {/* Header with Logo and Company Info */}
        <div className="row mb-4">
          <div className="col-6">
            <img
              src={getLogoSrc()}
              alt="Company Logo"
              style={{
                maxHeight: "80px",
                maxWidth: "200px",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = profileImg;
              }}
            />
            <h4 className="mt-2" style={{ color: brandColor }}>
              {companyName}
            </h4>
          </div>
          <div className="col-6 text-end">
            <h2 className="mb-2" style={{ fontWeight: "700" }}>
              INVOICE
            </h2>
            <p className="mb-1">
              <strong>Invoice #:</strong> {invoice.invoice_ref}
            </p>
            <p className="mb-1">
              <strong>Date:</strong> {formatDateTime(invoice.created_at)}
            </p>
            <p className="mb-0">
              <strong>Status:</strong>{" "}
              <Badge bg={getStatusBadge(invoice.status)}>
                {invoice.status?.toUpperCase()}
              </Badge>
            </p>
          </div>
        </div>

        {/* Bill To and Invoice Details */}
        <div className="row mb-4">
          <div className="col-6">
            <h5 style={{ borderBottom: `2px solid ${brandColor}`, paddingBottom: "6px" }}>
              Bill To
            </h5>
            <p className="mb-1 fw-semibold mt-3">
              {invoice?.user?.first_name} {invoice?.user?.last_name}
            </p>
          </div>
        </div>

        {/* Space Details */}
        {space && (
          <div className="mb-4">
            <h5 style={{ borderBottom: `2px solid ${brandColor}`, paddingBottom: "6px" }}>
              Space Details
            </h5>
            <div className="row mt-3">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Space:</strong> {space.space_name}
                </p>
                <p className="mb-1">
                  <strong>Category:</strong> {space.category_name}
                </p>
                <p className="mb-1">
                  <strong>Floor:</strong> {space.floor_name}
                </p>
                <p className="mb-1">
                  <strong>Location:</strong> {space.location_name}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Booking Type:</strong> {space.booking_type}
                </p>
                <p className="mb-1">
                  <strong>Space Fee:</strong> {currencySymbol} {Number(space.space_fee).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expiry Information */}
        {expiryDate && (
          <div className={`mb-4 p-3 rounded ${isExpired ? 'bg-light-danger' : 'bg-light-info'}`}>
            <h5 style={{ borderBottom: `2px solid ${brandColor}`, paddingBottom: "6px" }}>
              Validity Period
            </h5>
            <div className="mt-3">
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Valid From:</strong> {formatDateTime(invoice?.book_spot?.start_time)}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Valid Until:</strong> {formatDateTime(expiryDate)}
                  </p>
                </div>
              </div>
              <p className="mb-0 mt-2">
                <Badge bg={isExpired ? 'danger' : 'info'}>
                  {isExpired ? 'Expired' : 'Active'}
                </Badge>
              </p>
            </div>
          </div>
        )}

        {/* Charges Table */}
        <div className="table-responsive mb-4">
          <table className="table">
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th>Description</th>
                <th className="text-end">Amount ({currencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Space Booking</strong>
                  <br />
                  <small className="text-muted">
                    {space?.space_name} - {space?.booking_type}
                  </small>
                </td>
                <td className="text-end">
                  {currencySymbol} {calculateBaseAmount().toLocaleString()}
                </td>
              </tr>

              {charges.map((charge, index) => (
                <tr key={index}>
                  <td>{charge.name}</td>
                  <td className="text-end">
                    {currencySymbol} {Number(charge.fee).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-end fw-bold" style={{ fontSize: "1.1em" }}>
                  Total Amount:
                </td>
                <td
                  className="text-end fw-bold"
                  style={{ color: brandColor, fontSize: "1.1em" }}
                >
                  {currencySymbol} {Number(invoice.amount).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Details */}
        {bank && (
          <div className="mb-4">
            <h5 style={{ borderBottom: `2px solid ${brandColor}`, paddingBottom: "6px" }}>
              Payment Details
            </h5>
            <div className="row mt-3">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Bank:</strong> {bank.bank_name}
                </p>
                <p className="mb-1">
                  <strong>Account Name:</strong> {bank.account_name}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Account Number:</strong> {bank.account_number}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-4 no-print">
        <Button variant="outline-secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleDownloadPDF}
          style={{ backgroundColor: brandColor, borderColor: brandColor }}
        >
          Download PDF
        </Button>
      </div>

      <style>
        {`
          @media print {
            body { background: white; }
            .no-print { display: none !important; }
          }
          .invoice-container img {
            max-width: 100% !important;
            height: auto !important;
          }
          .bg-light-danger {
            background-color: #fff2f0;
          }
          .bg-light-info {
            background-color: #e6f7ff;
          }
        `}
      </style>
    </>
  );
};

export default InvoiceDetailsView;



