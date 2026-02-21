import React, { useRef, useCallback, useState, useEffect } from "react";
import { Button, Spinner } from "react-bootstrap";
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

  /* ================= FETCH COMPANY DETAILS ================= */
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!tenantToken || !tenantSlug) return;

      setLoadingLogo(true);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-details`,
          {
            headers: {
              Authorization: `Bearer ${tenantToken}`,
            },
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

  /* ================= CALCULATIONS ================= */

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

  if (!invoice) return null;

  return (
    <>
      {loadingLogo && (
        <div className="text-center mb-4 p-3 bg-light rounded no-print">
          <Spinner animation="border" size="sm" />
          <span className="ms-2 text-muted">
            Loading company details...
          </span>
        </div>
      )}

      <div ref={printRef} className="invoice-container p-4 bg-white">

        {/* ================= HEADER WITH SPACE DETAILS ON LEFT ================= */}
        <div className="row mb-5" style={{ display: 'flex', alignItems: 'baseline' }}>
          {/* Left Column - Space Details */}
          <div className="col-6">
            {space && (
              <div style={{ display: 'inline-block', verticalAlign: 'baseline' }}>
                <h5
                  style={{
                    fontWeight: "700",
                    letterSpacing: "2px",
                    marginBottom: "15px",
                    lineHeight: "1.2",
                  }}
                >
                  SPACE DETAILS
                </h5>
                <div>
                  <p className="mb-1">
                    <strong>Space Name:</strong> {space.space_name}
                  </p>
                  <p className="mb-1">
                    <strong>Type:</strong> {space.type}
                  </p>
                  <p className="mb-1">
                    <strong>Capacity:</strong> {space.capacity} people
                  </p>
                  {space.amenities && (
                    <p className="mb-1">
                      <strong>Amenities:</strong> {space.amenities}
                    </p>
                  )}
                  {space.location && (
                    <p className="mb-1">
                      <strong>Location:</strong> {space.location}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Logo and Company Info (from second component) */}
          <div className="col-6 text-end">
            <div style={{ display: 'inline-block', verticalAlign: 'baseline' }}>
              {/* COMPANY LOGO */}
              <div className="mb-3">
                <img
                  src={getLogoSrc()}
                  alt="Company Logo"
                  style={{
                    maxHeight: "130px",
                    maxWidth: "280px",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = profileImg;
                  }}
                />
              </div>

              {/* COMPANY NAME */}
              <h4
                className="mb-3"
                style={{
                  color: brandColor,
                  fontWeight: "700",
                  letterSpacing: "1px",
                }}
              >
                {companyName}
              </h4>

              {/* INVOICE TITLE */}
              <h2
                className="mb-3"
                style={{
                  fontWeight: "700",
                  letterSpacing: "2px",
                }}
              >
                INVOICE
              </h2>

              {/* INVOICE DETAILS */}
              <p className="mb-1">
                <strong>Invoice #:</strong> {invoice.invoice_ref}
              </p>
              <p className="mb-1">
                <strong>Date:</strong>{" "}
                {formatDateTime(invoice.created_at)}
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
                  {invoice.status?.toUpperCase() || "PENDING"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ================= BILL TO ================= */}
        <div className="mb-4">
          <h5
            style={{
              borderBottom: `2px solid ${brandColor}`,
              paddingBottom: "6px",
            }}
          >
            Bill To
          </h5>

          <p className="mb-1 fw-semibold mt-3">
            {invoice?.user?.first_name} {invoice?.user?.last_name}
          </p>
          <p className="mb-1 text-muted">{invoice.email}</p>
          <p className="text-muted">{invoice.phone_number}</p>
        </div>

        {/* ================= TABLE ================= */}
        <div className="table-responsive mb-4">
          <table className="table">
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th>Description</th>
                <th className="text-end">
                  Amount ({currencySymbol})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Space Booking</td>
                <td className="text-end">
                  {currencySymbol}{" "}
                  {calculateBaseAmount().toLocaleString()}
                </td>
              </tr>

              {charges.map((charge, index) => (
                <tr key={index}>
                  <td>{charge.name}</td>
                  <td className="text-end">
                    {currencySymbol}{" "}
                    {Number(charge.fee).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-end fw-bold">Total:</td>
                <td
                  className="text-end fw-bold"
                  style={{ color: brandColor }}
                >
                  {currencySymbol}{" "}
                  {Number(invoice.amount).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ================= PAYMENT ACCOUNTS ================= */}
        {bank && (
          <div className="mb-4">
            <h5
              style={{
                borderBottom: `2px solid ${brandColor}`,
                paddingBottom: "6px",
              }}
            >
              Payment Details
            </h5>
            <div className="row mt-3">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Bank Name:</strong> {bank.bank_name}
                </p>
                <p className="mb-1">
                  <strong>Account Name:</strong> {bank.account_name}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Account Number:</strong> {bank.account_number}
                </p>
                {bank.swift_code && (
                  <p className="mb-1">
                    <strong>Swift Code:</strong> {bank.swift_code}
                  </p>
                )}
                {bank.routing_number && (
                  <p className="mb-1">
                    <strong>Routing Number:</strong> {bank.routing_number}
                  </p>
                )}
                {bank.iban && (
                  <p className="mb-1">
                    <strong>IBAN:</strong> {bank.iban}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= ADDITIONAL NOTES ================= */}
        {invoice.notes && (
          <div className="mb-4">
            <h5
              style={{
                borderBottom: `2px solid ${brandColor}`,
                paddingBottom: "6px",
              }}
            >
              Notes
            </h5>
            <p className="mt-3">{invoice.notes}</p>
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="text-center mt-5 pt-4 border-top">
          <p className="fw-semibold" style={{ color: brandColor }}>
            Thank you for your business!
          </p>
          <small className="text-muted">
            Invoice ID: {invoice.id}
          </small>
        </div>
      </div>

      {/* ================= ACTION BUTTONS ================= */}
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
          
          /* Ensure images print properly */
          .invoice-container img {
            max-width: 100% !important;
            height: auto !important;
          }

          /* Baseline alignment for columns */
          .row {
            display: flex;
            align-items: baseline;
          }
          
          .col-6 {
            vertical-align: baseline;
          }
          
          /* Flexbox utilities */
          .d-flex {
            display: flex !important;
          }
          
          .justify-content-end {
            justify-content: flex-end !important;
          }
        `}
      </style>
    </>
  );
};

export default InvoiceDetailsView;