import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext.jsx";

const COLOR_OPTIONS = [
  "#FE0002", "#FF5733", "#3498DB", "#000080", "#27AE60", "#8B8000", "#9B59B6", "#E67E22"
];

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];

const CompanyLogoAndColorRegistration = ({ show, onHide, logoData, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const isMounted = useRef(true);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    colour: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { colour: primary, refetchLogoData } = useLogoColor();

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Clean up object URL
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // Fetch image as File helper
  const fetchImageAsFile = useCallback(async (imageUrl, fileName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const type = blob.type || "image/png";
      return new File([blob], fileName, { type });
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  }, []);

  // Load existing logo data when editing
  useEffect(() => {
    const loadLogoData = async () => {
      if (show && logoData && logoData.logo) {
        setFormData({
          colour: logoData.colour || "",
        });
        
        const imageUrl = `${import.meta.env.VITE_BACKEND_URL}/storage/uploads/tenant_logo/${logoData.logo}`;
        const file = await fetchImageAsFile(imageUrl, logoData.logo);
        if (file && isMounted.current) {
          setLogoFile(file);
          setLogoPreview(imageUrl);
        }
      } else if (!show) {
        // Reset form when modal closes
        setFormData({ colour: "" });
        setLogoFile(null);
        if (logoPreview && logoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(logoPreview);
        }
        setLogoPreview("");
        setValidationErrors({});
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    loadLogoData();
  }, [show, logoData, fetchImageAsFile]);

  const handleColorSelect = useCallback((color) => {
    setFormData((prev) => ({
      ...prev,
      colour: color,
    }));
    // Clear validation error for color
    setValidationErrors(prev => ({ ...prev, colour: null }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [name]: null }));
  }, []);

  const handleLogoChange = useCallback((e) => {
    const file = e.target.files[0];
    
    // Clear previous preview if it was a blob
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    
    if (!file) {
      setLogoFile(null);
      setLogoPreview("");
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please select a PNG, JPG, JPEG, or SVG file.");
      setLogoFile(null);
      setLogoPreview("");
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_LOGO_SIZE) {
      toast.error(`Logo file size must not exceed ${MAX_LOGO_SIZE / (1024 * 1024)}MB.`);
      setLogoFile(null);
      setLogoPreview("");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setValidationErrors(prev => ({ ...prev, logo: null }));
  }, [logoPreview]);

  const validateForm = useCallback(() => {
    const errors = {};

    // Validate logo
    if (!logoFile && !logoData) {
      errors.logo = "Logo is required";
    }

    // Validate color
    if (!formData.colour) {
      errors.colour = "Color is required";
    } else if (!/^#[0-9A-F]{6}$/i.test(formData.colour)) {
      errors.colour = "Please enter a valid hex color code (e.g., #FF5733)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [logoFile, logoData, formData.colour]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }
    
    setIsLoading(true);

    try {
      if (!tenantToken) throw new Error("Authorization token is missing.");

      const url = logoData
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/update-details`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/add-details`;

      const submitData = new FormData();
      
      // Only append logo if a new file is selected
      if (logoFile) {
        submitData.append("logo", logoFile);
      }
      
      submitData.append("colour", formData.colour);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tenantToken}`,
        },
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          logoData
            ? "Branding updated successfully!"
            : "Branding added successfully!"
        );
        
        // Refresh the logo data in context
        await refetchLogoData();
        
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
  }, [tenantToken, tenantSlug, logoData, logoFile, formData.colour, onSubmit, onHide, refetchLogoData, validateForm]);

  const isFormValid = (logoFile || logoData) && formData.colour && /^#[0-9A-F]{6}$/i.test(formData.colour);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {logoData ? "Edit Branding" : "Add Branding"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="logo">
            <Form.Label>
              Company Logo <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              ref={fileInputRef}
              type="file"
              name="logo"
              accept=".png,.jpg,.jpeg,.svg"
              onChange={handleLogoChange}
              isInvalid={!!validationErrors.logo}
              disabled={isLoading}
            />
            <Form.Text className="text-muted">
              Allowed: PNG, JPG, JPEG, SVG. Max size: 2MB
            </Form.Text>
            {validationErrors.logo && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.logo}
              </Form.Control.Feedback>
            )}
            
            {/* Logo Preview */}
            {logoPreview && (
              <div className="mt-3">
                <p className="mb-1">Preview:</p>
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "100px",
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "4px",
                    background: "#fff"
                  }}
                />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="colour">
            <Form.Label>
              Brand Color <span style={{ color: "red" }}>*</span>
            </Form.Label>
            
            {/* Color Picker Options */}
            <div className="mb-3">
              <p className="mb-2">Quick select:</p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {COLOR_OPTIONS.map((color) => (
                  <div
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    role="button"
                    tabIndex={0}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: color,
                      border: formData.colour === color
                        ? "3px solid #000"
                        : "2px solid #ccc",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.5 : 1,
                      transition: "transform 0.2s",
                      transform: formData.colour === color ? "scale(1.1)" : "scale(1)",
                    }}
                    title={color}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleColorSelect(color);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <Form.Label className="mb-1">Or enter manually:</Form.Label>
            <Form.Control
              type="text"
              name="colour"
              value={formData.colour}
              onChange={handleInputChange}
              placeholder="#FF5733"
              isInvalid={!!validationErrors.colour}
              disabled={isLoading}
              maxLength="7"
            />
            {validationErrors.colour ? (
              <Form.Control.Feedback type="invalid">
                {validationErrors.colour}
              </Form.Control.Feedback>
            ) : (
              <Form.Text className="text-muted">
                Enter a hex color code (e.g., #FF5733)
              </Form.Text>
            )}
          </Form.Group>

          <Button
            type="submit"
            className="w-100"
            disabled={!isFormValid || isLoading}
            style={{ background: primary, borderColor: primary, color: "#fff" }}
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
                {logoData ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{logoData ? "Update" : "Add"} Branding</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CompanyLogoAndColorRegistration;