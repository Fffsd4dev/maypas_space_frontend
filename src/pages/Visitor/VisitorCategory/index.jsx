import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Error404Alt from "../../error/Error404Alt.jsx";

const VisitorCategory = () => {
  const { visitorSlug, category } = useParams();
  const [roomsData, setRoomsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${visitorSlug}/get/locations`
        );
        const result = await response.json();
        if (response.ok && Array.isArray(result.data) && result.data.length > 0) {
          // Get the first location's id (or adjust logic as needed)
          const locationId = result.data[0].id;
          const roomRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/${visitorSlug}/get/spaces/${locationId}?page=1&per_page=10`
          );
          const roomResult = await roomRes.json();
          setRoomsData(roomResult.data || {});
        } else {
          setRoomsData({});
        }
      } catch {
        setRoomsData({});
      }
      setLoading(false);
    };
    fetchRooms();
  }, [visitorSlug]);

  if (loading) return <div>Loading...</div>;

  // Check if category exists in roomsData
  const decodedCategory = decodeURIComponent(category);
  const categories = roomsData ? Object.keys(roomsData) : [];
  const categoryExists = categories.includes(decodedCategory);

  if (!categoryExists) {
    return <Error404Alt />;
  }

  return (
    <div>
      <h2>
        Category: <span style={{ color: "#007bff" }}>{decodedCategory}</span>
      </h2>
      {/* Render category-specific content here */}
    </div>
  );
};

export default VisitorCategory;