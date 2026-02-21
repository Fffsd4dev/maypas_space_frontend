import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toast } from "react-toastify";

const RoleDetails = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const tenantToken = user?.tenantToken;
  const tenantSlugg = user?.tenant;
  
  const isMounted = useRef(true);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if role data was passed via window object
  useEffect(() => {
    if (window.roleData) {
      setRole(window.roleData);
      setLoading(false);
      window.roleData = null; // Clean up
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchRole = useCallback(async () => {
    if (!tenantToken || !tenantSlugg || !id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlugg}/usertype/user-type/${id}`,
        {
          headers: { 
            Authorization: `Bearer ${tenantToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch role details. Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (isMounted.current && result.data) {
        setRole(result.data);
      } else if (isMounted.current) {
        throw new Error("No role details found.");
      }
    } catch (error) {
      if (isMounted.current) {
        setError(error.message);
        toast.error(error.message || "Failed to fetch role details.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, tenantToken, tenantSlugg]);

  useEffect(() => {
    if (!role && tenantToken && tenantSlugg && id) {
      fetchRole();
    }
  }, [role, id, tenantToken, tenantSlugg, fetchRole]);

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

  const formatPermissionName = useCallback((key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading role details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!role) {
    return (
      <Alert variant="warning" className="m-3">
        <Alert.Heading>No Data</Alert.Heading>
        <p>No role details found.</p>
      </Alert>
    );
  }

  // Filter out metadata fields to show only permissions
  const metadataFields = ['id', 'created_at', 'updated_at', 'user_type'];
  const permissions = Object.entries(role).filter(
    ([key]) => !metadataFields.includes(key) && !key.includes('_at')
  );

  return (
    <>
      <PageTitle 
        breadCrumbItems={[
          { label: "Roles", path: "/account/roles" },
          { label: role.user_type, path: `/role-details/${id}`, active: true },
        ]} 
        title={`Role: ${role.user_type}`} 
      />
      
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">
                <h4>{role.user_type} - Permissions</h4>
              </Card.Title>
              
              <Row>
                {permissions.map(([key, value]) => (
                  <Col md={4} key={key} className="mb-3">
                    <div className="d-flex align-items-center">
                      <div 
                        className={`me-2 ${value === 'yes' ? 'text-success' : 'text-danger'}`}
                        style={{ fontSize: '1.2rem' }}
                      >
                        <i className={`mdi mdi-${value === 'yes' ? 'check-circle' : 'close-circle'}`}></i>
                      </div>
                      <div>
                        <strong>{formatPermissionName(key)}</strong>
                        <br />
                        <small className="text-muted">{value === 'yes' ? 'Allowed' : 'Not Allowed'}</small>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              <hr className="my-4" />
              
              <Row>
                <Col md={6}>
                  <p className="mb-1">
                    <strong>Created At:</strong> {formatDateTime(role.created_at)}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-1">
                    <strong>Updated At:</strong> {formatDateTime(role.updated_at)}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default RoleDetails;