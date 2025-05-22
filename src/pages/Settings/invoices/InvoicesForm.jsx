import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InvoicesModal = ({ show, onHide, myBankAccount, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

 

  const [formData, setFormData] = useState({
    location_id: "",
    bank_name: "",
    account_number: "",
    account_name: "" 
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (myBankAccount) {
      
      setFormData({

        location_id: myBankAccount.location_id || "",
        bank_name: myBankAccount.bank_name||"",
        account_number: myBankAccount.account_number || "",
        account_name: myBankAccount.account_name || "", 
      });
    } else {
      setFormData({
        location_id: "",
        bank_name: "",
        account_number: "",
        account_name: ""
        });
    }
  }, [myBankAccount]);
  

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        setLocations(result.data.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    if (show && user?.tenantToken) {
      fetchLocations();
    }
  }, [show, user?.tenantToken]);


  useEffect(() => {
    if (!show) {
      setFormData({
        location_id: "",
        bank_name: "",
        account_number: "",
        account_name: ""  
      });
    }
  }, [show]);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHoursChange = (index, field, value) => {
    const updatedHours = [...formData.hours];
    updatedHours[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      hours: updatedHours,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.tenantToken) throw new Error("Authorization token is missing.");

      const url = myBankAccount
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/bank/update/${myBankAccount.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/bank/create`;

      const method = myBankAccount ? "POST" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.tenantToken}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          myBankAccount
            ? "Bank Details updated successfully!"
            : "Bank Details added successfully!"
        );
        if (!myBankAccount) {
          // Only reset form if creating new
          setFormData({
            location_id: "",
            bank_name: "",
            account_number: "",
            account_name: "" 
          });
        }
        
        setTimeout(() => {
          onSubmit();
          onHide();
        }, 1000);
      } else {
        let errorMsg = "An error occurred.";
        if (result?.errors) {
          errorMsg = Object.values(result.errors).flat().join("\n");
        } else if (result?.message) {
          errorMsg = result.message;
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("An error occurred. Contact Admin");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {myBankAccount ? "Bank Details" : "Add Your Bank Details"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="location_id">
            <Form.Label>Location</Form.Label>
            <Form.Select
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a location</option>
              {Array.isArray(locations) &&
                locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} at {location.state} state
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="name">
                                  <Form.Label>Bank Name</Form.Label>
                                  <Form.Control
                                      type="text"
                                      name="bank_name"
                                      value={formData.bank_name}
                                      onChange={handleInputChange}
                                  />
                              </Form.Group>
                              <Form.Group className="mb-3" controlId="name">
                                  <Form.Label>Account Number</Form.Label>
                                  <Form.Control
                                      type="text"
                                      name="account_number"
                                      value={formData.account_number}
                                      onChange={handleInputChange}
                                  />
                              </Form.Group>
          
                              <Form.Group className="mb-3" controlId="description">
                                  <Form.Label>Account Name</Form.Label>
                                  <Form.Control
                                      type="text"
                                      name="account_name"
                                      value={formData.account_name}
                                      onChange={handleInputChange}
                                  />
                              </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : myBankAccount ? (
              "Update"
            ) : (
              "Add"
            )}{" "}
            Bank Details
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default InvoicesModal;