// import { Row, Col } from "react-bootstrap";

// // componets
// import StatisticsWidget from "../../../components/StatisticsWidget";
// const Statistics = () => {
//   return <>
//       <Row>
//         <Col md={6} xl={4}>
//           <StatisticsWidget variant="primary" counterOptions={{
//           prefix: "₦"
//         }} description="Total Revenue" stats="5833487" icon="fe-shopping-cart" />
//         </Col>
//         <Col md={6} xl={4}>
//           <StatisticsWidget variant="success" description="Total Hours" stats="127" icon="fe-shopping-cart" />
//         </Col>
//         <Col md={6} xl={4}>
//           <StatisticsWidget variant="info" description="Total Users that Book" stats="0.58" counterOptions={{
//         }} icon="fe-bar-chart-line-" />
//         </Col>
//       </Row>
//     </>;
// };
// export default Statistics;



// import { useState, useEffect } from 'react';
// import { Row, Col } from "react-bootstrap";
// import { useAuthContext } from '@/context/useAuthContext'; // Assuming you have an auth context
// import StatisticsWidget from "../../../components/StatisticsWidget";

// const Statistics = () => {
//   const { user } = useAuthContext(); // Get the user from your auth context
//   const tenantSlug = user?.tenant;
//   const [stats, setStats] = useState({
//     totalRevenue: 0,
//     totalHours: 0,
//     bookingRate: 0,
//     totalTenants: 0,
//     totalAdmins: 0,
//     totalSubscriptions: 0,
//     isLoading: true,
//     error: null
//   });

//   useEffect(() => {
//     const fetchStatistics = async () => {
//       try {
//         // Fetch tenant analytics
//         const tenantResponse = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/payment?startTimeA=2025-01-01&endTimeA=2025-12-31`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${user?.token}`,
//             },
//           }
//         );

//         if (!tenantResponse.ok) {
//           throw new Error('Failed to fetch tenant data');
//         }

//         const tenantData = await tenantResponse.json();

//         // You would fetch other statistics here similarly
//         // For example:
//         // const adminsResponse = await fetch(...);
//         // const subscriptionsResponse = await fetch(...);

//         setStats(prev => ({
//           ...prev,
//           totalRevenue: tenantData.totalRevenue || 0,
//           totalHours: tenantData.totalHours || 0,
//           bookingRate: tenantData.bookingRate || 0,
//           // Add other stats as you fetch them
//           isLoading: false,
//           error: null
//         }));

//       } catch (error) {
//         console.error('Error fetching statistics:', error);
//         setStats(prev => ({
//           ...prev,
//           isLoading: false,
//           error: error.message
//         }));
//       }
//     };

//     if (user?.token && tenantSlug) {
//       fetchStatistics();
//     }
//   }, [user?.token, tenantSlug]);

//   if (stats.isLoading) return <div>Loading statistics...</div>;
//   if (stats.error) return <div>Error: {stats.error}</div>;

//   return (
//     <>
//       <Row>
//         <Col md={6} xl={4}>
//           <StatisticsWidget 
//             variant="primary" 
//             counterOptions={{ prefix: "₦" }} 
//             description="Total Revenue" 
//             stats={stats.totalRevenue.toLocaleString()} 
//             icon="fe-shopping-cart" 
//           />
//         </Col>
//         <Col md={6} xl={4}>
//           <StatisticsWidget 
//             variant="success" 
//             description="Total Hours" 
//             stats={stats.totalHours} 
//             icon="fe-clock" 
//           />
//         </Col>
//         <Col md={6} xl={4}>
//           <StatisticsWidget 
//             variant="info" 
//             description="Booking Rate" 
//             stats={stats.bookingRate} 
//             counterOptions={{ 
//               decimalPlaces: 2,
//               suffix: "%" 
//             }}
//             icon="fe-bar-chart-line-" 
//           />
//         </Col>
//       </Row>
//       {/* Add more rows/widgets for other statistics as needed */}
//     </>
//   );
// };

