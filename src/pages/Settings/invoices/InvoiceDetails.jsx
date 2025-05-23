import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import axios from "axios";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";

const InvoiceDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [invoice, setInvoice] = useState(location.state?.invoice);
  const [loading, setLoading] = useState(!invoice);
  const tenantSlug = user?.tenant;

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
          if (response.data.invoice) {
            setInvoice(response.data.invoice);
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

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-US");

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
          <div className="mb-4">
            <h3 className="text-center">Invoice</h3>
            <div className="d-flex justify-content-between">
              <div>
                <h5 className="mb-1">Billed To:</h5>
                <p className="mb-0">{invoice.name || invoice.user_name}</p>
                <p className="mb-0">{invoice.email}</p>
                <p>{invoice.phone_number}</p>
              </div>
              <div className="text-end">
                <h6 className="mb-1">Invoice Ref:</h6>
                <p>{invoice.invoice_ref}</p>
                <h6 className="mb-1">Date Issued:</h6>
                <p>{formatDate(invoice.created_at)}</p>
              </div>
            </div>
          </div>

          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Description</th>
                <th>Amount (₦)</th>
              </tr>
            </thead>
            <tbody>
              {(invoice?.space_payment || []).map((item, index) => (
                <tr key={index}>
                  <td>{item.description || "Workspace Payment"}</td>
                  <td>{Number(item.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th>{Number(invoice.total).toLocaleString()}</th>
              </tr>
            </tfoot>
          </table>

          <div className="mt-4">
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`badge ${
                  invoice.status === "closed" ? "bg-success" : "bg-warning text-dark"
                }`}
              >
                {invoice.status.toUpperCase()}
              </span>
            </p>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default InvoiceDetails;
