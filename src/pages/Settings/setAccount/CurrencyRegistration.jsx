import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const CurrencyRegistrationModal = ({ showCurrency, onHide, myCurrency, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;
    const { colour: primary } = useLogoColor();


  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

 

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    tenant_id: "",
    location_id: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (myCurrency) {
      
      setFormData({

    name: myCurrency?.name || "",
  symbol: myCurrency?.symbol || "",
  tenant_id: myCurrency?.tenant_id || "",
  location_id: myCurrency?.location_id || ""
      });
    } else {
      setFormData({
        name: "",
    symbol: "",
    tenant_id: "",
    location_id: ""
        });
    }
  }, [myCurrency]);
  

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
    if (showCurrency && user?.tenantToken) {
      fetchLocations();
    }
  }, [showCurrency, user?.tenantToken]);


  useEffect(() => {
    if (!showCurrency) {
      setFormData({

        name: "",
        symbol: "",
        tenant_id: user?.tenant_id || "",
        location_id: user?.location_id || "",
      });
    }
  }, [showCurrency]);
  

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

      const url = myCurrency
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/saveCurrencykey`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/saveCurrencykey`;

      const method = myCurrency ? "POST" : "POST";

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
          myCurrency
            ? "Currency updated successfully!"
            : "Currency created successfully!"
        );
        if (!myCurrency) {
          // Only reset form if creating new
          setFormData({
            // location_id: "",
            // bank_name: "",
            // account_number: "",
            // account_name: "" 
            key: "",
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
    <Modal show={showCurrency} onHide={onHide} centered>
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {myCurrency ? "Currency" : "Add Your Currency"}
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
                                  <Form.Label>Currency</Form.Label>
                                  <Form.Control
                                      type="text"
                                      name="key"
                                      value={formData.key}
                                      onChange={handleInputChange}
                                  />
                              </Form.Group>
                              <Form.Group className="mb-3" controlId="name">
                                  <Form.Label>Currency Name</Form.Label>
                                  <Form.Control
                                      type="text"
                                      name="name"
                                      value={formData.name}
                                      onChange={handleInputChange}
                                  />
                              </Form.Group>
          
                              <Form.Group className="mb-3" controlId="description">
                                  <Form.Label>Currency Symbol</Form.Label>
                                  <Form.Control
                                      type="text"
                                      name="symbol"
                                      value={formData.symbol}
                                      onChange={handleInputChange}
                                  />
                              </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
                                                                          style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}

          >
            {isLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : myCurrency ? (
              "Update"
            ) : (
              "Create"
            )}{" "}
            Currency          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CurrencyRegistrationModal;