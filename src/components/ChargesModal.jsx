import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Popup from "./Popup/Popup";

const ChargesModal = ({ show, onHide, spaceId, tenantSlug, tenantToken, onSaved }) => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formCharges, setFormCharges] = useState([
    { name: "", is_fixed: 0, value: "" },
  ]);

  // Fetch charges when modal opens
  useEffect(() => {
    if (show && spaceId) {
      fetchCharges();
    }
  }, [show, spaceId]);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/charges/show/${spaceId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: tenantToken ? `Bearer ${tenantToken}` : undefined,
          },
        }
      );
      const data = await res.json();
      setCharges(data.data || [] );
    } catch (err) {
      console.error("Failed to fetch charges:", err);
      toast.error("Failed to fetch charges");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (index, field, value) => {
    const updated = [...formCharges];
    updated[index][field] = value;
    setFormCharges(updated);
  };

  const addChargeField = () => {
    if (formCharges.length < 3) {
      setFormCharges([...formCharges, { name: "", is_fixed: 0, value: "" }]);
    }
  };

  const removeChargeField = (index) => {
    setFormCharges(formCharges.filter((_, i) => i !== index));
  };

 const handleSubmit = async () => {
  try {
    const formData = new FormData();

    formCharges.forEach((c) => {
      formData.append("name[]", c.name);
      formData.append("is_fixed[]", c.is_fixed ? 1 : 0);
      formData.append("value[]", c.value);
    });

    formData.append("space_id", spaceId);

    console.log("Submitting payload:", [...formData.entries()]);

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/charges/create`,
      {
        method: "POST",
        headers: {
          Authorization: tenantToken ? `Bearer ${tenantToken}` : undefined,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("Save failed:", err);
      throw new Error("Failed to save charges");
    }

    toast.success(res?.message || "Charges saved successfully");
    onSaved && onSaved();
    onHide && onHide();
    await fetchCharges();
    setFormCharges([{ name: "", is_fixed: 0, value: "" }]); // reset form
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to save charges");
    
  }
};



  const handleDelete = async (chargeId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/charges/delete/${chargeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: tenantToken ? `Bearer ${tenantToken}` : undefined,
        },
      });
      if (!res.ok) throw new Error("Failed to delete charge");
      fetchCharges();
    } catch (err) {
      console.error(err);
    }
  };

  const [deletePopup, setDeletePopup] = useState({
      isVisible: false,
      chargeId: null,
    });

  const handleDeleteButton = (chargeId) => {
    setDeletePopup({
      isVisible: true,
      chargeId,
    });
  };

  const confirmDelete = () => {
    const { chargeId } = deletePopup;
    handleDelete(chargeId);
    setDeletePopup({ isVisible: false, chargeId: null });
  };


  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Manage Charges</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Existing Charges */}
        <h5>Existing Charges</h5>
        {loading ? (
          <p>Loading...</p>
        ) : charges.length > 0 ? (
          <Table bordered hover>
            <thead>
        
                  <tr>
                <th>Name</th>
                <th>Charge Type</th>
                <th>Amount</th>
                {/* <th>Space</th> */}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
                 {charges.map((charge) => (
                <tr key={charge.id}>
                  <td>{charge.name}</td>
                  <td>{charge.is_fixed ? "Fixed Amount" : "Percentage"}</td>
                  <td>{charge.value}{charge.is_fixed ? "" : "%"}</td>
                  {/* <td>{charge.space?.space_name}</td> */}
                  <td>
                    <Link
                                to="#"
                                className="action-icon"
                                // onClick={() => handleEditClick(row.original)}
                              >
                                <i className="mdi mdi-square-edit-outline"></i>
                              </Link>
                    <Link
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteButton(charge.id)}
                    >
                      <i className="mdi mdi-delete"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No charges found.</p>
        )}

        {/* Add / Update Charges */}
        <h5 className="mt-4">Add Charges</h5>
        {formCharges.map((charge, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <Form.Group className="mb-2">
              <Form.Label>Charge Name</Form.Label>
              <Form.Control
                type="text"
                value={charge.name}
                onChange={(e) =>
                  handleFormChange(index, "name", e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Charge Type</Form.Label>
              <Form.Select
                value={charge.is_fixed}
                onChange={(e) =>
                  handleFormChange(index, "is_fixed", e.target.value)
                }
              >
                <option value={0}>Percentage</option>
                <option value={1}>Fixed Amount</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>{charge.is_fixed ? "Amount" : "Percentage"}</Form.Label>
              <Form.Control
                type="number"
                value={charge.value}
                onChange={(e) =>
                  handleFormChange(index, "value", e.target.value)
                }
              />
            </Form.Group>
            {formCharges.length > 1 && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => removeChargeField(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        {formCharges.length < 3 && (
          <Button variant="secondary" size="sm" onClick={addChargeField}>
            Add Another Charge
          </Button>
        )}
        {deletePopup.isVisible && (
                <Popup
                  message="Are you sure you want to delete this charge?"
                  type="confirm"
                  onClose={() => setDeletePopup({ isVisible: false, chargeId: null })}
                  buttonLabel="Yes"
                  onAction={confirmDelete}
                />
              )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Charges
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChargesModal;
