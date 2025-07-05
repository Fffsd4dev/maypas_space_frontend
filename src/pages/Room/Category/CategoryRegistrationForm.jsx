import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const CategoryRegistrationModal = ({ show, onHide, myCategory, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [floorData, setFloorData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationName, setIsLocationName] = useState("");
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    category: "",
    location_id: "",
    booking_type: "",
    min_duration: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (myCategory) {
      setFormData({
        category: myCategory.category || "",
        location_id: myCategory.location_id || "",
        booking_type: myCategory.booking_type || "",
        min_duration: myCategory.min_duration || "",
      });
    } else {
      setFormData({
        category: "",
        location_id: "",
        booking_type: "",
        min_duration: "",
      });
    }
  }, [myCategory]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/location/list-locations`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        console.log("Locations:", result.data.data);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setFormData((prev) => ({
      ...prev,
      location_id: locationId,
    }));
  };

  useEffect(() => {
    locations.map((location) => {
      if (location.id === myCategory?.location_id) {
        setSelectedLocation(location.id);
        setIsLocationName(location.name);
      }
    });
  }, [user?.tenantToken, locations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(formData);
    console.log(user?.tenantToken);

    try {
      if (!user?.tenantToken)
        throw new Error("Authorization token is missing.");

      const url = myCategory
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/${tenantSlug}/category/update/${myCategory.id}`
        : `${
            import.meta.env.VITE_BACKEND_URL
          }/api/${tenantSlug}/category/create`;

      const method = myCategory ? "POST" : "POST";
      
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    images.forEach((img, idx) => {
      formDataToSend.append("category_image[]", img);
    });

    console.log("formdata to send ", formDataToSend.get("category"))


      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${user?.tenantToken}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        toast.success(
          myCategory
            ? "Category updated successfully!"
            : "Category registered successfully!"
        );
        setFormData({
          category: "",
          location_id: "",
          booking_type: "",
          min_duration: "",
        });
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
        console.log(result);
      }
    } catch (error) {
      toast.error("An error occurred. Contact Admin");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {myCategory ? "Category" : "Add a New Category"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="category_images">
  <Form.Label>Category Images</Form.Label>

<Form.Control
  type="file"
  multiple
  accept="image/*"
  disabled={images.length >= 3}
  onChange={e => {
    if (e.target.files && e.target.files.length > 0) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      const files = Array.from(e.target.files).filter(f => {
        if (!(f instanceof File)) return false;
        if (f.size > maxSize) {
          toast.error(`${f.name} is larger than 2MB. Please select a smaller image.`);
          return false;
        }
        return !images.some(img => img.name === f.name && img.size === f.size);
      });
      // Only add up to 3 images total
      const availableSlots = 3 - images.length;
      if (availableSlots > 0) {
        setImages(prev => [...prev, ...files.slice(0, availableSlots)]);
      }
      e.target.value = "";
    }
  }}
/>
  {images.length >= 3 && (
  <div className="text-danger mb-2">You can only upload up to 3 images.</div>
)}
</Form.Group>
{images.length > 0 && (
  <div className="mb-3">
    <div>Preview:</div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {images.map((img, idx) => (
        <div key={idx} style={{ position: "relative", display: "inline-block" }}>
          {img instanceof File ? (
            <img
              src={URL.createObjectURL(img)}
              alt={`preview-${idx}`}
              style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
            />
          ) : null}
          <button
            type="button"
            onClick={() => setImages(images.filter((_, i) => i !== idx))}
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "50%",
              width: 20,
              height: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              fontSize: 14,
              lineHeight: 1,
            }}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </div>
)}
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="Podcast studio "
              required
            />
          </Form.Group>
          <div>
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

            <Form.Group className="mb-3" controlId="booking_type">
              <Form.Label>Booking Type</Form.Label>
              <Form.Select
                name="booking_type"
                value={formData.booking_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a location</option>
                <option value="hourly">hourly</option>
                <option value="daily">daily</option>
                <option value="weekly">weekly</option>
                <option value="monthly">monthly</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="min_duration">
              <Form.Label>Minimum duration for the booking type *</Form.Label>
              <Form.Control
                type="number"
                name="min_duration"
                required
                value={formData.min_duration}
                onChange={handleInputChange}
                placeholder="1"
              ></Form.Control>
            </Form.Group>

            {/* {myCategory ? (
                            <>
                                <Form.Label>
                                    Select the location you want to add the Room/Space Category.
                                </Form.Label>
                                <Form.Select
                                    style={{ marginBottom: "25px", fontSize: "1rem" }}
                                    value={selectedLocation || ""}
                                    onChange={handleLocationChange}
                                    required
                                >
                                    <option disabled value={formData.location_id}>
                                        {isLocationName}
                                    </option>
                                </Form.Select>
                            </>
                        ) : (
                            <>
                                <Form.Label>Select the location you want to add the room/space.</Form.Label>
                                <Form.Select
                                    style={{ marginBottom: "25px", fontSize: "1rem" }}
                                    value={selectedLocation || ""}
                                    onChange={handleLocationChange}
                                    required
                                >
                                    <option value="" disabled>
                                        Select a location
                                    </option>
                                    {locations.map((location) => (
                                        <option key={location.id} value={location.id}>
                                            {location.name} at {location.state}
                                        </option>
                                    ))}
                                </Form.Select>
                            </>
                        )} */}
          </div>
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
              <Spinner
                as="span"
                animation="border"
                size="sm"
                locations="status"
                aria-hidden="true"
              />
            ) : myCategory ? (
              "Update"
            ) : (
              "Create"
            )}{" "}
            Category
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CategoryRegistrationModal;
