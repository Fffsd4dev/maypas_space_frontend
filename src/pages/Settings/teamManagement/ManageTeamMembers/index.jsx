import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../../components/PageTitle";
import MemberRegistrationModal from "./MemberRegistrationForm";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import Popup from "../../../../components/Popup/Popup";
import Table2 from "../../../../components/Table2";
import { useLogoColor } from "../../../../context/LogoColorContext";
import { toast } from "react-toastify";

const Members = () => {
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlug = user?.tenant;
  const { colour: primary, secondaryColor: secondary } = useLogoColor();

  // Refs to prevent duplicate calls
  const isMounted = useRef(true);
  const isFetching = useRef(false);
  const isFetchingTeams = useRef(false);

  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  const [deletePopup, setDeletePopup] = useState({
    isVisible: false,
    memberId: null,
    teamId: null,
  });

  const [promotePopup, setPromotePopup] = useState({
    isVisible: false,
    memberId: null,
    teamId: null,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    nextPageUrl: null,
    prevPageUrl: null,
    pageSize: 10,
  });

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const formatDateTime = useCallback((isoString) => {
    if (!isoString) return "";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(isoString).toLocaleDateString("en-US", options);
  }, []);

  const fetchTeams = useCallback(async () => {
    if (isFetchingTeams.current || !tenantToken || !tenantSlug) return;
    
    isFetchingTeams.current = true;
    setLoadingTeams(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/teams`,
        {
          headers: { Authorization: `Bearer ${tenantToken}` },
        }
      );
      const result = await response.json();
      
      if (isMounted.current && response.ok) {
        // Handle the response format - assuming result[1] contains the data array
        const teamsData = Array.isArray(result[1]) ? result[1] : [];
        setTeams(teamsData);
      } else if (isMounted.current) {
        throw new Error(result.message || "Failed to fetch teams.");
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoadingTeams(false);
      }
      isFetchingTeams.current = false;
    }
  }, [tenantToken, tenantSlug]);

  const fetchData = useCallback(async (teamId, page = 1, pageSize = 10) => {
    if (isFetching.current || !tenantToken || !tenantSlug || !teamId) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/members/${teamId}?page=${page}&per_page=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (isMounted.current && result && Array.isArray(result.data)) {
        const sortedData = [...result.data].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setData(sortedData);
        
        // Update pagination if available
        if (result.pagination) {
          setPagination({
            currentPage: result.pagination.current_page || 1,
            totalPages: result.pagination.last_page || 1,
            nextPageUrl: result.pagination.next_page_url || null,
            prevPageUrl: result.pagination.prev_page_url || null,
            pageSize: pageSize,
          });
        }
      } else if (isMounted.current) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (isMounted.current) {
        setError(error.message);
        toast.error(error.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [tenantToken, tenantSlug]);

  // Fetch teams on mount
  useEffect(() => {
    if (tenantToken && tenantSlug) {
      fetchTeams();
    }
  }, [tenantToken, tenantSlug, fetchTeams]);

  // Fetch members when team or pagination changes
  useEffect(() => {
    if (tenantToken && tenantSlug && selectedTeam) {
      fetchData(selectedTeam, pagination.currentPage, pagination.pageSize);
    }
  }, [tenantToken, tenantSlug, selectedTeam, pagination.currentPage, pagination.pageSize, fetchData]);

  const handleEditClick = useCallback((member) => {
    setSelectedMember(member);
    setShow(true);
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
    setSelectedMember(null);
    // Don't fetch here - let useEffect handle it
  }, []);

  const handlePromoteMember = useCallback(async (teamId, memberId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/promote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: memberId, team_id: teamId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setPopup({
        message: "This team member is now the team manager!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
      
      // Refresh data
      if (selectedTeam) {
        fetchData(selectedTeam, pagination.currentPage, pagination.pageSize);
      }
    } catch (error) {
      console.error("Error promoting member:", error);
      setPopup({
        message: "Failed to make this member the team manager!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, selectedTeam, fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDeleteMember = useCallback(async (teamId, memberId) => {
    if (!tenantToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/team/member/delete/${teamId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: memberId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Contact Support! HTTP error! Status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.filter((member) => member.user_id !== memberId)
      );
      
      setPopup({
        message: "Member deleted successfully!",
        type: "success",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
      
      // Refresh data
      if (selectedTeam) {
        fetchData(selectedTeam, pagination.currentPage, pagination.pageSize);
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      setPopup({
        message: "Failed to delete member!",
        type: "error",
        isVisible: true,
        buttonLabel: "",
        buttonRoute: "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantToken, tenantSlug, selectedTeam, fetchData, pagination.currentPage, pagination.pageSize]);

  const handleDeleteButton = useCallback((teamId, memberId) => {
    setDeletePopup({
      isVisible: true,
      memberId,
      teamId,
    });
  }, []);

  const handlePromoteButton = useCallback((teamId, memberId) => {
    setPromotePopup({
      isVisible: true,
      memberId,
      teamId,
    });
  }, []);

  const confirmPromote = useCallback(() => {
    const { memberId, teamId } = promotePopup;
    handlePromoteMember(teamId, memberId);
    setPromotePopup({ isVisible: false, memberId: null, teamId: null });
  }, [promotePopup, handlePromoteMember]);

  const confirmDelete = useCallback(() => {
    const { memberId, teamId } = deletePopup;
    handleDeleteMember(teamId, memberId);
    setDeletePopup({ isVisible: false, memberId: null, teamId: null });
  }, [deletePopup, handleDeleteMember]);

  const handleTeamChange = useCallback((e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
    // Reset to first page when team changes
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const handleRefresh = useCallback(() => {
    if (selectedTeam) {
      fetchData(selectedTeam, pagination.currentPage, pagination.pageSize);
    }
  }, [selectedTeam, fetchData, pagination.currentPage, pagination.pageSize]);

  // Memoized columns
  const columns = useMemo(() => [
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
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Last Name",
      accessor: "user.last_name",
      sort: true,
      Cell: ({ value }) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "",
    },
    {
      Header: "Email",
      accessor: "user.email",
      sort: true,
      Cell: ({ value }) => value || "",
    },
    {
      Header: "Is Manager?",
      accessor: "manager",
      sort: true,
      Cell: ({ value }) => (
        <span style={{ 
          color: value === "yes" ? "#28a745" : "#6c757d",
          fontWeight: value === "yes" ? "bold" : "normal"
        }}>
          {value === "yes" ? "Yes" : "No"}
        </span>
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
        <div style={{ whiteSpace: "nowrap" }}>
          {row.original.manager === "no" && (
            <Button
              size="sm"
              variant="success"
              className="me-2"
              onClick={(e) => {
                e.preventDefault();
                handlePromoteButton(selectedTeam, row.original.user_id);
              }}
              style={{
                backgroundColor: primary,
                borderColor: primary,
                color: "#fff",
              }}
              title="Make Team Manager"
            >
              <i className="mdi mdi-arrow-up-bold-circle me-1"></i>
              Promote
            </Button>
          )}
          <Link
            to="#"
            className="action-icon text-danger"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteButton(selectedTeam, row.original.user_id);
            }}
            title="Delete Member"
          >
            <i className="mdi mdi-delete"></i>
          </Link>
        </div>
      ),
    },
  ], [selectedTeam, handlePromoteButton, handleDeleteButton, formatDateTime, primary]);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          {
            label: "Team Members",
            path: "/settings/team-members",
            active: true,
          },
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
                      setSelectedMember(null);
                    }}
                    style={{
                      backgroundColor: primary,
                      borderColor: primary,
                      color: "#fff",
                    }}
                    disabled={!selectedTeam}
                  >
                    <i className="mdi mdi-plus-circle me-1"></i> Add Member to Team
                  </Button>
                  {!selectedTeam && (
                    <small className="text-muted d-block mt-1">
                      Please select a team first
                    </small>
                  )}
                </Col>
                <Col sm={8} className="text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading || !selectedTeam}
                  >
                    <i className="mdi mdi-refresh me-1"></i>
                    Refresh
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
                  {loadingTeams ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2">Loading teams...</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom: "10px", fontSize: "1rem" }}>
                        Select a team to view or manage members.
                      </p>
                      <Form.Select
                        style={{ marginBottom: "25px", fontSize: "1rem" }}
                        value={selectedTeam}
                        onChange={handleTeamChange}
                        required
                      >
                        <option value="">Select a team</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.company} - {team.department}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  )}

                  {selectedTeam && (
                    <>
                      {error ? (
                        <div className="alert alert-danger" role="alert">
                          <i className="mdi mdi-alert-circle-outline me-2"></i>
                          Error: {error}
                        </div>
                      ) : loading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                          <p className="mt-2">Loading members...</p>
                        </div>
                      ) : isLoading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Processing...</span>
                          </Spinner>
                          <p className="mt-2">Please wait...</p>
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
                                row.original.manager === "yes"
                                  ? `${secondary}40` // Add transparency
                                  : "inherit",
                              fontWeight: row.original.manager === "yes" ? "bold" : "normal",
                            },
                          })}
                          paginationProps={{
                            currentPage: pagination.currentPage,
                            totalPages: pagination.totalPages,
                            onPageChange: handlePageChange,
                            onPageSizeChange: handlePageSizeChange,
                          }}
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
        member={selectedMember}
        teams={teams} // Pass teams to avoid duplicate fetch
        onSubmit={() => {
          if (selectedTeam) {
            fetchData(selectedTeam, pagination.currentPage, pagination.pageSize);
          }
        }}
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
          message="Are you sure you want to delete this member from the team?"
          type="confirm"
          onClose={() => setDeletePopup({ isVisible: false, memberId: null, teamId: null })}
          buttonLabel="Yes, Delete"
          onAction={confirmDelete}
        />
      )}

      {promotePopup.isVisible && (
        <Popup
          message="Are you sure you want to make this member the team manager?"
          type="confirm"
          onClose={() => setPromotePopup({ isVisible: false, memberId: null, teamId: null })}
          buttonLabel="Yes, Promote"
          onAction={confirmPromote}
        />
      )}
    </>
  );
};

export default Members;