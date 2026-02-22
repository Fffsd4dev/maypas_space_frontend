import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";

const SpotRegistrationModal = ({ show, onHide, room, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const isMounted = useRef(true);

  const [locations, setLocations] = useState([]);
  const [floorData, setFloorData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState({
    locations: true,
    floors: false,
    categories: false,
    submit: false
  });
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    space_number: "",
    floor_id: "",
    location_id: "",
    space_fee: "",
    space_category_id: "",
  });

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when room changes
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.space_name || "",
        space_number: room.space_number || "",
        floor_id: room.floor_id || "",
        location_id: room.location_id || "",
        space_fee: room.space_fee || "",
        space_category_id: room.space_category_id || "",
      });
      setSelectedLocation(room.location_id || "");
    } else {
      setFormData({
        name: "",
        space_number: "",
        floor_id: "",
        location_id: "",
        space_fee: "",
        space_category_id: "",
      });
      setSelectedLocation("");
    }
  }, [room]);

  const fetchLocations = useCallback(async () => {
    if (!tenantToken || !tenantSlug) return;
    
    setLoading(prev => ({ ...prev, locations: true }));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations?per_page=100`,
        {
          headers: { Authorization: `Bearer ${tenantToken}` },
        }
      );
      const result = await response.json();
      
      if (isMounted.current && response.ok) {
        setLocations(result.data?.data || []);
      } else if (isMounted.current) {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, locations: false }));
      }
    }
  }, [tenantToken, tenantSlug]);

  const fetchFloors = useCallback(async (locationId) => {
    if (!tenantToken || !tenantSlug || !locationId) return;
    
    setLoading(prev => ({ ...prev, floors: true }));
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/floor/list-floors/${locationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (isMounted.current && result?.data?.data) {
        setFloorData(result.data.data);
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, floors: false }));
      }
    }
  }, [tenantToken, tenantSlug]);

  const fetchCategories = useCallback(async () => {
    if (!tenantToken || !tenantSlug) return;
    
    setLoading(prev => ({ ...prev, categories: true }));
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/list-categories`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (isMounted.current && Array.isArray(result.data)) {
        setCategoryData(result.data);
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    }
  }, [tenantToken, tenantSlug]);

  // Fetch initial data when modal opens
  useEffect(() => {
    if (show && tenantToken && tenantSlug) {
      fetchLocations();
      fetchCategories();
    }
  }, [show, tenantToken, tenantSlug, fetchLocations, fetchCategories]);

  // Fetch floors when location changes
  useEffect(() => {
    if (selectedLocation) {
      fetchFloors(selectedLocation);
      // Reset floor selection
      setFormData(prev => ({ ...prev, floor_id: "", space_category_id: "" }));
    }
  }, [selectedLocation, fetchFloors]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleLocationChange = useCallback((e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setFormData(prev => ({
      ...prev,
      location_id: locationId,
      floor_id: "",
      space_category_id: "",
    }));
  }, []);

  const handleFloorChange = useCallback((e) => {
    const floorId = e.target.value;
    setFormData(prev => ({
      ...prev,
      floor_id: floorId,
      space_category_id: "",
    }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error("Room name is required");
      return false;
    }
    if (!formData.space_number || formData.space_number < 1) {
      toast.error("Number of spaces must be at least 1");
      return false;
    }
    if (!formData.location_id) {
      toast.error("Please select a location");
      return false;
    }
    if (!formData.floor_id) {
      toast.error("Please select a floor");
      return false;
    }
    if (!formData.space_category_id) {
      toast.error("Please select a category");
      return false;
    }
    if (!formData.space_fee || formData.space_fee < 0) {
      toast.error("Please enter a valid fee");
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(prev => ({ ...prev, submit: true }));
    
    try {
      if (!tenantToken) throw new Error("Authorization token is missing.");

      const url = room
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/update/${room.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/space/create`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantToken}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          room
            ? "Room updated successfully!"
            : "Room created successfully!"
        );
        
        // Reset form
        setFormData({
          name: "",
          space_number: "",
          floor_id: "",
          location_id: "",
          space_fee: "",
          space_category_id: "",
        });
        setSelectedLocation("");
        
        // Call onSubmit to refresh the list
        if (onSubmit) {
          await onSubmit();
        }
        
        // Close modal after success
        setTimeout(() => {
          if (isMounted.current) {
            onHide();
          }
        }, 1500);
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
      console.error("Submission error:", error);
      toast.error("An error occurred. Contact Admin");
    } finally {
      if (isMounted.current) {
        setLoading(prev => ({ ...prev, submit: false }));
      }
    }
  }, [tenantToken, tenantSlug, room, formData, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {room ? "Edit Room/Space" : "Add New Room/Space"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Room/Space Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Conference Room A"
              required
              disabled={loading.submit}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="space_number">
            <Form.Label>Number of Spaces/Spots *</Form.Label>
            <Form.Control
              type="number"
              name="space_number"
              value={formData.space_number}
              onChange={handleInputChange}
              placeholder="e.g., 10"
              min="1"
              step="1"
              required
              disabled={loading.submit}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="space_fee">
            <Form.Label>Fee per Space *</Form.Label>
            <Form.Control
              type="number"
              name="space_fee"
              value={formData.space_fee}
              onChange={handleInputChange}
              placeholder="e.g., 5000"
              min="0"
              step="100"
              required
              disabled={loading.submit}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="location_id">
            <Form.Label>Location *</Form.Label>
            {loading.locations ? (
              <div className="text-center py-2">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading locations...</span>
              </div>
            ) : (
              <Form.Select
                name="location_id"
                value={formData.location_id}
                onChange={handleLocationChange}
                required
                disabled={loading.submit}
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.state}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          {selectedLocation && (
            <Form.Group className="mb-3" controlId="floor_id">
              <Form.Label>Floor/Section *</Form.Label>
              {loading.floors ? (
                <div className="text-center py-2">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Loading floors...</span>
                </div>
              ) : (
                <Form.Select
                  name="floor_id"
                  value={formData.floor_id}
                  onChange={handleFloorChange}
                  required
                  disabled={loading.submit}
                >
                  <option value="">Select a floor/section</option>
                  {floorData.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          )}

          {formData.floor_id && (
            <Form.Group className="mb-3" controlId="space_category_id">
              <Form.Label>Category *</Form.Label>
              {loading.categories ? (
                <div className="text-center py-2">
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Loading categories...</span>
                </div>
              ) : (
                <Form.Select
                  name="space_category_id"
                  value={formData.space_category_id}
                  onChange={handleInputChange}
                  required
                  disabled={loading.submit}
                >
                  <option value="">Select a category</option>
                  {categoryData.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          )}

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={
              loading.submit || 
              loading.locations || 
              loading.floors || 
              loading.categories
            }
            style={{
              backgroundColor: primary,
              borderColor: primary,
              color: "#fff",
            }}
          >
            {loading.submit ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {room ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{room ? "Update" : "Create"} Room</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SpotRegistrationModal;