// export default Statistics;



// // import { useState, useEffect } from 'react';
// // import { Row, Col } from "react-bootstrap";
// // import StatisticsWidget from "../../../components/StatisticsWidget";
// // import { useAuthContext } from "@/context/useAuthContext.jsx";

// // const Statistics = () => {
// //   const { user } = useAuthContext();
// //   const [statsData, setStatsData] = useState({
// //     totalRevenue: 0,
// //     totalHours: 0,
// //     totalBookings: 0
// //   });
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   console.log(user); // Changed from currentUser to user

// //   useEffect(() => {
// //     const fetchStatistics = async () => {
// //       try {
// //         if (!user || !user.tenantToken) { // Changed check to use user.tenantToken
// //           throw new Error("User not authenticated");
// //         }

// //         const apiUrl = 'https://test.maypaspace.com/api/emekaandsons/analytics/payment?startTimeA=2025-06-01&endTimeA=2025-06-30';
        
// //         console.log('Fetching data from:', apiUrl);
        
// //         const response = await fetch(apiUrl, {
// //           headers: {
// //             'Authorization': `Bearer ${user.tenantToken}`, // Using tenantToken from user
// //             'Content-Type': 'application/json'
// //           }
// //         });
        
// //         if (!response.ok) {
// //           throw new Error(`HTTP error! status: ${response.status}`);
// //         }
        
// //         const data = await response.json();
        
// //         console.log('API Response:', data);
        
// //         // Update these based on your actual API response structure
// //         setStatsData({
// //           totalRevenue: data.totalAmount || 0,
// //           totalHours: data.totalHours || 0,
// //           totalBookings: data.totalBookings || 0
// //         });
        
// //       } catch (err) {
// //         console.error('Error fetching statistics:', err);
// //         setError(err.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchStatistics();
// //   }, [user]); // Changed dependency to user instead of currentUser

// //   if (loading) return <div>Loading statistics...</div>;
// //   if (error) return <div>Error: {error}</div>;

// //   return (
// //     <Row>
// //       <Col md={6} xl={4}>
// //         <StatisticsWidget 
// //           variant="primary" 
// //           counterOptions={{ prefix: "₦" }} 
// //           description="Total Revenue" 
// //           stats={statsData.totalRevenue.toString()} 
// //           icon="fe-heart" 
// //         />
// //       </Col>
// //       <Col md={6} xl={4}>
// //         <StatisticsWidget 
// //           variant="success" 
// //           description="Total Hours" 
// //           stats={statsData.totalHours.toString()} 
// //           icon="fe-shopping-cart" 
// //         />
// //       </Col>
// //       <Col md={6} xl={4}>
// //         <StatisticsWidget 
// //           variant="info" 
// //           description="Total Bookings" 
// //           stats={statsData.totalBookings.toString()} 
// //           counterOptions={{}} 
// //           icon="fe-bar-chart-line-" 
// //         />
// //       </Col>
// //     </Row>
// //   );
// // };

// // export default Statistics;





// import { Row, Col } from "react-bootstrap";
// import { useState, useEffect } from "react";
// import { useAuthContext } from "@/context/useAuthContext.jsx";
// import StatisticsWidget from "../../../components/StatisticsWidget";

// const Statistics = () => {
//   const { user } = useAuthContext();
//   const [stats, setStats] = useState({
//     totalAdmins: 0,
//     totalTenants: 0,
//     totalSubscriptions: 0,
//     loading: true,
//     error: null
//   });

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         if (!user?.token) return;

//         // Fetch tenants (workspaces)
//         const tenantsResponse = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-workspaces`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${user.token}`,
//             },
//           }
//         );

//         if (!tenantsResponse.ok) {
//           throw new Error('Failed to fetch tenants data');
//         }

//         const tenantsData = await tenantsResponse.json();

