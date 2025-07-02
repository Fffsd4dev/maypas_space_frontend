import { useState, useEffect, Suspense } from "react";
import { toggleDocumentAttribute } from "@/utils";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";
import { useParams } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useLogoColor } from "../context/LogoColorContext";

const loading = () => <div className=""></div>;

const DefaultLayout = props => {
  const { theme } = useLayoutContext();

  // Fetch logo data
     const { colour: primary, secondaryColor: secondary } = useLogoColor();


  const { tenantSlug } = useParams();

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