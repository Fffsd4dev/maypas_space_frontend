import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import AccountRegistrationModal from "./AccountRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { m } from "framer-motion";
import { useLogoColor } from "../../../context/LogoColorContext";

const BankAccount = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary } = useLogoColor();

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
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
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [formData, setFormData] = useState({

    location_id: "",
    bank_name: "",
    account_number: "",
    account_name: "" 
});


  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    myBankAccountID: null,
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
        console.log("Location:", result.data.data);
        setLocations(result.data.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch locations.");
      }
    } catch (error) {
      toast.error(error.message);
      setIsError(true);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchData = async ( page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        // `${
        //   import.meta.env.VITE_BACKEND_URL
        // }/api/${tenantSlug}/settings/workspace/time/all?location_id=${locationId}&page=${page}&per_page=${pageSize}`
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/banks`,
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
      fetchLocations();
    }
  }, [user?.tenantToken]);

  useEffect(() => {
    if (user?.tenantToken) {
        //fetchData(selectedLocation, pagination.currentPage, pagination.pageSize);
        fetchData();
    }
  }, [user?.tenantToken]);

  const handleEditClick = (myBankAccount) => {  
    setSelectedUser(myBankAccount);
  
    setShow(true);
  };
  
  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    if (user?.tenantToken && selectedLocation) {
      fetchData(selectedLocation);
      // Reload users after closing the modal
    }
    setFormData({}); // Reset inputs after success

  };


  const handleDelete = async (myBankAccountID) => {
    if (!user?.tenantToken) return;
  
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/bank/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myBankAccountID  }),
        }
      );
      const result = await response.json();
      console.log(result);
      if (!response.ok) throw new Error(result.message || "Failed to delete.");
  
      setPopup({
        message: "Bank detail deleted successfully!",
        type: "success",
        isVisible: true,
      });
  
      fetchData();
    } catch (error) {
      toast.error("Failed to delete this bank details!");
      console.error("Error deleting bank details:", error);
      setPopup({
        message: "Failed to this bank details!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  



  const handleDeleteButton = (myBankAccountID) => {
    setDeletePopup({
      isVisible: true,
      myBankAccountID
    });
  };
  
  const confirmDelete = () => {
    handleDelete(deletePopup.myBankAccountID);
    setDeletePopup({ isVisible: false, myBankAccountID: null });
  };
  
  const formatTime = (time) => {
    if (!time) return ""; // Handle empty or undefined time
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 24-hour to 12-hour format
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };
 

  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    setFormData((prev) => ({
      ...prev,
      location_id: locationId, // Update formData with the selected location ID
    }));
  };
  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Bank Name",
      accessor: "bank_name",
      sort: true,
    },
    {
      Header: "Account Number",
      accessor: "account_number",
      sort: true,
    },
    {
      Header: "Account Name",
      accessor: "account_name",
      sort: true,
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
          <Link
            to="#"
            className="action-icon"
            onClick={() => handleDeleteButton(row.original.id)}
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </>
      ),
    },
  ];
  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Bank Account", path: "/Settings/set-account", active: true },
        ]}
        title="Bank Account"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}>
                  <Button
                    variant="danger"
                    className="waves-effect waves-light"
                    onClick={() => {
                      setShow(true);
                      setSelectedUser(null);
                    }}
                                                                                  style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}

                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add Your Bank Account
                  </Button>
                </Col>
              </Row>

              <Card>
                <Card.Body
                  style={{
                    background:
                      "linear-gradient(to left,rgb(243, 233, 231),rgb(239, 234, 230))",
                    marginTop: "30px",
                  }}
                >
                  

                <>

                  {error ? (
                    <p className="text-danger">Error: {error}</p>
                  ) : loading ? (
                    <p>Loading your bank details...</p>
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

{/* <Row className="mt-3">
  <Col>
  <Button
  variant="primary"
  disabled={!selectedLocation}
  onClick={() => handleEditClick(selectedLocation)}
>
  Edit Working Hours
</Button>{" "}
    <Button
      variant="danger"
      disabled={!selectedLocation}
      onClick={() => handleDeleteButton(selectedLocation)}
    >
      Delete Working Hours
    </Button>
  </Col>
</Row> */}

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
  myBankAccount={selectedUser} // Pass the selected user data
  onSubmit={() =>
    fetchData(selectedLocation)
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

      {deletePopup.isVisible && (
        <Popup
          message="Are you sure you want to delete this bank details?"
          type="confirm"
          onClose={() =>
            setDeletePopup({ isVisible: false, myBankAccountID: null })
          }
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}
    </>
  );
};

export default BankAccount;
