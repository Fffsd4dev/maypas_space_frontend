import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const TaxesRegistrationModal = ({ showTaxes, onHide, myTaxes, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;
    const { colour: primary } = useLogoColor();


//   const [locations, setLocations] = useState([]);
//   const [loadingLocations, setLoadingLocations] = useState(true);
//   const [selectedLocation, setSelectedLocation] = useState(null);

 

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    percentage: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (myTaxes) {
      
      setFormData({

        name: myTaxes.name || "",
        description: myTaxes.description || "",
        percentage: myTaxes.percentage || "",
      });
    } else {
      setFormData({
        // location_id: "",
        // bank_name: "",
        // account_number: "",
        // account_name: ""
        key: "",
        });
    }
  }, [myTaxes]);
  

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
        // setLocations(result.data.data || []);
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
    if (showTaxes && user?.tenantToken) {
      fetchLocations();
    }
  }, [showTaxes, user?.tenantToken]);


  useEffect(() => {
    if (!showTaxes) {
      setFormData({

        name: "",
        symbol: "",
        tenant_id: user?.tenant_id || "",
        location_id: user?.location_id || "",
      });
    }
  }, [showTaxes]);
  

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

      const url = myTaxes
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/taxes/update/${myTaxes.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/taxes/create`;

      const method = myTaxes ? "POST" : "POST";

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
          myTaxes
            ? "Taxes updated successfully!"
            : "Taxes created successfully!"
        );
        if (!myTaxes) {
          // Only reset form if creating new
          setFormData({
            name: "",
            description: "",
            percentage: "",
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
    <Modal show={showTaxes} onHide={onHide} centered>
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {myTaxes ? "Taxes" : "Add Your Taxes"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
       

          <Form.Group className="mb-3" controlId="name">
                                  <Form.Label>Name of Tax</Form.Label>
                                  <Form.Control
                                      type="text"
                                      name="name"
                                      value={formData.name}
                                      onChange={handleInputChange}
                                      placeholder="eg. VAT"
                                  />
                              </Form.Group>
                              <Form.Group className="mb-3" controlId="name">
                                  <Form.Label>Tax Description</Form.Label>
                                  <Form.Control
                                      type="text"
                                      name="description"
                                      value={formData.description}
                                      onChange={handleInputChange}
                                      placeholder="eg. Value Added Tax"
                                  />
                              </Form.Group>
          
                              <Form.Group className="mb-3" controlId="description">
                                  <Form.Label>Whats the Percentage Charged</Form.Label>
                                  <Form.Control
                                      type="number"
                                      name="percentage"
                                      value={formData.percentage}
                                      onChange={handleInputChange}
                                      placeholder="eg. 15"
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
            ) : myTaxes ? (
              "Update"
            ) : (
              "Create"
            )}{" "}
            Tax          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TaxesRegistrationModal;