import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";

const LogoColorContext = createContext();

export const useLogoColor = () => useContext(LogoColorContext);

export const LogoColorProvider = ({ children }) => {
  const [logoData, setLogoData] = useState(null);
  const [loadingLogo, setLoadingLogo] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthContext();
  const { tenantSlug: tenantUrlSlug } = useParams();
  const tenantSlug = user?.tenant || tenantUrlSlug ;

  useEffect(() => {
    if (!tenantSlug) {
      setLoadingLogo(false);
      return;
    }
    const fetchLogoData = async () => {
      setLoadingLogo(true);
      setError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-details`
        );
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
    };
    fetchLogoData();
  }, [tenantSlug]);

  return (
    <LogoColorContext.Provider
      value={{
        logoImg: logoData?.logo || null,
        colour: logoData?.colour || "#fe0002",
        loadingLogo,
        error,
      }}
    >
      {children}
    </LogoColorContext.Provider>
  );
};