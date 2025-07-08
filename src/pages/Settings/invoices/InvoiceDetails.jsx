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
  console.log("Tenant Token in InvoiceDetails:", tenantToken);
  console.log("User in InvoiceDetails:", user);
  const [invoice, setInvoice] = useState(location.state?.invoice);
  const [bank, setBank] = useState("");
  const [space, setSpace] = useState("");
  const [loading, setLoading] = useState(!invoice);
  const tenantSlug = user?.tenant;
  const printRef = useRef();


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
  console.log("Updated user context:", user);
}, [user]);
 

  useEffect(() => {
    if (!invoice) {
      
      const fetchInvoice = async () => {
        try {
          const response = await axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/${tenantSlug}/invoice/show/${id}`,
            {
              headers: { Authorization: `Bearer ${user?.tenantToken}` },
            }
          );
          console.log(response);
          
          if (response.data.invoice || response.data.bank) {
            console.log(response.data.invoice);
            setInvoice(response.data.invoice);
            console.log(response.data.bank);
            setBank(response.data.bank);
            setSpace(response.data.space_info);
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

  // const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US");

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
    {/* Only this div will be converted to PDF */}
    <div ref={printRef}>
      <div className="mb-2">
        <h3 className="text-center">Invoice</h3>
        <div className="d-flex justify-content-between">
          <div>
            <h5 className="mb-1">Billed To:</h5>
            <p className="mb-0">{invoice?.user?.first_name} { invoice?.user?.last_name}</p>
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
            <th>Booked Days</th>
            <th>Description</th>
            <th>Amount (₦)</th>
          </tr>
          
        </thead>
        <tbody>

          {(invoice?.schedule || []).map((item, index) => (
            <tr key={index}>
              <td>{<b>Date: <br/> <br/> <p className="ms-4"> Start time:  {formatDateTime(invoice?.schedule[0].start_time)}   <br/> End time: {formatDateTime(invoice?.schedule[0].end_time)}</p></b>}</td>
              <td>{
                space.space ? (
                                <td>Reserved spot - The <b> {space?.space?.category?.category} </b> Category of <b> {space?.space?.space_name} </b> at <b>{space?.floor?.name}</b> of the <b>{space?.location?.name} </b> location</td>
                ) : (
                                <td>Reserved spot - No spot reserved yet, status is pending </td>
                )}
              </td>
              <td>{Number(invoice?.amount) || 'N/A' }</td>

            </tr>
          ))}
         
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={2}>Total:</th>
            
            <th>₦ {Number(invoice.amount).toLocaleString()}</th>
          </tr>
        </tfoot>
      </table>
      {bank ? (
        <div className="text-center">
              <p className="ms-4"> <b> Bank Name: </b>  {bank?.bank_name}   <br/> <b> Account Name: </b> {bank?.account_name} <br/> <b> Account Number: </b> {bank?.account_number} </p>

      </div>
      ) : ("") }
      
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
      </div>
    </div> {/* End of printable content */}

    {/* ⛔️ Not included in PDF */}
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
