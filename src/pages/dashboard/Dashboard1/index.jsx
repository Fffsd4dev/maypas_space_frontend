import React, { useState, useEffect, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";

// components
import HyperDatepicker from "../../../components/Datepicker";
import Statistics from "./Statistics";
import RevenueChart from "./RevenueChart";
import SalesAnalyticsChart from "./SalesAnalyticsChart";
import UsersBalances from "./UsersBalances";
import RevenueHistory from "./RevenueHistory";
import { balances, revenueHistory } from "./data";

const Dashboard1 = () => {
  const { user } = useAuthContext();
  const { tenantSlug } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State for categories and locations
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [filtersError, setFiltersError] = useState(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/list-categories`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Parse categories response
      let categoriesArray = [];
      if (data.data && Array.isArray(data.data)) {
        categoriesArray = data.data;
      } else if (Array.isArray(data)) {
        categoriesArray = data;
      }
      
      return categoriesArray;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }, [user?.token, tenantSlug]);

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/location/list-locations`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch locations: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Parse locations response
      let locationsArray = [];
      if (data.data && data.data.data && Array.isArray(data.data.data)) {
        locationsArray = data.data.data;
      } else if (data.data && Array.isArray(data.data)) {
        locationsArray = data.data;
      } else if (Array.isArray(data)) {
        locationsArray = data;
      }
      
      return locationsArray;
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  }, [user?.token, tenantSlug]);

  // Initial fetch for categories and locations
  useEffect(() => {
    if (!user?.token) {
      
      return;
    }

    const loadFilters = async () => {
      try {
        setIsLoadingFilters(true);
        setFiltersError(null);

        // Fetch both in parallel
        const [categoriesData, locationsData] = await Promise.all([
          fetchCategories(),
          fetchLocations()
        ]);

        setCategories(categoriesData);
        setLocations(locationsData);

        // Set default selections
        if (categoriesData.length > 0) {
          setSelectedCategoryId(categoriesData[0].id);
        }
        if (locationsData.length > 0) {
          setSelectedLocationId(locationsData[0].id);
        }

        setIsLoadingFilters(false);
      } catch (error) {
        console.error("Error loading filters:", error);
        setFiltersError(error.message);
        setIsLoadingFilters(false);
      }
    };

    loadFilters();
  }, [user?.token, fetchCategories, fetchLocations]);

  /*
   * handle date change
   */
  const onDateChange = date => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(parseInt(categoryId));
  };

  // Handle location change
  const handleLocationChange = (locationId) => {
    setSelectedLocationId(parseInt(locationId));
  };

  return (
    <>
      <Row>
        <Col>
          <div className="page-title-box">
            <div className="page-title-right">
              {/* You can add datepicker or other controls here */}
            </div>
            <h4 className="page-title">Dashboard</h4>
          </div>
        </Col>
      </Row>

      <Statistics 
        categories={categories}
        locations={locations}
        selectedCategoryId={selectedCategoryId}
        selectedLocationId={selectedLocationId}
        onCategoryChange={handleCategoryChange}
        onLocationChange={handleLocationChange}
        isLoadingFilters={isLoadingFilters}
        filtersError={filtersError}
      />

      <Row>
        <Col xl={12}>
          <UsersBalances balances={balances} />
        </Col>
      </Row>
    </>
  );
};

export default Dashboard1;