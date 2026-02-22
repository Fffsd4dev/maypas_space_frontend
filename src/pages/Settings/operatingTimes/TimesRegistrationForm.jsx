import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const TimeRegistrationModal = ({ show, onHide, operatingTime, locations = [], onSubmit }) => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const isMounted = useRef(true);

  const defaultHours = [
    { day: "monday", open_time: null, close_time: null },
    { day: "tuesday", open_time: null, close_time: null },
    { day: "wednesday", open_time: null, close_time: null },
    { day: "thursday", open_time: null, close_time: null },
    { day: "friday", open_time: null, close_time: null },
    { day: "saturday", open_time: null, close_time: null },
    { day: "sunday", open_time: null, close_time: null },
  ];

  const [formData, setFormData] = useState({
    location_id: "",
    hours: defaultHours,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset form when operatingTime changes or modal closes
  useEffect(() => {
    if (operatingTime) {
      const updatedHours = defaultHours.map((hour) => {
        const match = operatingTime.hours?.find((h) => h.day === hour.day);
        return match
          ? {
              day: hour.day,
              open_time: match.open_time || null,
              close_time: match.close_time || null,
            }
          : hour;
      });

      setFormData({
        location_id: operatingTime.location_id || "",
        hours: updatedHours,
      });
    } else {
      setFormData({
        location_id: "",
        hours: defaultHours,
      });
    }
  }, [operatingTime, show]);

  const handleLocationChange = useCallback((e) => {
    const locationId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      location_id: locationId,
    }));
  }, []);

  const handleHoursChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updatedHours = [...prev.hours];
      updatedHours[index] = {
        ...updatedHours[index],
        [field]: value || null,
      };
      return {
        ...prev,
        hours: updatedHours,
      };
    });
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.location_id) {
      toast.error("Please select a location");
      return false;
    }

    // Check if at least one day has both open and close times
    const hasValidHours = formData.hours.some(
      ({ open_time, close_time }) => open_time && close_time
    );

    if (!hasValidHours) {
      toast.error("Please set operating hours for at least one day");
      return false;
    }

    // Validate that open time is before close time for all set hours
    const isValidTimeRange = formData.hours.every(
      ({ open_time, close_time }) => {
        if (!open_time || !close_time) return true; // Skip incomplete entries
        return open_time <= close_time;
      }
    );

    if (!isValidTimeRange) {
      toast.error("Open time must be before close time for all days");
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    // Only include days with both open_time and close_time set
    const filteredHours = formData.hours.filter(
      ({ open_time, close_time }) => open_time && close_time
    );

    try {
      if (!tenantToken) throw new Error("Authorization token is missing.");

      const url = operatingTime
        ? `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/settings/workspace/time/update`
        : `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/settings/workspace/time/create`;

      const payload = {
        location_id: formData.location_id,
        hours: filteredHours,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tenantToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          operatingTime
            ? "Operating hours updated successfully!"
            : "Operating hours added successfully!"
        );
        
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
  }, [tenantToken, tenantSlug, operatingTime, formData, onSubmit, onHide, validateForm]);

  // Generate time options (00:00 to 23:30 in 30-minute increments)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 48; i++) {
      const hour = Math.floor(i / 2).toString().padStart(2, "0");
      const minute = i % 2 === 0 ? "00" : "30";
      const timeString = `${hour}:${minute}`;
      options.push(
        <option key={i} value={timeString}>
          {timeString}
        </option>
      );
    }
    return options;
  }, []);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title>
          {operatingTime ? "Edit Operating Hours" : "Add Operating Hours"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="location_id">
            <Form.Label>Location *</Form.Label>
            <Form.Select
              name="location_id"
              value={formData.location_id}
              onChange={handleLocationChange}
              required
              disabled={isLoading || operatingTime} // Disable when editing
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

          <div className="mb-3">
            <Form.Label>Operating Hours *</Form.Label>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Day</th>
                    <th>Open Time</th>
                    <th>Close Time</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.hours.map((hour, index) => (
                    <tr key={index}>
                      <td className="align-middle">
                        <strong>{hour.day.charAt(0).toUpperCase() + hour.day.slice(1)}</strong>
                      </td>
                      <td>
                        <Form.Select
                          value={hour.open_time || ""}
                          onChange={(e) =>
                            handleHoursChange(index, "open_time", e.target.value)
                          }
                          disabled={isLoading}
                        >
                          <option value="">Closed</option>
                          {timeOptions}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Select
                          value={hour.close_time || ""}
                          onChange={(e) =>
                            handleHoursChange(index, "close_time", e.target.value)
                          }
                          disabled={isLoading}
                        >
                          <option value="">Closed</option>
                          {timeOptions}
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Form.Text className="text-muted">
              Leave both open and close time empty to mark as closed.
            </Form.Text>
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
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {operatingTime ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{operatingTime ? "Update" : "Add"} Hours</>
            )}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TimeRegistrationModal;