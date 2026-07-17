import React, { useState, useCallback } from "react";
import { Modal, Button, Form, Spinner, Table, Alert } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";

const RefundModal = ({ show, onHide, onSuccess }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const [invoiceRef, setInvoiceRef] = useState("");
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState([]);
  const [error, setError] = useState(null);

  const resetState = useCallback(() => {
    setInvoiceRef("");
    setFetching(false);
    setSubmitting(false);
    setInvoiceData(null);
    setSelectedPaymentIds([]);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onHide();
  }, [resetState, onHide]);

  const handleFetchPayments = useCallback(
    async (e) => {
      e.preventDefault();
      if (!invoiceRef.trim() || !tenantToken || !tenantSlug) return;

      setFetching(true);
      setError(null);
      setInvoiceData(null);
      setSelectedPaymentIds([]);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/single/invoice/payments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tenantToken}`,
            },
            body: JSON.stringify({ invoice_ref: invoiceRef.trim() }),
          }
        );

        const result = await response.json();

        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.message || "Failed to fetch payments for this invoice."
          );
        }

        const paymentList = result?.data?.book_spot?.paymentlisting || [];

        if (paymentList.length === 0) {
          setError("No payments found for this invoice.");
        }

        setInvoiceData(result.data || null);
      } catch (err) {
        console.error("Error fetching invoice payments:", err);
        setError(err.message || "Failed to fetch payments for this invoice.");
      } finally {
        setFetching(false);
      }
    },
    [invoiceRef, tenantToken, tenantSlug]
  );

  const togglePayment = useCallback((paymentId) => {
    setSelectedPaymentIds((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  }, []);

  const handleProcessRefund = useCallback(async () => {
    if (
      !invoiceData ||
      selectedPaymentIds.length === 0 ||
      !tenantToken ||
      !tenantSlug
    )
      return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/invoice/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tenantToken}`,
          },
          body: JSON.stringify({
            invoice_ref: invoiceData.invoice_ref,
            payment_data: selectedPaymentIds.map((id) => ({
              payment_list_id: id,
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to process refund.");
      }

      toast.success(result?.message || "Refund processed successfully!");
      onSuccess?.();
      handleClose();
    } catch (err) {
    //   console.error("Error processing refund:", err);
      setError(err.message || "Failed to process refund.");
      toast.error(err.message || "Failed to process refund.");
    } finally {
      setSubmitting(false);
    }
  }, [
    invoiceData,
    selectedPaymentIds,
    tenantToken,
    tenantSlug,
    onSuccess,
    handleClose,
  ]);

  const paymentList = invoiceData?.book_spot?.paymentlisting || [];

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Refund Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleFetchPayments}>
          <Form.Group className="mb-3" controlId="refundInvoiceRef">
            <Form.Label>Invoice Reference</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="e.g. INV-20260706112812-214"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                disabled={fetching}
              />
              <Button
                type="submit"
                variant="outline-primary"
                disabled={fetching || !invoiceRef.trim()}
              >
                {fetching ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  "Find"
                )}
              </Button>
            </div>
          </Form.Group>
        </Form>

        {invoiceData && paymentList.length > 0 && (
          <>
            <div className="mb-2">
              <strong>Invoice:</strong> {invoiceData.invoice_ref}
              &nbsp;&nbsp;
              <strong>Amount:</strong>{" "}
              {Number(invoiceData.amount || 0).toLocaleString()}
              &nbsp;&nbsp;
              <strong>Status:</strong> {invoiceData.status}
            </div>
            <Table bordered hover size="sm" className="mt-2">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}></th>
                  <th>Payment</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentList.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => togglePayment(payment.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedPaymentIds.includes(payment.id)}
                        onChange={() => togglePayment(payment.id)}
                      />
                    </td>
                    <td>{payment.payment_name}</td>
                    <td>{Number(payment.fee || 0).toLocaleString()}</td>
                    <td>{payment.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        {invoiceData && paymentList.length > 0 && (
          <Button
            variant="danger"
            onClick={handleProcessRefund}
            disabled={submitting || selectedPaymentIds.length === 0}
          >
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Processing...
              </>
            ) : (
              `Refund Selected (${selectedPaymentIds.length})`
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RefundModal;