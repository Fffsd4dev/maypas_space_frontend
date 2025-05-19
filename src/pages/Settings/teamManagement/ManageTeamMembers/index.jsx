import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../../components/PageTitle";
import MemberRegistrationModal from "./MemberRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../../components/Popup/Popup";
import Table2 from "../../../../components/Table2";
import { color } from "framer-motion";

const Members = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
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
  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    myMemberID: null,
  });

  const [promotePopup, setPromotePopup] = useState({
    isVisible: false,
    myMemberID: null,
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

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/teams`,
        {
          headers: { Authorization: `Bearer ${user.tenantToken}` },
        }
      );
      const result = await response.json();
      if (response.ok) {
        if (result && Array.isArray(result[1])) {
        console.log("Teams:", result);
        setTeams(result[1] || []);
        }  else {
          throw new Error("Invalid response format");
        }
      } else {
        throw new Error(result.message || "Failed to fetch teams.");
      }
    } catch (error) {
      setErrorMessage(error.message);
      setIsError(true);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchData = async (teamId, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    console.log("User Token:", user?.tenantToken);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/${tenantSlug}/team/members/${teamId}?page=${page}&per_page=${pageSize}`,
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
      console.log("Members:", result);
     
      if (result && Array.isArray(result.data)) {
        const data = result.data;
        data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(data);
        // setPagination({
        //   currentPage: result.data.current_page,
        //   totalPages: result.data.last_page,
        //   nextPageUrl: result.data.next_page_url,
        //   prevPageUrl: result.data.prev_page_url,
        //   pageSize: pageSize,
        // });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenantToken) {
      fetchTeams();
    }
  }, [user?.tenantToken]);

  useEffect(() => {
    if (user?.tenantToken && selectedTeam) {
      fetchData(selectedTeam, pagination.currentPage, pagination.pageSize);
    }
  }, [user?.tenantToken, selectedTeam, pagination.currentPage, pagination.pageSize]);

  const handleEditClick = (myMember) => {
    setSelectedUser(myMember);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    if (user?.tenantToken && selectedTeam) {
      fetchData(selectedTeam, pagination.currentPage, pagination.pageSize); // Reload users after closing the modal
    }
    setFormData({}); // Reset inputs after success
  };

  const handlePromoteMember = async (teamId, myMemberID) => {
    if (!user?.tenantToken) return;
    console.log(myMemberID);

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/promote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myMemberID, team_id: teamId }),
        }
      );
      console.log("body", { id: myMemberID, team_id: teamId });

      console.log("Promote Response:", response);
    
      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((myMember) => myMember.id !== myMemberID)
      );
      setPopup({
        message: "This team member is now the team manager!",
        type: "success",
        isVisible: true,
      });
      if (user?.tenantToken && selectedTeam) {
        fetchData(
          selectedTeam,
          pagination.currentPage,
          pagination.pageSize
        ); // Reload users after deleting a user
      }
    } catch (error) {
      console.error("Error promoting member:", error);
      setPopup({
        message: "Failed to make this member the team manager!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (teamId, myMemberID) => {
    if (!user?.tenantToken) return;
    console.log(myMemberID);

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/member/delete/${teamId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: myMemberID }),
        }
      );

      console.log("Delete Response:", response);
    
      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((myMember) => myMember.id !== myMemberID)
      );
      setPopup({
        message: "Member deleted successfully!",
        type: "success",
        isVisible: true,
      });
      if (user?.tenantToken && selectedTeam) {
        fetchData(
          selectedTeam,
          pagination.currentPage,
          pagination.pageSize
        ); // Reload users after deleting a user
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      setPopup({
        message: "Failed to delete member!",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMemberButton = (selectedTeam, myMemberID) => {
    setDeletePopup({
      isVisible: true,
      selectedTeam,
      myMemberID,
    });
  };
  
  const handlePromoteMemberButton = (selectedTeam, myMemberID) => {
    setPromotePopup({
      isVisible: true,
      selectedTeam,
      myMemberID,
    });
  };

  const confirmPromoteMember = () => {
    const { myMemberID } = promotePopup;
    handlePromoteMember(selectedTeam, myMemberID);
    setPromotePopup({ isVisible: false, myMemberID: null });
  };

  const confirmDeleteMember = () => {
    const { myMemberID } = deletePopup;
    handleDeleteMember(selectedTeam, myMemberID);
    setDeletePopup({ isVisible: false, myMemberID: null });
  };

  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
    setFormData((prev) => ({
      ...prev,
      team_id: teamId, // Update formData with the selected location ID
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
      Header: "First Name",
      accessor: "user.first_name",
      sort: true,
    },
    {
      Header: "Last Name",
      accessor: "user.last_name",
      sort: true,
    },
    {
      Header: "Is the Manager?",
      accessor: "manager",
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
          {row.original.manager === "no" && ( // Only show the button if Manager is "no"
            <Button
              variant="danger"
              className="waves-effect waves-light"
              onClick={() => handlePromoteMemberButton(selectedTeam, row.original.user_id)}
            >
              Make Team Manager
            </Button>
          )}
  
          <Link
            to="#"
            className="action-icon"
            onClick={() => handleDeleteMemberButton(selectedTeam, row.original.user_id)}
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
          { label: "Team Members/Sections", path: "/location/floor", active: true },
        ]}
        title="Team Members"
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
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add a Member to a Team
                  </Button>
                </Col>
              </Row>

              <Card>
                <Card.Body style={{ background: "linear-gradient(to left,rgb(243, 233, 231),rgb(239, 234, 230))", marginTop: "30px" }}>
                  {loadingTeams ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>{" "}
                      Loading the members in the team...
                    </div>
                  ) : (
                    <div>
                      <p style={{marginBottom: "10px", fontSize: "1rem" }}>Select the team to view or update the members.</p>
                      <Form.Select
                        style={{ marginBottom: "25px", fontSize: "1rem" }}
                        value={selectedTeam || ""}
                        onChange={handleTeamChange} // Use the new handler
                        required
                      >
                        <option value="" disabled>
                          Select team
                        </option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.company} 
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  )}
                
                 {selectedTeam && (
                <>
                  {error ? (
                    <p className="text-danger">Error: {error}</p>
                  ) : loading ? (
                    <p>Loading members...</p>
                  ) : isLoading ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">loading...</span>
                      </Spinner>{" "}
                      please wait...
                    </div>
                  ) : (
                    <Table2
                    columns={columns}
                    data={data}
                    pageSize={pagination.pageSize}
                    isSortable
                    pagination
                    isSearchable
                    tableClass="table-striped dt-responsive nowrap w-100"
                    searchBoxClass="my-2"
                    getRowProps={(row) => ({
                      style: {
                        backgroundColor:
                          row.original.manager?.toString().toLowerCase() === "yes" ? "#E8F5E9" : "inherit",
                      },
                    })}
                      // paginationProps={{
                      //   currentPage: pagination.currentPage,
                      //   totalPages: pagination.totalPages,
                      //   onPageChange: (page) =>
                      //     setPagination((prev) => ({
                      //       ...prev,
                      //       currentPage: page,
                      //     })),
                      //   onPageSizeChange: (pageSize) =>
                      //     setPagination((prev) => ({ ...prev, pageSize })),
                      // }}
                    />
                  )}
                </>
              )}
                </Card.Body>
              </Card>

             
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <MemberRegistrationModal
        show={show}
        onHide={handleClose}
        myTeam={selectedUser}
        onSubmit={() =>
          fetchData(
            selectedTeam,
            pagination.currentPage,
            pagination.pageSize
          )
        } // Reload users after adding or editing a user
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
          message="Are you sure you want to delete this member?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, myMemberID: null })}
          buttonLabel="Yes"
          onAction={confirmDeleteMember}
        />
      )}


{promotePopup.isVisible && (
        <Popup
          message="Are you sure you want to make this member the team manager?"
          type="confirm"
          onClose={() => setPromotePopup({ isVisible: false, myMemberID: null })}
          buttonLabel="Yes"
          onAction={confirmPromoteMember}
        />
      )}
    </>
  );
};

export default Members;
