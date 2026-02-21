import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const CategoryRegistrationModal = ({ show, onHide, category, locations = [], onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    category: "",
    location_id: "",
    booking_type: "",
    min_duration: "",
  });

  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Cleanup object URLs to prevent memory leaks
      images.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, [images]);

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        category: category.category || "",
        location_id: category.location_id || "",
        booking_type: category.booking_type || "",
        min_duration: category.min_duration || "",
      });
      // Clear images when editing existing category
      setImages([]);
    } else {
      setFormData({
        category: "",
        location_id: "",
        booking_type: "",
        min_duration: "",
      });
      setImages([]);
    }
    setImageError("");
  }, [category, show]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    const files = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} is larger than 2MB`);
      } else {
        // Create preview URL
        const preview = URL.createObjectURL(file);
        validFiles.push({ file, preview });
      }
    });

    if (errors.length > 0) {
      setImageError(errors.join(", "));
    }

    if (validFiles.length > 0) {
      setImages(prev => {
        // Clean up old previews
        prev.forEach(img => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
        return validFiles;
      });
      setImageError("");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const removeImage = useCallback((index) => {
    setImages(prev => {
      // Clean up the removed image's preview URL
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      const newImages = prev.filter((_, i) => i !== index);
      return newImages;
    });
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.category.trim()) {
      toast.error("Category name is required");
      return false;
    }
    if (!formData.location_id) {
      toast.error("Please select a location");
      return false;
    }
    if (!formData.booking_type) {
      toast.error("Please select a booking type");
      return false;
    }
    if (!formData.min_duration || formData.min_duration < 1) {
      toast.error("Minimum duration must be at least 1");
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

      const url = category
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/update/${category.id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/create`;

      const formDataToSend = new FormData();
      
      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      // Append images
      images.forEach((img, idx) => {
        formDataToSend.append("category_image[]", img.file);
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tenantToken}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          category
            ? "Category updated successfully!"
            : "Category created successfully!"
        );
        
        // Clean up image previews
        images.forEach(img => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
        
        // Reset form
        setFormData({
          category: "",
          location_id: "",
          booking_type: "",
          min_duration: "",
        });
        setImages([]);
        
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
        setIsLoading(false);
      }
    }
  }, [tenantToken, tenantSlug, category, formData, images, onSubmit, onHide, validateForm]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {category ? "Edit Category" : "Add a New Category"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          {/* Image Upload Section */}
          <Form.Group className="mb-3" controlId="category_images">
            <Form.Label>Category Images (Max 3 images, 2MB each)</Form.Label>
            <Form.Control
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              disabled={images.length >= 3 || isLoading}
              onChange={handleImageChange}
            />
            {imageError && (
              <Form.Text className="text-danger">{imageError}</Form.Text>
            )}
            <Form.Text className="text-muted">
              You can upload up to 3 images. Each image must be less than 2MB.
            </Form.Text>
          </Form.Group>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="mb-3">
              <Form.Label>Image Preview:</Form.Label>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <img
                      src={img.preview}
                      alt={`preview-${idx}`}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #ddd"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                      disabled={isLoading}
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Name */}
          <Form.Group className="mb-3" controlId="category">
            <Form.Label>Category Name *</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g., Podcast Studio, Meeting Room"
              required
              disabled={isLoading}
            />
          </Form.Group>

          {/* Location Selection */}
          <Form.Group className="mb-3" controlId="location_id">
            <Form.Label>Location *</Form.Label>
            <Form.Select
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">Select a location</option>
              {locations.length > 0 ? (
                locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.state}
                  </option>
                ))
              ) : (
                <option value="" disabled>No locations available</option>
              )}
            </Form.Select>
          </Form.Group>

          {/* Booking Type */}
          <Form.Group className="mb-3" controlId="booking_type">
            <Form.Label>Booking Type *</Form.Label>
            <Form.Select
              name="booking_type"
              value={formData.booking_type}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">Select booking type</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Form.Select>
          </Form.Group>

          {/* Minimum Duration */}
          <Form.Group className="mb-3" controlId="min_duration">
            <Form.Label>Minimum Duration *</Form.Label>
            <Form.Control
              type="number"
              name="min_duration"
              value={formData.min_duration}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              step="1"
              required
              disabled={isLoading}
            />
            <Form.Text className="text-muted">
              Minimum number of {formData.booking_type || 'units'} for booking
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
            style={{
              backgroundColor: primary,
              borderColor: primary,
              color: "#fff",
            }}
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
                {category ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{category ? "Update" : "Create"} Category</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CategoryRegistrationModal;