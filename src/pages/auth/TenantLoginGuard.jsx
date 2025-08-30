import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {  Spinner } from "react-bootstrap";

import { useAuthContext } from "@/context/useAuthContext";
import Login from "./Login";
import Error404Alt from "../error/Error404Alt";

const TenantLoginGuard = () => {
  const { tenantSlug } = useParams();
  const { saveSession } = useAuthContext();
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "notfound"
  const [tenantData, setTenantData] = useState(null);

    useEffect(() => {
   
    return () => {
      if (document.body)
        document.body.classList.remove(
          "authentication-bg",
          "authentication-bg-pattern"
        );
    };
  }, []);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/get/name`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.status === 404) {
          setStatus("notfound");
        } else if (res.ok) {
          const result = await res.json();
          console.log(result);
          saveSession({
            ...(result ?? {}),
            CName: result.company_name,
            tenantLinkName: result.slug,
          });
          setTenantData(result);
          setStatus("ok");
        } else {
          setStatus("notfound");
        }
      } catch {
        setStatus("notfound");
      }
    };
    fetchTenant();
  }, [tenantSlug]);

  if (status === "loading") return <div
  className="d-flex justify-content-center align-items-center vh-100"
>
  <div className="text-center">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
    <div>Loading...</div>
  </div>
</div>;
  if (status === "notfound") return <Error404Alt />;
  return <Login />;
};

export default TenantLoginGuard;