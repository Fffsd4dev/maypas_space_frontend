import { Row, Col, Breadcrumb } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";
import { useLogoColor } from "../context/LogoColorContext";
import { useEffect } from "react";

const breadcrumbLinkStyle = `
  .breadcrumb .breadcrumb-primary-link {
    color: var(--primary-breadcrumb, #fe0002) !important;
    text-decoration: underline;
  }
`;

const PageTitle = (props) => {
  const { user } = useAuthContext();
  const { tenantSlug: tenantUrlSlug } = useParams();
  const { visitorSlug: visitorUrlSlug } = useParams();

  // Prefer user.tenant but fall back to URL param
  const tenantSlug = user?.tenant || tenantUrlSlug;
  const visitorSlug = user?.visitorSlug || visitorUrlSlug;
  const tenantFirstName = user?.tenantFirstName || "";
  const tenantLastName = user?.tenantLastName || "";
  const companyName = user?.tenantCompanyName || "";
  console.log(companyName);
  const { logoImg } = useLogoColor();
  const { colour: primary } = useLogoColor();

  useEffect(() => {
    if (!document.getElementById("breadcrumb-primary-style")) {
      const style = document.createElement("style");
      style.id = "breadcrumb-primary-style";
      style.innerHTML = breadcrumbLinkStyle;
      document.head.appendChild(style);
    }
    document.documentElement.style.setProperty("--primary-breadcrumb", primary);
  }, [primary]);

  const tenantDisplayName = companyName
    ? companyName.charAt(0).toUpperCase()
    : "";

  const hasTenant = !!tenantSlug;
  const hasVisitor = !!visitorSlug;
  const hasToken = !!user?.token;

  return (
    <Row>
      <Col>
        <div className="page-title-box">
          <div className="page-title-right">
            <Breadcrumb>
              <Breadcrumb.Item
                href={
                  hasTenant
                    ? `/${tenantSlug}/${hasToken ? "tenantDashboard" : "home"}`
                    : hasVisitor
                    ? `/${visitorSlug}/home`
                    : "/dashboard"
                }
                className="breadcrumb-primary-link"
              >
                {hasVisitor
                  ? `${visitorSlug.charAt(0).toUpperCase()}${visitorSlug.slice(1)} Booking`
                  : hasTenant
                  ? `${tenantDisplayName} Booking`
                  : hasToken
                  ? "MayPas Booking"
                  : "Booking"}
              </Breadcrumb.Item>

              {(props["breadCrumbItems"] || []).map((item, index) => {
                return item.active ? (
                  <Breadcrumb.Item active key={index}>
                    {item.label}
                  </Breadcrumb.Item>
                ) : (
                  <Breadcrumb.Item
                    key={index}
                    href={item.path}
                    className="breadcrumb-primary-link"
                  >
                    {item.label}
                  </Breadcrumb.Item>
                );
              })}
            </Breadcrumb>
          </div>
          <h4 className="page-title">{props["title"]}</h4>
        </div>
      </Col>
    </Row>
  );
};

export default PageTitle;