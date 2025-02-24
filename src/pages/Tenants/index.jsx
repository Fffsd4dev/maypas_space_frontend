// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Row, Col, Card, Button } from "react-bootstrap";
// import classNames from "classnames";

// // components
// import PageTitle from "../../components/PageTitle";
// import Table from "../../components/Table";
// import AddUser from "./AddCustomer";
// // import { useAuthContext } from ""; // Ensure correct import path
// import { useAuthContext } from '@/context/useAuthContext.jsx';

// /* name column render */
// const NameColumn = ({ row }) => {
//   return (
//     <div className="table-user">
//       <img src={row.original.avatar || "default-avatar.png"} alt="" className="me-2 rounded-circle" />
//       <Link to="#" className="text-body fw-semibold">{row.original.name}</Link>
//     </div>
//   );
// };

// /* status column render */
// const StatusColumn = ({ row }) => {
//   return (
//     <span className={classNames("badge", {
//       "bg-soft-success text-success": row.original.status === "Active",
//       "bg-soft-danger text-danger": row.original.status === "Blocked"
//     })}>
//       {row.original.status}
//     </span>
//   );
// };

// /* action column render */
// const ActionColumn = () => {
//   return (
//     <>
//       <Link to="#" className="action-icon"><i className="mdi mdi-eye"></i></Link>
//       <Link to="#" className="action-icon"><i className="mdi mdi-square-edit-outline"></i></Link>
//       <Link to="#" className="action-icon"><i className="mdi mdi-delete"></i></Link>
//     </>
//   );
// };

// // Table columns
// const columns = [
//   { Header: "Workspace Name", accessor: "id", sort: true },
//   { Header: "Email", accessor: "company_name", sort: false },
//   { Header: "Phone", accessor: "company_no_location", sort: false },
//   { Header: "Address", accessor: "company_countries", sort: false },
//   { Header: "Created On", accessor: "created_at", sort: false },
//   { Header: "Status", accessor: "status", sort: false, Cell: StatusColumn },
//   { Header: "Action", accessor: "action", sort: false, classes: "table-action", Cell: ActionColumn }
// ];

// // Main component
// const Tenants = () => {
//   const { user } = useAuthContext(); // Get the auth token from context
//   console.log("Auth Token:", user?.token);
//   const [show, setShow] = useState(false);
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch data from API with Authorization
//   useEffect(() => {
//     if (!user?.token) return; // Ensure token is available before making the request

//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const response = await fetch("https://trial.maypasworkspace.com/api/system-admin/view-workspaces", {
//           method: "GET",
//           headers: {
//             // "Content-Type": "application/json",
//             "Authorization": `Bearer ${user?.token}`
//           }
//         });
//         console.log('response', response)
//         console.log('response', response.data.data)

//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log('Parsed response data:', result); // Log parsed data
//         if (result) {
//           setData(result.data); // Adjust according to API response
//         } else {
//           throw new Error("Failed to fetch data");
//         }
//       } catch (error) {
//         console.error("Error fetching workspaces:", error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [user]); // Refetch when token changes

//   return (
//     <>
//       <PageTitle breadCrumbItems={[{ label: "Tenants", path: "/account/admin", active: true }]} title="Tenants" />

//       <Row>
//         <Col>
//           <Card>
//             <Card.Body>
//               <Row className="mb-2">
//                 <Col sm={4}>
//                   <Button variant="danger" className="waves-effect waves-light" onClick={() => setShow(true)}>
//                     <i className="mdi mdi-plus-circle me-1"></i> Add Tenants
//                   </Button>
//                 </Col>
//                 <Col sm={8}>
//                   <div className="text-sm-end mt-2 mt-sm-0">
//                     <Button className="btn btn-success mb-2 me-1"><i className="mdi mdi-cog"></i></Button>
//                     <Button className="btn btn-light mb-2 me-1">Import</Button>
//                     <Button className="btn btn-light mb-2">Export</Button>
//                   </div>
//                 </Col>
//               </Row>

