import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext";

const RoomRegistrationModal = ({ show, onHide, room, locations = [], onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const [floorData, setFloorData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loadingFloor, setLoadingFloor] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    space_number: "",
    floor_id: "",
    location_id: "",
    space_fee: "",
    space_category_id: "",
    space_discount: "",
    min_space_discount_time: "",
  });

  const [isLoading, setIsLoading] = useState(false);

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
        space_discount: room.space_discount || "",
        min_space_discount_time: room.min_space_discount_time || "",
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
        space_discount: "",
        min_space_discount_time: "",
      });
      setSelectedLocation("");
    }
  }, [room]);

  const fetchFloors = useCallback(async (locationId) => {
    if (!tenantToken || !tenantSlug || !locationId) return;
    
    setLoadingFloor(true);
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
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoadingFloor(false);
      }
    }
  }, [tenantToken, tenantSlug]);

  const fetchCategories = useCallback(async () => {
    if (!tenantToken || !tenantSlug) return;
    
    setLoadingCategory(true);
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
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoadingCategory(false);
      }
    }
  }, [tenantToken, tenantSlug]);

  // Fetch categories when modal opens
  useEffect(() => {
    if (show && tenantToken && tenantSlug) {
      fetchCategories();
    }
  }, [show, tenantToken, tenantSlug, fetchCategories]);

  // Fetch floors when location changes
  useEffect(() => {
    if (selectedLocation) {
      fetchFloors(selectedLocation);
      // Reset floor selection when location changes
      setFormData(prev => ({ ...prev, floor_id: "", space_category_id: "" }));
    }
  }, [selectedLocation, fetchFloors]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleLocationChange = useCallback((e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setFormData((prev) => ({
      ...prev,
      location_id: locationId,
      floor_id: "",
      space_category_id: "",
    }));
  }, []);

  const handleFloorChange = useCallback((e) => {
    const floorId = e.target.value;
    setFormData((prev) => ({
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
      toast.error("Number of spots must be at least 1");
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
    
    setIsLoading(true);

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
        toast.success(room ? "Room updated successfully!" : "Room created successfully!");
        
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
        toast.error(result?.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "An error occurred.");
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [tenantToken, tenantSlug, room, formData, onSubmit, onHide, validateForm]);

  const totalFee = (formData.space_fee || 0) * (formData.space_number || 0);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {room ? "Edit Room/Space" : "Add a New Room/Space"}
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
              placeholder="e.g., Lavendier Room, Conference Hall"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="space_number">
            <Form.Label>Number of Spots in this Room/Space *</Form.Label>
            <Form.Control
              type="number"
              name="space_number"
              value={formData.space_number}
              onChange={handleInputChange}
              placeholder="e.g., 3"
              min="1"
              step="1"
              required
              disabled={isLoading || room} // Disable when editing
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="space_fee">
            <Form.Label>Fee per Spot (₦) *</Form.Label>
            <Form.Control
              type="number"
              name="space_fee"
              value={formData.space_fee}
              onChange={handleInputChange}
              placeholder="e.g., 30000"
              min="0"
              step="100"
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="total_fee">
            <Form.Label>Total Fee (₦)</Form.Label>
            <Form.Control
              type="number"
              value={totalFee}
              placeholder="Calculated total"
              disabled
              readOnly
            />
            <Form.Text className="text-muted">
              Total = Fee per spot × Number of spots
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="space_discount">
            <Form.Label>Space Discount (%) (optional)</Form.Label>
            <Form.Control
              type="number"
              name="space_discount"
              value={formData.space_discount}
              onChange={handleInputChange}
              placeholder="e.g., 10"
              min="0"
              max="100"
              step="1"
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="min_space_discount_time">
            <Form.Label>Minimum Time for Space Discount (optional)</Form.Label>
            <Form.Control
              type="number"
              name="min_space_discount_time"
              value={formData.min_space_discount_time}
              onChange={handleInputChange}
              placeholder="e.g., 1"
              min="1"
              step="1"
              disabled={isLoading}
            />
            <Form.Text className="text-muted">
              Minimum hours/days to qualify for discount
            </Form.Text>
          </Form.Group>

          {/* Location Selection */}
          <Form.Group className="mb-3" controlId="location_id">
            <Form.Label>Location *</Form.Label>
            <Form.Select
              name="location_id"
              value={formData.location_id}
              onChange={handleLocationChange}
              required
              disabled={isLoading || room} // Disable when editing
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} - {location.state}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Floor Selection */}
          {selectedLocation && (
            <Form.Group className="mb-3" controlId="floor_id">
              <Form.Label>Floor/Section *</Form.Label>
              {loadingFloor ? (
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
                  disabled={isLoading}
                >
                  <option value="">Select a Floor/Section</option>
                  {floorData.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          )}

          {/* Category Selection */}
          {formData.floor_id && (
            <Form.Group className="mb-3" controlId="space_category_id">
              <Form.Label>Category *</Form.Label>
              {loadingCategory ? (
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
                  disabled={isLoading}
                >
                  <option value="">Select a Category</option>
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
            style={{
              backgroundColor: primary,
              borderColor: primary,
              color: "#fff",
            }}
            type="submit"
            className="w-100"
            disabled={isLoading || loadingFloor || loadingCategory}
          >
            {isLoading ? (
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

export default RoomRegistrationModal;