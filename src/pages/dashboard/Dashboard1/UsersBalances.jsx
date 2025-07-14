// import { Card, Dropdown } from "react-bootstrap";
// import { Link } from "react-router-dom";
// import classNames from "classnames";
// const UsersBalances = ({
//   balances
// }) => {
//   return <>
//       <Card>
//         <Card.Body>

//           <h4 className="header-title mb-3">Top Sales by Users</h4>
//           <div className="table-responsive">
//             <table className="table table-borderless table-hover table-nowrap table-centered m-0">
//               <thead className="table-light">
//                 <tr>
//                   <th colSpan={2}>User</th>
//                   <th>Amount Spent</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(balances || []).map((item, i) => {
//                 return <tr key={i}>
//                       <td style={{
//                     width: "36px"
//                   }}>
//                         <img src={item.avatar} alt="contact-img" title="contact-img" className="rounded-circle avatar-sm" />
//                       </td>

//                       <td>
//                         <h5 className="m-0 fw-normal">{item.name}</h5>
//                       </td>


//                       <td>₦ {item.balance}</td>

//                     </tr>;
//               })}
//               </tbody>
//             </table>
//           </div>
//         </Card.Body>
//       </Card>
//     </>;
// };
// export default UsersBalances;





// import { useEffect, useState } from "react";
// import { Card } from "react-bootstrap";
// import { useAuthContext } from "@/context/useAuthContext.jsx";
// import { useParams } from "react-router-dom";

// const UsersBalances = () => {
//   const { user } = useAuthContext(); // Get the token from context
//   const [balances, setBalances] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

  
//   const { tenantSlug } = useParams();

//   useEffect(() => {
//     const fetchBalances = async () => {
//       try {
//         if (!user?.token) return;

//         const res = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/accounts?startTimeA=2025-01-01&endTimeA=2025-12-31`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${user.token}`,
//               Accept: "application/json",
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!res.ok) throw new Error("Failed to fetch account balances");

//         const data = await res.json();

//         // 👇 Log API response
//         console.log("API Response (UsersBalances):", data);

//         setBalances(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBalances();
//   }, [user?.token]);

//   if (loading) return <div>Loading user balances...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <Card>
//       <Card.Body>
//         <h4 className="header-title mb-3">Amount Spent by Users</h4>
//         <div className="table-responsive">
//           <table className="table table-borderless table-hover table-nowrap table-centered m-0">
//             <thead className="table-light">
//               <tr>
//                 <th>User</th>
//                 <th>Amount Spent</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(balances || []).map((item, i) => (
//                 <tr key={i}>
//                   {/* <td style={{ width: "36px" }}>
//                     <img
//                       src={item.avatar || "/default-avatar.png"}
//                       alt="avatar"
//                       title="User avatar"
//                       className="rounded-circle avatar-sm"
//                     />
//                   </td> */}
//                   <td>
//                     <h5 className="m-0 fw-normal">{item.name}</h5>
//                   </td>
//                   <td>₦ {Number(item.fee).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Card.Body>
//     </Card>
//   );
// };

// export default UsersBalances;



// import { useEffect, useState } from "react";
// import { Card, Pagination } from "react-bootstrap";
// import { useAuthContext } from "@/context/useAuthContext.jsx";
// import { useParams } from "react-router-dom";

// const UsersBalances = () => {
//   const { user } = useAuthContext();
//   const { tenantSlug } = useParams();
//   const [balances, setBalances] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);

//   const itemsPerPage = 10;

//   useEffect(() => {
//     const fetchBalances = async () => {
//       try {
//         if (!user?.token) return;

//         const res = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/accounts?startTimeA=2025-01-01&endTimeA=2025-12-31`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${user.token}`,
//               Accept: "application/json",
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!res.ok) throw new Error("Failed to fetch account balances");

//         const data = await res.json();
//         console.log("API Response (UsersBalances):", data);
//         setBalances(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBalances();
//   }, [user?.token]);

//   if (loading) return <div>Loading user balances...</div>;
//   if (error) return <div>Error: {error}</div>;

//   // Pagination logic
//   const totalPages = Math.ceil(balances.length / itemsPerPage);
//   const paginatedData = balances.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   return (
//     <Card>
//       <Card.Body>
//         <h4 className="header-title mb-3">Amount Spent by Users</h4>
//         <div className="table-responsive">
//           <table className="table table-borderless table-hover table-nowrap table-centered m-0">
//             <thead className="table-light">
//               <tr>
//                 <th>User</th>
//                 <th>Amount Spent</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedData.map((item, i) => (
//                 <tr key={i}>
//                   <td>
//                     <h5 className="m-0 fw-normal">{item.name}</h5>
//                   </td>
//                   <td>₦ {Number(item.fee).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Controls */}
//         <Pagination className="mt-3 justify-content-center">
//           <Pagination.First
//             onClick={() => handlePageChange(1)}
//             disabled={currentPage === 1}
//           />
//           <Pagination.Prev
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//           />
//           {[...Array(totalPages)].map((_, idx) => (
//             <Pagination.Item
//               key={idx + 1}
//               active={currentPage === idx + 1}
//               onClick={() => handlePageChange(idx + 1)}
//             >
//               {idx + 1}
//             </Pagination.Item>
//           ))}
//           <Pagination.Next
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           />
//           <Pagination.Last
//             onClick={() => handlePageChange(totalPages)}
//             disabled={currentPage === totalPages}
//           />
//         </Pagination>
//       </Card.Body>
//     </Card>
//   );
// };

// export default UsersBalances;




import { useEffect, useState } from "react";
import { Card, Pagination } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";

const UsersBalances = () => {
  const { user } = useAuthContext();
  const { tenantSlug } = useParams();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        if (!user?.token) return;

        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/analytics/accounts?startTimeA=${startDate}&endTimeA=${endDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch account balances");

        const data = await res.json();
        console.log("API Response (UsersBalances):", data);
        setBalances(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [user?.token]);

  if (loading) return <div>Loading user balances...</div>;
  if (error) return <div>Error: {error}</div>;

  // Pagination logic
  const totalPages = Math.ceil(balances.length / itemsPerPage);
  const paginatedData = balances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-3">Amount Spent by Users</h4>
        <div className="table-responsive">
          <table className="table table-borderless table-hover table-nowrap table-centered m-0">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Amount Spent</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, i) => (
                <tr key={i}>
                  <td>
                    <h5 className="m-0 fw-normal">{item.name}</h5>
                  </td>
                  <td>₦ {Number(item.fee).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination className="mt-3 justify-content-center">
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={currentPage === idx + 1}
              onClick={() => handlePageChange(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </Card.Body>
    </Card>
  );
};

export default UsersBalances;
