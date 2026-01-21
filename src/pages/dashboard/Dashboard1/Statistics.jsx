


import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import StatisticsWidget from "../../../components/StatisticsWidget";
import { useParams } from "react-router-dom";

const Statistics = () => {
  const { user } = useAuthContext();
  const { tenantSlug } = useParams();

  const [stats, setStats] = useState({
    totalCategories: 0,
    totalPayments: 0,
    totalAmount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.token) return;

        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        // 🔍 Step 1: Fetch Categories
        const categoriesRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/category/list-categories`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");

        const categoriesData = await categoriesRes.json();
        console.log("Fetched Categories:", categoriesData);

        // 🧠 Determine actual array of categories
        const categoryArray = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.data || categoriesData.categories || [];

        const categoryIds = categoryArray.map((cat) => cat.id);

        // 🧮 Step 2: Fetch analytics for each category
        const fetchCategoryData = async (id) => {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/list?startTimeA=${startDate}&endTimeA=${endDate}&categoryId=${id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          if (!res.ok) throw new Error(`Failed to fetch for category ${id}`);
          return res.json();
        };

        const allCategoryData = await Promise.all(categoryIds.map(fetchCategoryData));

        let totalBookings = 0;
        let totalHours = 0;
        allCategoryData.forEach((data) => {
          totalBookings += data.booking?.bookingA || 0;
          totalHours += data.hour?.hourA || 0;
        });

        // 💳 Step 3: Fetch Payments
        const paymentsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/payment?startTimeA=${startDate}&endTimeA=${endDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!paymentsResponse.ok) {
          throw new Error("Failed to fetch payments data");
        }

        const paymentsData = await paymentsResponse.json();
        const paymentsCount = paymentsData.duration?.totalAmountForDurationA || 0;

        // ✅ Set final stats
        setStats({
          totalCategories: totalBookings,
          totalPayments: paymentsCount,
          totalAmount: totalHours,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, [user?.token, tenantSlug]);

  if (stats.loading) return <div>Loading statistics...</div>;
  if (stats.error) return <div>Error: {stats.error}</div>;

  return (
    <Row>
      <Col md={6} xl={4}>
        <StatisticsWidget
          variant="primary"
          description="Total Bookings"
          stats={stats.totalCategories.toString()}
          icon="fe-list"
        />
      </Col>
      <Col md={6} xl={4}>
        <StatisticsWidget
          variant="success"
          description="Total Payments"
          stats={stats.totalPayments.toString()}
          icon="fe-credit-card"
        />
      </Col>
      <Col md={6} xl={4}>
        <StatisticsWidget
          variant="info"
          description="Total Hours Booked"
          stats={stats.totalAmount.toLocaleString()}
          icon="fe-clock"
        />
      </Col>
    </Row>
  );
};

export default Statistics;
