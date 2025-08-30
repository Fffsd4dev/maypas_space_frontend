import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import PageTitle from "../../components/PageTitle";
import axios from "axios";
import { useAuthContext } from "@/context/useAuthContext.jsx";

const SubscriptionDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const { user } = useAuthContext();
  const [subscription, setSubscription] = useState(location.state?.subscription);
  const [loading, setLoading] = useState(!subscription);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subscription) {
      const fetchSubscription = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/system-admin/view-subscription/${id}`,
            { headers: { Authorization: `Bearer ${user?.token}` } }
          );
          setSubscription(response.data.data);
        } catch (error) {
          setError("Failed to fetch subscription details.");
        } finally {
          setLoading(false);
        }
      };
      fetchSubscription();
    }
  }, [id, subscription, user]);

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

  if (!subscription) {
    return <p>No subscription details found.</p>;
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
      <PageTitle breadCrumbItems={[{ label: "Subscription Details", path: `/subscription-details/${subscription.id}`, active: true }]} title={`Subscription Details for ${subscription.id}`} />
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <h4 className="header-title">Subscription Details for {subscription.id}</h4>
              <p><strong>Plan ID:</strong> {subscription.plan_id}</p>
              <p><strong>Subscribed Plan:</strong> {subscription.plan.name}</p>
              <p><strong>Price:</strong> {subscription.plan.price}</p>
              <p><strong>Duration (months):</strong> {subscription.plan.duration}</p>
              <p><strong>Status:</strong> {subscription.status}</p>
              <p><strong>Starts At:</strong> {formatDateTime(subscription.starts_at)}</p>
              <p><strong>Subscription Ends At:</strong> {formatDateTime(subscription.ends_at)}</p>
              <p><strong>Created At:</strong> {formatDateTime(subscription.created_at)}</p>
              <p><strong>Updated At:</strong> {formatDateTime(subscription.updated_at)}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default SubscriptionDetails;
