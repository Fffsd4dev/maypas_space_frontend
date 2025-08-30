// import { Row, Col } from "react-bootstrap";

// // componets
// import StatisticsWidget from "../../../components/StatisticsWidget";
// // import StatisticsWidget3 from "../../../components/StatisticsWidget3";
// const Statistics = () => {
//   return <>
//       {/* <Row>
//         <Col md={6} xl={3}>
//           <StatisticsWidget3 title="Total Admin" stats="31570" trend={{
//           label: "Total Admin",
//           value: "$22506",
//           icon: "fa-caret-up",
//           variant: "success",
//           trendStats: "10.25%"
//         }} counterOptions={{
//           prefix: "$"
//         }} />
//         </Col>
//         <Col md={6} xl={3}>
//           <StatisticsWidget3 title="Total Tenants" stats="683" trend={{
//           label: "Total Users",
//           value: "2398",
//           icon: "fa-caret-down",
//           variant: "danger",
//           trendStats: "7.85%"
//         }} />
//         </Col>
//         <Col md={6} xl={3}>
//           <StatisticsWidget3 title="Total Subscriptions" stats="3" trend={{
//           label: "Total users",
//           value: "121 M",
//           icon: "fa-caret-up",
//           variant: "success",
//           trendStats: "3.64%"
//         }} counterOptions={{
//           suffix: "M",
//           decimals: 1
//         }} />
//         </Col>
//         <Col md={6} xl={3}>
//           <StatisticsWidget3 title="Total Revenue" stats="68541" trend={{
//           label: "Total revenue",
//           value: "$1.2 M",
//           icon: "fa-caret-up",
//           variant: "success",
//           trendStats: "17.48%"
//         }} counterOptions={{
//           prefix: "$"
//         }} />
//         </Col>
//       </Row> */}

//       <Row>
//         <Col md={6} xl={4}>
//           <StatisticsWidget variant="primary" counterOptions={{
//           // prefix: "₦"
//         }} description="Total Admin" stats="2" icon="fe-shopping-cart" />
//         </Col>
//         <Col md={6} xl={4}>
//           <StatisticsWidget variant="success" description="Total Tenants" stats="7" icon="fe-shopping-cart" />
//         </Col>
//         <Col md={6} xl={4}>
//           <StatisticsWidget variant="info" description="Total Subscription" stats="3" counterOptions={{
//         }} icon="fe-bar-chart-line-" />
//         </Col>
//       </Row>
//     </>;
// };
// export default Statistics;




// import { Row, Col } from "react-bootstrap";

// // componets
// import StatisticsWidget from "../../../components/StatisticsWidget";
// const Statistics = () => {
//   return <>

//       <Row>
//         <Col md={6} xl={4}>
//           <StatisticsWidget variant="primary" counterOptions={{
//           // prefix: "₦"
//         }} description="Total Admin" stats="2" icon="fe-shopping-cart" />
//         </Col>
//         <Col md={6} xl={4}>
//           <StatisticsWidget variant="success" description="Total Tenants" stats="7" icon="fe-shopping-cart" />
//         </Col>
//         <Col md={6} xl={4}>
//           <StatisticsWidget variant="info" description="Total Subscription" stats="3" counterOptions={{
//         }} icon="fe-bar-chart-line-" />
//         </Col>
//       </Row>
//     </>;
// };
// export default Statistics;




import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import StatisticsWidget from "../../../components/StatisticsWidget";

const Statistics = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalTenants: 0,
    totalSubscriptions: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.token) return;

        // Fetch tenants (workspaces)
        const tenantsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-workspaces`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!tenantsResponse.ok) {
          throw new Error('Failed to fetch tenants data');
        }

        const tenantsData = await tenantsResponse.json();

        // Access the nested data property correctly
const tenantsArray = tenantsData.data?.data; // Using optional chaining in case the structure isn't as expected

        const tenantsCount = Array.isArray(tenantsArray) ? tenantsArray.length : 0;

        // Fetch admins
        const adminsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-all`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!adminsResponse.ok) {
          throw new Error('Failed to fetch admins data');
        }

        const adminsData = await adminsResponse.json();
        const adminArray = adminsData.data?.data;
        const adminsCount = Array.isArray(adminArray) ? adminArray.length : 0;

        // Fetch subscriptions
        const subscriptionsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-subscriptions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!subscriptionsResponse.ok) {
          throw new Error('Failed to fetch subscriptions data');
        }

        const subscriptionsData = await subscriptionsResponse.json();
        const subscriptionArray = adminsData.data?.data;
        const subscriptionsCount = Array.isArray(subscriptionArray) ? subscriptionArray.length : 0;

        setStats({
          totalAdmins: adminsCount || 0,
          totalTenants: tenantsCount || 0,
          totalSubscriptions: subscriptionsCount || 0,
          loading: false,
          error: null
        });
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, [user?.token]);

  if (stats.loading) return <div>Loading statistics...</div>;
  if (stats.error) return <div>Error: {stats.error}</div>;

  return (
    <Row>
      <Col md={6} xl={4}>
        <StatisticsWidget 
          variant="primary" 
          description="Total Admin" 
          stats={stats.totalAdmins.toString()} 
          icon="fe-shopping-cart" 
        />
      </Col>
      <Col md={6} xl={4}>
        <StatisticsWidget 
          variant="success" 
          description="Total Tenants" 
          stats={stats.totalTenants.toString()} 
          icon="fe-shopping-cart" 
        />
      </Col>
      <Col md={6} xl={4}>
        <StatisticsWidget 
          variant="info" 
          description="Total Subscription" 
          stats={stats.totalSubscriptions.toString()} 
          icon="fe-bar-chart-line-" 
        />
      </Col>
    </Row>
  );
};

export default Statistics;




