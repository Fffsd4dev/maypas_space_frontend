import { useState, useEffect, Suspense } from "react";
import { toggleDocumentAttribute } from "@/utils";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";
import { useParams } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext.jsx";

const loading = () => <div className=""></div>;

const DefaultLayout = props => {
  const { theme } = useLayoutContext();

  // Fetch logo data
  const [logoData, setLogoData] = useState([]);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [error, setError] = useState(null);

  const { tenantSlug } = useParams();

  const fetchLogoData = async (page = 1, pageSize = 10) => {
    setLoadingLogo(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/view-details`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Contact Support! HTTP error! Status: ${response.status}`
        );
      }

      const result = await response.json();
      if (Array.isArray(result.data)) {
        const sortedLogoData = result.data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setLogoData(sortedLogoData);
        console.log("logocolor data", sortedLogoData);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingLogo(false);
    }
  };

  useEffect(() => {
    fetchLogoData();
  }, []);

  const primary = logoData[0]?.colour || "#fe0002";
  console.log(primary);

  useEffect(() => {
    toggleDocumentAttribute("data-bs-theme", theme);
  }, [theme]);

  // Dynamically inject style for .authentication-bg with the current primary color
  useEffect(() => {
    const styleId = "dynamic-auth-bg-style";
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      .authentication-bg {
        background-color: ${primary} !important;
        background-size: cover;
        background-position: center;
      }
      .authentication-bg-pattern {
        background-image: url("/src/assets/images/bg-pattern.png");
      }
    `;
    return () => {
      if (styleTag) styleTag.remove();
    };
  }, [primary]);

  useEffect(() => {
    if (document.body) document.body.classList.add("authentication-bg-pattern", "authentication-bg");
    return () => {
      if (document.body) {
        document.body.classList.remove("authentication-bg-pattern", "authentication-bg");
      }
    };
  }, []);

  const children = props["children"] || null;
  return (
    <>
      <Suspense fallback={loading()}>{children}</Suspense>
    </>
  );
};

export default DefaultLayout;