//               {/* Display error or loading state */}
//               {error ? (
//                 <p className="text-danger">Error: {error}</p>
//               ) : loading ? (
//                 <p>Loading workspaces...</p>
//               ) : (
//                 <Table columns={columns} data={data} pageSize={12} isSortable pagination isSelectable tableClass="table-nowrap table-striped" />
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Add User Modal */}
//       <AddUser show={show} onHide={() => setShow(false)} onSubmit={() => setShow(false)} />
//     </>
//   );
// };

// export default Tenants;






import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import classNames from "classnames";

// components
import PageTitle from "../../components/PageTitle";
import Table from "../../components/Table";
import AddUser from "./AddCustomer";
import { useAuthContext } from '@/context/useAuthContext.jsx';
import WorkspaceRegistrationForm from "../Tenants/WorkspaceRegistrationForm";

/* name column render */
const NameColumn = ({ row }) => {
  return (
    <div className="table-user">
      <img src={row.original.avatar || "default-avatar.png"} alt="" className="me-2 rounded-circle" />
      <Link to="#" className="text-body fw-semibold">{row.original.name}</Link>
    </div>
  );
};

/* status column render */
const StatusColumn = ({ row }) => {
  return (
    <span className={classNames("badge", {
      "bg-soft-success text-success": row.original.status === "Active",
      "bg-soft-danger text-danger": row.original.status === "Blocked"
    })}>
      {row.original.status}
    </span>
  );
};

/* action column render */
const ActionColumn = () => {
  return (
    <>
      <Link to="#" className="action-icon"><i className="mdi mdi-eye"></i></Link>
      <Link to="#" className="action-icon"><i className="mdi mdi-square-edit-outline"></i></Link>
      <Link to="#" className="action-icon"><i className="mdi mdi-delete"></i></Link>
    </>
  );
};

// Table columns
const columns = [
  { Header: "ID", accessor: "id", sort: true },
  { Header: "Company Name", accessor: "company_name", sort: false },
  { Header: "Amount of Locations", accessor: "company_no_location", sort: false },
  { Header: "Countries", accessor: "company_countries", sort: false },
  { Header: "Created On", accessor: "created_at", sort: false },
  { Header: "Status", accessor: "subscription_id", sort: false, Cell: StatusColumn },
  { Header: "Action", accessor: "action", sort: false, classes: "table-action", Cell: ActionColumn }
];

// Main component
const Tenants = () => {
  const { user } = useAuthContext(); // Get the auth token from context
  console.log("Auth Token:", user?.token);
  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.token) return;
  
    const fetchData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const response = await fetch("https://trial.maypasworkspace.com/api/system-admin/view-workspaces", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${user?.token}`
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log('Parsed response data:', result.data.data); // Ensure correct API response structure
  
        if (result && Array.isArray(result.data.data)) {
          setData(result.data.data); // Ensure data is an array
          // throw new Error("Invalid response format");
        } else {
          // setData(result.data.data); // Ensure data is an array
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user]);
  

  return (
    <>
      <PageTitle breadCrumbItems={[{ label: "Workspaces", path: "/account/admin", active: true }]} title="Workspaces" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <Button variant="danger" className="waves-effect waves-light" onClick={() => setShow(true)}>
                    <i className="mdi mdi-plus-circle me-1"></i> Add Workspace
                  </Button>
                </Col>
                <Col sm={8}>
                  <div className="text-sm-end mt-2 mt-sm-0">
                    <Button className="btn btn-success mb-2 me-1"><i className="mdi mdi-cog"></i></Button>
                    <Button className="btn btn-light mb-2 me-1">Import</Button>
                    <Button className="btn btn-light mb-2">Export</Button>
                  </div>
                </Col>
              </Row>

              {/* Display error or loading state */}
              {error ? (
                <p className="text-danger">Error: {error}</p>
              ) : loading ? (
                <p>Loading Workspaces...</p>
              ) : (
                <Table columns={columns} data={data} pageSize={12} isSortable pagination isSelectable tableClass="table-nowrap table-striped" />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add User Modal */}
      {/* <AddUser show={show} onHide={() => setShow(false)} onSubmit={() => setShow(false)} /> */}
      <WorkspaceRegistrationForm show={show} onHide={() => setShow(false)} onSubmit={() => setShow(false)} />
    </>
  );
};

export default Tenants;