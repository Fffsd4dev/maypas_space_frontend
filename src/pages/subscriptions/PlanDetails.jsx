import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import PageTitle from "../../components/PageTitle";
import axios from "axios";
import { useAuthContext } from "@/context/useAuthContext.jsx";

const PlanDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [plan, setPlan] = useState(location.state?.plan);
  const [loading, setLoading] = useState(!plan);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!plan) {
      const fetchPlan = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-plan/${id}`,
            { headers: { Authorization: `Bearer ${user?.token}` } }
          );
          console.log(response.data);
          if (Array.isArray(response.data.data) && response.data.data.length > 0) {
            setPlan(response.data.data[0]);
          } else {
            setError("No plan details found.");
          }
        } catch (error) {
          setError("Failed to fetch plan details.");
        } finally {
          setLoading(false);
        }
      };
      fetchPlan();
    }
  }, [id, plan, user]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (!plan) {
    return <p>No plan details found.</p>;
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
      <PageTitle breadCrumbItems={[{ label: "Plan Details", path: `/plan-details/${plan.id}`, active: true }]} title={`Plan Details for ${plan.name}`} />
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <h4 className="header-title"> Subscription Plan Details for {plan.name}</h4>
              <p><strong>Plan ID:</strong> {plan.id}</p>
              <p><strong>Subscription Plan Name:</strong> {plan.name}</p>
              <p><strong>Price:</strong> {plan.price}</p>
              <p><strong>Duration (months):</strong> {plan.duration}</p>
              <p><strong>Created At:</strong> {formatDateTime(plan.created_at)}</p>
              <p><strong>Updated At:</strong> {formatDateTime(plan.updated_at)}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlanDetails;
