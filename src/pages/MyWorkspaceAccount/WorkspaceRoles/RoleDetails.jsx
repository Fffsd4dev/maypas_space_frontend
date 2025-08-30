import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, Row, Col, Spinner, Form } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import axios from "axios";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";

const RoleDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [role, setRole] = useState(location.state?.role);
  const [loading, setLoading] = useState(!role);
  const tenantSlugg = user?.tenant;

  useEffect(() => {
    if (!role) {
      const fetchRole = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/usertype/user-type/${id}`,
            { headers: { Authorization: `Bearer ${user?.tenantToken}` } }
          );
          console.log(response.data);
          if (response.data.data) {
            setRole(response.data.data);
          } else {
            toast.error("No role details found.");
          }
        } catch (error) {
          toast.error("Failed to fetch role details.");
        } finally {
          setLoading(false);
        }
      };
      fetchRole();
    }
  }, [id, role, user]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!role) {
    return <p>No role details found.</p>;
  }

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

  return (
    <>
      <PageTitle breadCrumbItems={[{ label: "Role Details", path: `/role-details/${role.user_type}`, active: true }]} title={`Role Details for ${role.user_type}`} />
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <h4 className="header-title">Role Details for {role.user_type}</h4>
              {Object.entries(role).map(([key, value]) => (
                <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value}</p>
              ))}
              <p><strong>Created At:</strong> {formatDateTime(role.created_at)}</p>
              <p><strong>Updated At:</strong> {formatDateTime(role.updated_at)}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default RoleDetails;