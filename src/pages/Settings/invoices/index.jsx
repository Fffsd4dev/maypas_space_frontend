import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form, Tooltip, OverlayTrigger } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import InvoicesModal from "./InvoicesForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../components/Popup/Popup";
import Table2 from "../../../components/Table2";
import { toast } from "react-toastify";
import { m } from "framer-motion";
import { useLogoColor } from "../../../context/LogoColorContext";

const Invoices = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();
const [currencySymbols, setCurrencySymbols] = useState({});

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
  const [closeInvoicePopup, setCloseInvoicePopup] = useState({
    isVisible: false,
    myInvoiceID: null,
    myInvoiceRef: null,
  });
  const [isError, setIsError] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [formData, setFormData] = useState({
    location_id: "",
    bank_name: "",
    account_number: "",
    account_name: "",
  });

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    spotID: null,
  });

  const sizePerPageList = [
    {
      text: "5",
      value: 5,
    },
    {
      text: "10",
      value: 10,
    },
    {
      text: "15",
      value: 15,
    },
    {
      text: "25",
      value: 25,
    },
    {
      text: "All",
      value: data.length,
    },
  ];

  // const [pagination, setPagination] = useState({
  //   currentPage: 1,
  //   totalPages: 1,
  //   nextPageUrl: null,
  //   prevPageUrl: null,
  //   pageSize: 10,
  // });

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

  const [rowLoading, setRowLoading] = useState(null); // State for row loading

  const handleRowClick = async (id, event) => {
    // Prevent row click if the event target is an action icon
    if (
      event.target.closest(".action-icon") ||
      event.target.closest(".waves-effect.waves-light")
    )
      return;

    setRowLoading(id); // Set the row loading state
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/invoice/show/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Fetched invoice details:", result);
      // setSelectedLocation(result.data.bank.location_id);

      const newWindow = window.open(`/invoice-details/${id}`, "_blank");
      if (newWindow) {
        newWindow.onload = () => {
          newWindow.invoice = result.data;
        };
      } else {
        console.error(
          "Failed to open new window. It might be blocked by the browser."
        );
      }
    } catch (error) {
      console.error("Error fetching Subscription Plan details:", error);
    } finally {
      setRowLoading(null); // Reset the row loading state
    }
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        // `${
        //   import.meta.env.VITE_BACKEND_URL
        // }/api/${tenantSlug}/settings/workspace/time/all?location_id=${locationId}&page=${page}&per_page=${pageSize}`
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/invoices/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      if (Array.isArray(result.invoices)) {
        // Sort the data by space_payment[0].created_at or created_at
        const sortedData = result.invoices.sort(
          (a, b) =>
            new Date(b.space_payment[0].created_at || b.created_at) -
            new Date(a.space_payment[0].created_at || a.created_at)
        );
        setData(sortedData);
        console.log("Sorted Data:", sortedData);
        

        // Update pagination state (if needed)
        // setPagination((prev) => ({
        //   ...prev,
        //   currentPage: page,
        //   totalPages: Math.ceil(result.length / pageSize),
        // }));
      } else {
        throw new Error(result?.message || "Invalid response format");
      }
    } catch (error) {
      console.error(error);
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

  const handleEditClick = (myInvoice) => {
    setSelectedUser(myInvoice);

    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    if (user?.tenantToken && selectedLocation) {
      fetchData();
      // Reload users after closing the modal
    }
    setFormData({}); // Reset inputs after success
  };

  const handleCloseInvoice = async (myInvoiceID, myInvoiceRef) => {
    if (!user?.tenantToken) return;
    console.log(myInvoiceID);

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/invoice/close`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoice_ref: myInvoiceRef }),
        }
      );
      console.log("body", { invoice_ref: myInvoiceRef });

      console.log("Promote Response:", response);

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      setData((prevData) =>
        prevData.filter((myInvoice) => myInvoice.id !== myInvoiceID)
      );
      setPopup({
        message: "This invoice has been marked as complete!",
        type: "success",
        isVisible: true,
      });
      if (user?.tenantToken) {
        fetchData(); // Reload users after deleting a user
      }
    } catch (error) {
      console.error("Error promoting member:", error);
      setPopup({
        message: "Failed to mark this invoice as complete!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (spotID) => {
    if (!user?.tenantToken) return;

    setIsLoading(true);
    try {
                console.log("body", { book_spot_id: spotID });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/spot/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ book_spot_id: spotID }),
        }
      );
      const result = await response.json();
      console.log(result);
      if (!response.ok) throw new Error(result.message || "Failed to delete.");

      setPopup({
        message: "Booking canceled successfully!",
        type: "success",
        isVisible: true,
      });

      fetchData();
    } catch (error) {
      toast.error("Failed to cancel this booking!");
      console.error("Error cancelling this booking:", error);
      setPopup({
        message: "Failed to cancel this booking!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteButton = (spotID) => {
    setDeletePopup({
      isVisible: true,
      spotID,
    });
  };

  const handleCloseInvoiceButton = (myInvoiceID, myInvoiceRef) => {
    setCloseInvoicePopup({
      isVisible: true,

      myInvoiceID,
      myInvoiceRef,
    });
  };

  const confirmCloseInvoice = () => {
    const { myInvoiceID, myInvoiceRef } = closeInvoicePopup;
    handleCloseInvoice(myInvoiceID, myInvoiceRef);
    setCloseInvoicePopup({
      isVisible: false,
      myInvoiceID: null,
      myInvoiceRef: null,
    });
  };

  const confirmDelete = () => {
    const { spotID } = deletePopup;
    handleDelete(spotID);
    setDeletePopup({ isVisible: false, spotID: null });
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

 const fetchCurrencySymbolForLocation = async (locationId) => {
  if (!locationId) return "$";
  if (currencySymbols[locationId]) return currencySymbols[locationId];

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/fetch/currency/location`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.tenantToken}`,
        },
        body: JSON.stringify({ location_id: locationId }),
      }
    );
    const result = await response.json();
    const symbol = Array.isArray(result.data) && result.data.length > 0
      ? result.data[0].symbol || "$"
      : "$";
    setCurrencySymbols((prev) => ({ ...prev, [locationId]: symbol }));
    return symbol;
  } catch (err) {
    setCurrencySymbols((prev) => ({ ...prev, [locationId]: "$" }));
    return "$";
  }
};

   useEffect(() => {
  if (data.length > 0) {
    const uniqueLocationIds = [...new Set(data.map(row => row.location_id))];
    uniqueLocationIds.forEach((locationId) => {
      if (!currencySymbols[locationId]) {
        fetchCurrencySymbolForLocation(locationId);
      }
    });
  }
  // eslint-disable-next-line
}, [data]);

  const columns = [
    {
      Header: "S/N",
      accessor: (row, i) => i + 1,
      id: "serialNo",
      sort: false,
    },
    {
      Header: "Invoice Ref",
      accessor: "invoice_ref",
      sort: true,
    },
    // {
    //   Header: "User",
    //   accessor: "user.last_name",
    //   sort: true,
    // },

   {
  Header: "Amount",
  accessor: (row) => {
    const symbol = currencySymbols[row.location_id] || "$";
    return `${symbol} ${row.space_payment[0].amount}`;
  },
  sort: true,
},
    {
      Header: "Status",
      accessor: "space_payment[0].payment_status",
      sort: true,
    },

    {
      Header: "Created On",
      accessor: "space_payment[0].created_at",
      sort: true,
      Cell: ({ row }) =>
        formatDateTime(row.original.space_payment[0].created_at),
    },
    {
      Header: "Action",
      accessor: "action",
      sort: false,
      Cell: ({ row }) => (
        <>
          {row.original.space_payment[0].payment_status === "pending" && (
             <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`tooltip-delete-${row.original.id}`}> Mark as Complete </Tooltip>}
          >
            <Button
              variant="danger"
              className="waves-effect waves-light"
              onClick={() =>
                handleCloseInvoiceButton(
                  row.original.id,
                  row.original.invoice_ref
                )
              }
               style={{
               backgroundColor: "#fff",
                borderColor: primary,
                color: primary,
                gap: "12px",
              }}
             
            >

             <i className="fas fa-check"></i> Complete
            </Button>
            </OverlayTrigger> 
          )}
{"   "}
        {row.original.space_payment[0].payment_status !== "completed" &&
        row.original.space_payment[0].payment_status !== "cancelled" && (
           <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`tooltip-delete-${row.original.book_spot_id}`}> Cancel Booking</Tooltip>}
          >
          <Button
          variant="danger"
              className="waves-effect waves-light"
            to="#"
             style={{
                backgroundColor: primary,
                borderColor: primary,
                color: "#fff",
              }}
            onClick={() =>
              handleDeleteButton(row.original.book_spot_id)
            }
          >
            <i className="fas fa-times"></i> Cancel      </Button>
           </OverlayTrigger>
        )}
        </>
      ),
    },
  ];
  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Invoices", path: "/Settings/invoices", active: true },
        ]}
        title="Invoices"
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-2">
                <Col sm={4}></Col>
              </Row>

              <Card>
                <Card.Body
                  style={{
                    background:
                      secondary,
                    marginTop: "30px",
                  }}
                >
                  <>
                    {error ? (
                      <p className="text-danger">Error: {error}</p>
                    ) : loading ? (
                      <p>Loading your invoices...</p>
                    ) : isLoading ? (
                      <div className="text-center">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">
                            Closing Invoice...
                          </span>
                        </Spinner>{" "}
                        Closing Invoice...
                      </div>
                    ) : (
                      <Table2
                        columns={columns}
                        data={data}
                        pageSize={5}
                        pagination
                        isSortable
                        isSearchable
                        sizePerPageList={sizePerPageList}
                        tableClass="table-striped dt-responsive nowrap w-100"
                        searchBoxClass="my-2"
                        getRowProps={(row) => ({
                          style: {
                            cursor: "pointer",
                              backgroundColor:
                              row.original.space_payment[0].payment_status
                                ?.toString()
                                .toLowerCase() === "completed"
                                ? secondary
                                : "inherit",
                                
                            opacity: rowLoading === row.original.id ? 0.4 : 1, // visually indicate loading

                            transition: "opacity 0.3s ease",
                            position: "relative",
                            display:
                              rowLoading === row.original.id
                                ? "hidden"
                                : "table-row",
                          },
                          onClick: (event) =>
                            handleRowClick(row.original.id, event),
                        })}
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
                        rowLoading={rowLoading}
                      />
                    )}
                  </>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <InvoicesModal
        show={show}
        onHide={handleClose}
        myInvoice={selectedUser} // Pass the selected user data
        onSubmit={() => fetchData()}
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
          message="Are you sure you want to cancel this booking?"
          type="confirm"
          onClose={() =>
            setDeletePopup({ isVisible: false, spotID: null })
          }
          buttonLabel="Yes"
          onAction={confirmDelete}
        />
      )}

      {closeInvoicePopup.isVisible && (
        <Popup
          message="Are you sure you want to mark this invoice as complete?"
          type="confirm"
          onClose={() =>
            setCloseInvoicePopup({ isVisible: false, myInvoiceID: null })
          }
          buttonLabel="Yes"
          onAction={confirmCloseInvoice}
        />
      )}
    </>
  );
};

export default Invoices;
