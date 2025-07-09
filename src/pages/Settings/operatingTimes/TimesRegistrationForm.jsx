import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoColor } from "../../../context/LogoColorContext";

const TimeRegistrationModal = ({ show, onHide, myOperatingTime, onSubmit }) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const defaultHours = [
    { day: "monday", open_time: "09:00", close_time: "17:00" },
    { day: "tuesday", open_time: "09:00", close_time: "17:00" },
    { day: "wednesday", open_time: "09:00", close_time: "17:00" },
    { day: "thursday", open_time: "09:00", close_time: "17:00" },
    { day: "friday", open_time: "09:00", close_time: "17:00" },
    { day: "saturday", open_time: "14:00", close_time: "18:00" },
    { day: "sunday", open_time: "14:00", close_time: "18:00" },
  ];

  const [formData, setFormData] = useState({
    location_id: "",
    hours: [
      { day: "monday", open_time: "09:00", close_time: "17:00" },
      { day: "tuesday", open_time: "09:00", close_time: "17:00" },
      { day: "wednesday", open_time: "09:00", close_time: "17:00" },
      { day: "thursday", open_time: "09:00", close_time: "17:00" },
      { day: "friday", open_time: "09:00", close_time: "17:00" },
      { day: "saturday", open_time: "14:00", close_time: "18:00" },
      { day: "sunday", open_time: "14:00", close_time: "18:00" },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (myOperatingTime) {
      const updatedHours = defaultHours.map((hour) => {
        const match = myOperatingTime.hours?.find((h) => h.day === hour.day);
        return match
          ? {
              day: hour.day,
              open_time: match.open_time.slice(0, 5), // Ensure format is HH:mm
              close_time: match.close_time.slice(0, 5), // Ensure format is HH:mm
            }
          : hour; // Retain default values if no match is found
      });

      console.log("Updated Hours:", updatedHours); // Debugging
      setFormData({
        location_id: myOperatingTime.location_id || "",
        hours: updatedHours,
      });
    }
  }, [myOperatingTime]);

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
        hours: defaultHours,
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

    const isValidTimeRange = formData.hours.every(
      ({ open_time, close_time }) => open_time <= close_time
    );

    if (!isValidTimeRange) {
      toast.error("Open time must be before close time for all days.");
      setIsLoading(false);
      return;
    }

    try {
      if (!user?.tenantToken)
        throw new Error("Authorization token is missing.");

      const url = myOperatingTime
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/${tenantSlug}/settings/workspace/time/update`
        : `${
            import.meta.env.VITE_BACKEND_URL
          }/api/${tenantSlug}/settings/workspace/time/create`;

      const method = myOperatingTime ? "POST" : "POST";

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
          myOperatingTime
            ? "Working Hours updated successfully!"
            : "Working Hours added successfully!"
        );
        if (!myOperatingTime) {
          // Only reset form if creating new
          setFormData({
            location_id: "",
            hours: defaultHours,
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
          {myOperatingTime ? "Working Hours" : "Add New Working Hours"}
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

          <div className="mb-3">
            <Form.Label>Working Hours</Form.Label>
            {formData.hours.map((hour, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <Form.Control
                  type="text"
                  value={hour.day}
                  readOnly
                  className="me-2"
                />
                <Form.Select
                  value={hour.open_time} // Ensure this matches the generated options
                  onChange={(e) =>
                    handleHoursChange(index, "open_time", e.target.value)
                  }
                  className="me-2"
                  required
                >
                  <option value="">Select Open Time</option>
                  {Array.from({ length: 48 }, (_, i) => {
                    const hour = Math.floor(i / 2)
                      .toString()
                      .padStart(2, "0");
                    const minutes = i % 2 === 0 ? "00" : "30";
                    const timeString = `${hour}:${minutes}`;
                    return (
                      <option key={i} value={timeString}>
                        {timeString}
                      </option>
                    );
                  })}
                </Form.Select>

                <Form.Select
                  value={hour.close_time} // Ensure this matches the generated options
                  onChange={(e) =>
                    handleHoursChange(index, "close_time", e.target.value)
                  }
                  required
                >
                  <option value="">Select Close Time</option>
                  {Array.from({ length: 48 }, (_, i) => {
                    const hour = Math.floor(i / 2)
                      .toString()
                      .padStart(2, "0");
                    const minutes = i % 2 === 0 ? "00" : "30";
                    const timeString = `${hour}:${minutes}`;
                    return (
                      <option key={i} value={timeString}>
                        {timeString}
                      </option>
                    );
                  })}
                </Form.Select>
              </div>
            ))}
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
                role="status"
                aria-hidden="true"
              />
            ) : myOperatingTime ? (
              "Update"
            ) : (
              "Add"
            )}{" "}
            Working Hours
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TimeRegistrationModal;
