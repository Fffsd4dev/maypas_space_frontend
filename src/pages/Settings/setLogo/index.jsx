import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import AccountRegistrationModal from "./LogoAndColorRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { useLogoColor } from "../../../context/LogoColorContext.jsx";

const LogoColor = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const [isError, setIsError] = useState(false);

  const [formData, setFormData] = useState({

    logo: "",
    colour: "",
});


  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
    pageSize: 10,
  });

  const formatDateTime = (isoString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(isoString).toLocaleDateString("en-US", options);
  };




  const fetchData = async ( page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/view-details`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log(result);
  
      if (Array.isArray(result.data)) {
        // Sort the data by updated_at or created_at
        const sortedData = result.data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(sortedData);
        console.log("Sorted Data:", sortedData);
  
        // Update pagination state (if needed)
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalPages: Math.ceil(result.length / pageSize),
        }));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (user?.tenantToken) {
        fetchData();
    }
  }, [user?.tenantToken]);

    const primary = data[0]?.colour || "#fe0002";
  const { colour: primaryColor } = useLogoColor();

  function hexToRgba(hex, alpha = 0.08) {
  let c = hex ? hex.replace("#", "") : "fe0002";
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const secondary = hexToRgba(data[0]?.colour || "#fe0002", 0.08)


  const handleEditClick = (myLogo) => {  
    setSelectedUser(myLogo);
  
    setShow(true);
  };
  
  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    if (user?.tenantToken) {
      fetchData();
      // Reload users after closing the modal
    }
    setFormData({}); // Reset inputs after success

  };


 




  

  
  const formatTime = (time) => {
    if (!time) return ""; // Handle empty or undefined time
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 24-hour to 12-hour format
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };
 


const columns = [
  {
    Header: "S/N",
    accessor: (row, i) => i + 1,
    id: "serialNo",
    sort: false,
  },
  {
    Header: "Logo",
    accessor: "logo",
    sort: true,
    Cell: ({ value }) =>
      value ? (
        <img
          src={`${
          import.meta.env.VITE_BACKEND_URL
        }/storage/uploads/tenant_logo/${value}`}
          alt="Logo"
          style={{
            maxWidth: 60,
            maxHeight: 60,
            borderRadius: 25,
            border: "1px solid #ccc",
            objectFit: "contain",
            background: "#fff",
          }}
        />
      ) : (
        <span>No Logo</span>
      ),
  },
  {
    Header: "Colour",
    accessor: "colour",
    sort: true,
    Cell: ({ value }) =>
      value ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: value,
              border: "2px solid #ccc",
            }}
            title={value}
          />
          <span>{value}</span>
        </div>
      ) : (
        <span>No Color</span>
      ),
  },
  {
    Header: "Updated On",
    accessor: "updated_at",
    sort: true,
    Cell: ({ row }) => formatDateTime(row.original.updated_at),
  },
  {
    Header: "Action",
    accessor: "action",
    sort: false,
    Cell: ({ row }) => (
      <>
        <Link
          to="#"
          className="action-icon"
          onClick={() => handleEditClick(row.original)}
        >
          <i className="mdi mdi-square-edit-outline"></i>
        </Link>
      </>
    ),
  },
];
  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Company's Logo and Color", path: "/Settings/set-logo-and-color", active: true },
        ]}
        title="Company's Logo and Color"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <Button
                    style={{ background: primaryColor, borderColor: primaryColor, color: "#fff" }}
                    className="waves-effect waves-light"
                    onClick={() => {
                      setShow(true);
                      setSelectedUser(null);
                    }}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add Your Company's Logo & Color
                  </Button>
                </Col>
              </Row>

              <Card>
                <Card.Body
                  style={{
                    background: secondary,
                    marginTop: "30px",
                  }}
                >
                  

                <>

                  {error ? (
                    <p className="text-danger">Error: {error}</p>
                  ) : loading ? (
                    <p>Loading your Company's Logo and Color...</p>
                  ) : isLoading ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Deleting...</span>
                      </Spinner>{" "}
                      Deleting...
                    </div>
                  ) : (
                    <Table2
                      columns={columns}
                      data={data}
                      pageSize={pagination.pageSize}
                      isSortable
                      isSearchable
                      tableClass="table-striped dt-responsive nowrap w-100"
                      searchBoxClass="my-2"
                    //   paginationProps={{
                    //     currentPage: pagination.currentPage,
                    //     totalPages: pagination.totalPages,
                    //     onPageChange: (page) =>
                    //       setPagination((prev) => ({
                    //         ...prev,
                    //         currentPage: page,
                    //       })),
                    //     onPageSizeChange: (pageSize) =>
                    //       setPagination((prev) => ({ ...prev, pageSize })),
                    //   }}
                    />
                  )}


                  </>
              

                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AccountRegistrationModal
  show={show}
  onHide={handleClose}
  myLogo={selectedUser} // Pass the selected user data
    onSubmit={() =>
    fetchData()
  }

/>

      {popup.isVisible && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ ...popup, isVisible: false })}
          buttonLabel={popup.buttonLabel}
          buttonRoute={popup.buttonRoute}
        />
      )}

  
    </>
  );
};

export default LogoColor;
