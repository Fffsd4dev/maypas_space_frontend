import { Row, Col, Breadcrumb } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useParams } from "react-router-dom";

const PageTitle = (props) => {
  const { user } = useAuthContext();
  const { tenantSlug: tenantUrlSlug } = useParams();

  // Prefer user.tenant but fall back to URL param
  const tenantSlug = user?.tenant || tenantUrlSlug;
  const tenantFirstName = user?.tenantFirstName || "";
  const tenantLastName = user?.tenantLastName || "";
  const companyName = user?.tenantCompanyName || "";

  const tenantDisplayName = companyName
    ? companyName.charAt(0).toUpperCase()
    : "";

  const hasTenant = !!tenantSlug;
  const hasToken = !!user?.token;

  return (
    <Row>
      <Col>
        <div className="page-title-box">
          <div className="page-title-right">
            <Breadcrumb className="m-0">
              <Breadcrumb.Item
                href={
                  hasTenant
                    ? `/${tenantSlug}/${hasToken ? "tenantDashboard" : "home"}`
                    : "/dashboard-3"
                }
              >
                {hasTenant
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
                  <Breadcrumb.Item key={index} href={item.path}>
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
