import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";

import CurrencyRegistrationModal from "./CurrencyRegistration";
import TaxesRegistrationModal from "./TaxesRegistration";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { m } from "framer-motion";
import { useLogoColor } from "../../../context/LogoColorContext";
import { set } from "date-fns";

const Currency = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  const [show, setShow] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showTaxes, setShowTaxes] = useState(false);
  const [data, setData] = useState([]);
  const [taxData, setTaxData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTax, setLoadingTax] = useState(false);
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
    myCurrencyID: null,
  });

  const [taxDeletePopup, setTaxDeletePopup] = useState({
  isVisible: false,
  myTaxID: null,
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
    console.log("selected Location:", selectedLocation);
    try {
      const response = await fetch(
        // `${
        //   import.meta.env.VITE_BACKEND_URL
        // }/api/${tenantSlug}/settings/workspace/time/all?location_id=${locationId}&page=${page}&per_page=${pageSize}`
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/fetch/currency/location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.tenantToken}`,
          },
          body: JSON.stringify({ location_id: selectedLocation  }),
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

    const fetchTaxData = async ( page = 1, pageSize = 10) => {
    setLoadingTax(true);
    setError(null);
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        // `${
        //   import.meta.env.VITE_BACKEND_URL
        // }/api/${tenantSlug}/settings/workspace/time/all?location_id=${locationId}&page=${page}&per_page=${pageSize}`
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/taxes`,
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
      console.log("Tax data:", result);
  
      if (Array.isArray(result)) {
        // Sort the data by updated_at or created_at
        const sortedData = result.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setTaxData(sortedData);
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
      setLoadingTax(false);
    }
  };

  useEffect(() => {
    if (user?.tenantToken) {
      fetchLocations();
    }
  }, [user?.tenantToken]);

useEffect(() => {
  if (user?.tenantToken) {
    fetchLocations();
    fetchTaxData(); // Tax data is not location-dependent
  }
}, [user?.tenantToken]);

useEffect(() => {
  if (user?.tenantToken && selectedLocation) {
    fetchData(selectedLocation, pagination.currentPage, pagination.pageSize);
  }
  // eslint-disable-next-line
}, [user?.tenantToken, selectedLocation, pagination.currentPage, pagination.pageSize]);


 const handleEditClick = (myCurrency) => {
  setSelectedUser(myCurrency);
  setShowCurrency(true);
};

const handleTaxEditClick = (myTaxes) => {
  setSelectedUser(myTaxes);
  setShowTaxes(true);
};


  const handlePaystackClick = (myPaystack) => {
    
    setSelectedUser(myPaystack);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setShowPaystack(false);
    setShowTaxes(false);
    setShowCurrency(false);
    setSelectedUser(null);
    if (user?.tenantToken && selectedLocation) {
      fetchData(selectedLocation);
      // Reload users after closing the modal
    }
    setFormData({}); // Reset inputs after success

  };


  const handleDelete = async (myCurrencyID) => {
    if (!user?.tenantToken) return;
  
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/currencies/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myCurrencyID  }),
        }
      );
      const result = await response.json();
      console.log(result);
      if (!response.ok) throw new Error(result.message || "Failed to delete.");
  
      setPopup({
        message: "Currency detail deleted successfully!",
        type: "success",
        isVisible: true,
      });
  
      fetchData();
    } catch (error) {
      toast.error("Failed to delete this currency details!");
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


  const handleTaxDelete = async (myTaxID) => {
  if (!user?.tenantToken) return;

  setIsLoading(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/taxes/delete/${myTaxID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.tenantToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to delete.");

    setPopup({
      message: "Tax deleted successfully!",
      type: "success",
      isVisible: true,
    });

    fetchTaxData();
  } catch (error) {
    toast.error("Failed to delete this tax!");
    setPopup({
      message: "Failed to delete this tax!",
      type: "error",
      isVisible: true,
    });
  } finally {
    setIsLoading(false);
  }
};

const handleTaxDeleteButton = (myTaxID) => {
  setTaxDeletePopup({
    isVisible: true,
    myTaxID,
  });
};
const confirmTaxDelete = () => {
  handleTaxDelete(taxDeletePopup.myTaxID);
  setTaxDeletePopup({ isVisible: false, myTaxID: null });
};


  const handleDeleteButton = (myCurrencyID) => {
    setDeletePopup({
      isVisible: true,
      myCurrencyID
    });
  };
  
  const confirmDelete = () => {
    handleDelete(deletePopup.myCurrencyID);
    setDeletePopup({ isVisible: false, myCurrencyID: null });
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
      Header: "Currency Name",
      accessor: "name",
      sort: true,
    },
    {
      Header: "Currency Symbol",
      accessor: "symbol",
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

  const taxColumns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Tax Name",
      accessor: "name",
      sort: true,
    },
    {
      Header: "Tax Rate(%)",
      accessor: "percentage",
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
          onClick={() => handleTaxEditClick(row.original)}
        >
          <i className="mdi mdi-square-edit-outline"></i>
        </Link>
        <Link
          to="#"
          className="action-icon"
          onClick={() => handleTaxDeleteButton(row.original.id)}
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
          { label: "Cuurency", path: "/Settings/set-currency", active: true },
        ]}
        title="Currency & Taxes"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">

                     <Col className="mt-2">
                      <Button
                    variant="danger"
                    className="waves-effect waves-light"
                    onClick={() => {
                      setShowCurrency(true);
                      setSelectedUser(null);
                    }}
                                                                                  style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}

                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Set Your Currency                  </Button>
                  </Col>

                     {/* <Col className="mt-2">
                      <Button
                    variant="danger"
                    className="waves-effect waves-light"
                    onClick={() => {
                      setShowTaxes(true);
                      setSelectedUser(null);
                    }}
                                                                                  style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}

                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Set Taxes                  </Button>
                  </Col> */}

              </Row>

              <Card>
                <Card.Body
                  style={{
                    background: secondary,
                    marginTop: "30px",
                  }}
                >
                  

                <>

                   {loadingLocations ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>{" "}
                      Loading your locations...
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom: "10px", fontSize: "1rem" }}>
                        Select which location you want to view or update currency details.
                      </p>
                      <Form.Select
                        style={{ marginBottom: "25px", fontSize: "1rem" }}
                        value={selectedLocation || ""}
                        onChange={handleLocationChange} // Use the new handler
                        required
                      >
                        <option value="" disabled>
                          Select a location
                        </option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} at {location.state}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  )}
                  {selectedLocation && (
                    <>
                      {error ? (
                        <p className="text-danger">Error: {error}</p>
                      ) : loading ? (
                        <p>Loading your currencies details...</p>
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
                          paginationProps={{
                            currentPage: pagination.currentPage,
                            totalPages: pagination.totalPages,
                            onPageChange: (page) =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: page,
                              })),
                            onPageSizeChange: (pageSize) =>
                              setPagination((prev) => ({ ...prev, pageSize })),
                          }}
                        />
                      )}

                     
                    </>
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
               <Card>
                  <Row className="mb-2">

                     {/* <Col className="mt-2">
                      <Button
                    variant="danger"
                    className="waves-effect waves-light"
                    onClick={() => {
                      setShowCurrency(true);
                      setSelectedUser(null);
                    }}
                                                                                  style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}

                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Set Your Currency                  </Button>
                  </Col> */}

                     <Col className="mt-2">
                      <Button
                    variant="danger"
                    className="waves-effect waves-light"
                    onClick={() => {
                      setShowTaxes(true);
                      setSelectedUser(null);
                    }}
                                                                                  style={{ backgroundColor: primary, borderColor: primary, color: "#fff" }}

                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a Tax                  </Button>
                  </Col>

              </Row>
                <Card.Body
                  style={{
                    background: secondary,
                    marginTop: "30px",
                  }}
                >
                  

                <>

                  {error ? (
                    <p className="text-danger">Error: {error}</p>
                  ) : loadingTax ? (
                    <p>Loading your Taxes...</p>
                  ) : isLoading ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Deleting...</span>
                      </Spinner>{" "}
                      Deleting...
                    </div>
                  ) : (
                    <Table2
                      columns={taxColumns}
                      data={taxData}
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



<CurrencyRegistrationModal
  showCurrency={showCurrency}
  onHide={handleClose}
  myCurrency={selectedUser}
  onSubmit={() => fetchData(selectedLocation)}
/>

<TaxesRegistrationModal
  showTaxes={showTaxes}
  onHide={handleClose}
  myTaxes={selectedUser}
  onSubmit={() => fetchData(selectedLocation)}
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
          message="Are you sure you want to delete this currency details?"
          type="confirm"
          onClose={() =>
            setDeletePopup({ isVisible: false, myCurrencyID: null })
          }
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}

      {taxDeletePopup.isVisible && (
  <Popup
    message="Are you sure you want to delete this tax?"
    type="confirm"
    onClose={() =>
      setTaxDeletePopup({ isVisible: false, myTaxID: null })
    }
    buttonLabel="Yes"
    onAction={confirmTaxDelete}
  />
)}

    </>
  );
};

export default Currency;
