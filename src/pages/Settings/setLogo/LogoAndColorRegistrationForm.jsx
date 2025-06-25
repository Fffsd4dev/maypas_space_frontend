import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const COLOR_OPTIONS = [
  "#FF5733", // Red-Orange
  "#3498DB", // Blue
  "#27AE60", // Green
  "#F1C40F", // Yellow
];

const MAX_LOGO_SIZE = 2048 * 1024; // 2048 KB in bytes


const CompanyLogoAndColorRegistration = ({ show, onHide, myLogo, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;

  const [formData, setFormData] = useState({
    logo: "",
    colour: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  // Helper to fetch image as File
  const fetchImageAsFile = async (imageUrl, fileName) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    // Guess the type from the blob or fallback to png
    const type = blob.type || "image/png";
    return new File([blob], fileName, { type });
  };
 
  useEffect(() => {
    if (show && myLogo && myLogo.logo) {
      // If editing, fetch the logo as a file
      const imageUrl = `${import.meta.env.VITE_BACKEND_URL}/storage/uploads/tenant_logo/${myLogo.logo}`;
      fetchImageAsFile(imageUrl, myLogo.logo).then((file) => {
        setLogoFile(file);
        setLogoPreview(imageUrl);
      });
    } else if (!show) {
      setLogoFile(null);
      setLogoPreview("");
    }
  }, [show, myLogo]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (myLogo) {
      setFormData({
        logo: myLogo.logo || "",
        colour: myLogo.colour || "",
      });
      setLogoFile(null);
    } else {
      setFormData({
        logo: "",
        colour: "",
      });
      setLogoFile(null);
    }
  }, [myLogo]);

  useEffect(() => {
    if (!show) {
      setFormData({
        logo: "",
        colour: "",
      });
      setLogoFile(null);
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      ["image/png", "image/jpeg", "image/jpg"].includes(file.type)
    ) {
      if (file.size > 2048 * 1024) {
        toast.error("Logo file size must not exceed 2048 KB (2 MB).");
        setLogoFile(null);
        setLogoPreview("");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please select a PNG, JPG, or JPEG file.");
      setLogoFile(null);
      setLogoPreview("");
    }
  };
  
    const isFormValid =
    (logoFile || (myLogo && formData.logo)) &&
    formData.colour &&
    /^#[0-9A-Fa-f]{6}$/.test(formData.colour);

    
  const handleColorSelect = (color) => {
    setFormData((prev) => ({
      ...prev,
      colour: color,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.tenantToken) throw new Error("Authorization token is missing.");

      const url = myLogo
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/update-details`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/add-details`;

      const method = myLogo ? "POST" : "POST";

      // Use FormData for file upload
      const submitData = new FormData();
      if (logoFile) {
        submitData.append("logo", logoFile);
      }
      submitData.append("colour", formData.colour);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${user?.tenantToken}`,
        },
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          myLogo
            ? "Company's Logo and Color updated successfully!"
            : "Company's Logo and Color added successfully!"
        );
        if (!myLogo) {
          setFormData({
            logo: "",
            colour: "",
          });
          setLogoFile(null);
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
          {myLogo ? "Company's Logo and Color" : "Add Your Company's Logo and Color"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="logo">
            <Form.Label>Logo (PNG, JPG, JPEG) <span style={{color: "red"}}>*</span></Form.Label>
            <Form.Control
              type="file"
              name="logo"
              accept=".png,.jpg,.jpeg"
              onChange={handleLogoChange}
              required={!myLogo}
            />
            {formData.logo && (
              <div style={{ marginTop: 8 }}>
                <small>Selected: {formData.logo}</small>
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="colour">
            <Form.Label>
              Select Color <span style={{color: "red"}}>*</span>
            </Form.Label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
              {COLOR_OPTIONS.map((color) => (
                <div
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: color,
                    border:
                      formData.colour === color
                        ? "3px solid #333"
                        : "2px solid #ccc",
                    cursor: "pointer",
                  }}
                  title={color}
                />
              ))}
            </div>
            <Form.Control
              type="text"
              name="colour"
              value={formData.colour}
              onChange={handleInputChange}
              placeholder="or type your own e.g. #FF5733"
              required
            />
            {formData.colour && !/^#[0-9A-Fa-f]{6}$/.test(formData.colour) && (
              <div style={{ color: "red", fontSize: 12 }}>
                Please enter a valid hex colour code (e.g. #FF5733)
              </div>
            )}
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : myLogo ? (
              "Update"
            ) : (
              "Add"
            )}{" "}
            Company's Logo and Color
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CompanyLogoAndColorRegistration;