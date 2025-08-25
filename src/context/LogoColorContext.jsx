import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";
import {  Spinner } from "react-bootstrap";



const LogoColorContext = createContext();

export const useLogoColor = () => useContext(LogoColorContext);

export const LogoColorProvider = ({ children }) => {
  const [logoData, setLogoData] = useState(null);
  const [loadingLogo, setLoadingLogo] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthContext();
    const CName  = user?.CName;
  const { tenantSlug: tenantUrlSlug } = useParams();
const tenantSlug = (user?.tenant || user?.CName || tenantUrlSlug || "")
  .replace(/\s+/g, "");

  const fetchLogoData = useCallback(async () => {
    console.log(tenantSlug);
    if (!tenantSlug) {
      setLoadingLogo(false);
      return;
    }
    setLoadingLogo(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-details`
      );
      console.log("fetch logodetails", response)
      if (!response.ok) throw new Error("Failed to fetch logo data");
      const result = await response.json();
      if (Array.isArray(result.data)) {
        const sortedLogoData = result.data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setLogoData(sortedLogoData[0] || null);
      } else {
        setLogoData(null);
      }
    } catch (err) {
      setError(err.message);
      setLogoData(null);
    } finally {
      setLoadingLogo(false);
    }
  }, [tenantSlug]);

  useEffect(() => {
    fetchLogoData();
  }, [fetchLogoData]);

  // Helper to get a lighter version of the primary color using opacity
function hexToRgba(hex, alpha = 0.08) {
  let c = hex ? hex.replace("#", "") : "fe0002";
  if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

  return (
  <LogoColorContext.Provider
    value={{
      logoImg: logoData?.logo || null,
      colour: logoData?.colour || "#fe0002",
      secondaryColor: hexToRgba(logoData?.colour || "#fe0002", 0.08),
      loadingLogo,
      error,
      refetchLogoData: fetchLogoData,
    }}
  >
    {children}
    {loadingLogo && (
      <div className="d-flex justify-content-center align-items-center vh-100 position-fixed top-0 start-0 w-100 h-100" style={{zIndex: 9999, background: "rgba(255,255,255,0.7)"}}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div>Loading...</div>
        </div>
      </div>
    )}
  </LogoColorContext.Provider>
);
};