import { Row, Col, Breadcrumb } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext.jsx";

/**
 * PageTitle
 */
const PageTitle = (props) => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;
  const TenantSlug = tenantSlug
  ? tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1).toLowerCase()
  : ""; // Convert tenantSlug to Sentence Case
  const isTenant = !!tenantSlug; // Check if the user is a tenant

  return (
    <Row>
      <Col>
        <div className="page-title-box">
          <div className="page-title-right">
            <Breadcrumb className="m-0">
              <Breadcrumb.Item
                href={isTenant ? `/${tenantSlug}/dashboard-1` : "/dashboard-3"}
              >
                {isTenant ? `${TenantSlug} Booking` : "MayPas Booking"}
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