//         // Access the nested data property correctly
// const tenantsArray = tenantsData.data?.data; // Using optional chaining in case the structure isn't as expected

//         const tenantsCount = Array.isArray(tenantsArray) ? tenantsArray.length : 0;

//         // Fetch admins
//         const adminsResponse = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-all`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${user.token}`,
//             },
//           }
//         );

//         if (!adminsResponse.ok) {
//           throw new Error('Failed to fetch admins data');
//         }

//         const adminsData = await adminsResponse.json();
//         const adminArray = adminsData.data?.data;
//         const adminsCount = Array.isArray(adminArray) ? adminArray.length : 0;

//         // Fetch subscriptions
//         const subscriptionsResponse = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-subscriptions`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${user.token}`,
//             },
//           }
//         );

//         if (!subscriptionsResponse.ok) {
//           throw new Error('Failed to fetch subscriptions data');
//         }

//         const subscriptionsData = await subscriptionsResponse.json();
//         const subscriptionArray = adminsData.data?.data;
//         const subscriptionsCount = Array.isArray(subscriptionArray) ? subscriptionArray.length : 0;

//         setStats({
//           totalAdmins: adminsCount || 0,
//           totalTenants: tenantsCount || 0,
//           totalSubscriptions: subscriptionsCount || 0,
//           loading: false,
//           error: null
//         });
//       } catch (error) {
//         setStats(prev => ({
//           ...prev,
//           loading: false,
//           error: error.message
//         }));
//         console.error("Error fetching statistics:", error);
//       }
//     };

//     fetchStats();
//   }, [user?.token]);

//   if (stats.loading) return <div>Loading statistics...</div>;
//   if (stats.error) return <div>Error: {stats.error}</div>;

//   return (
//     <Row>
//       <Col md={6} xl={4}>
//         <StatisticsWidget 
//           variant="primary" 
//           description="Total Admin" 
//           stats={stats.totalAdmins.toString()} 
//           icon="fe-shopping-cart" 
//         />
//       </Col>
//       <Col md={6} xl={4}>
//         <StatisticsWidget 
//           variant="success" 
//           description="Total Tenants" 
//           stats={stats.totalTenants.toString()} 
//           icon="fe-shopping-cart" 
//         />
//       </Col>
//       <Col md={6} xl={4}>
//         <StatisticsWidget 
//           variant="info" 
//           description="Total Subscription" 
//           stats={stats.totalSubscriptions.toString()} 
//           icon="fe-bar-chart-line-" 
//         />
//       </Col>
//     </Row>
//   );
// };

// export default Statistics;



import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import StatisticsWidget from "../../../components/StatisticsWidget";

const Statistics = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalPayments: 0,
    totalAmount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.token) return;

        // Get current year for the analytics queries
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        // Fetch categories count
        const categoriesResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/distinctshoot/analytics/list?startTimeA=${startDate}&endTimeA=${endDate}&categoryId=1`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        console.log(categoriesResponse)

        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories data');
        }

        const categoriesData = await categoriesResponse.json();
        const categoriesCount = categoriesData.data?.length || 0;

        // Fetch payment analytics
        const paymentsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/distinctshoot/analytics/payment?startTimeA=${startDate}&endTimeA=${endDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!paymentsResponse.ok) {
          throw new Error('Failed to fetch payments data');
        }

        const paymentsData = await paymentsResponse.json();
        const paymentsCount = paymentsData.data?.count || 0;
        const totalAmount = paymentsData.data?.total || 0;

        setStats({
          totalCategories: categoriesCount,
          totalPayments: paymentsCount,
          totalAmount: totalAmount,
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
          description="Total Categories" 
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
          description="Total Amount" 
          stats={`$${stats.totalAmount.toLocaleString()}`} 
          icon="fe-dollar-sign" 
        />
      </Col>
    </Row>
  );
};

export default Statistics;