import React, { useEffect, useMemo } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useLogoColor } from "../../context/LogoColorContext";

const AuthLayout = ({ helpText, bottomLinks, children, isCombineForm }) => {
  // Clean up class management
  useEffect(() => {
    const body = document.body;
    if (body) {
      body.classList.add("authentication-bg", "authentication-bg-pattern");
    }
    
    return () => {
      if (body) {
        body.classList.remove("authentication-bg", "authentication-bg-pattern");
      }
    };
  }, []);

  const { tenantSlug } = useParams();
  const { user } = useAuthContext();
  const { colour: primary, logoImg } = useLogoColor();

  const CName = user?.CName || "";
  
  // Memoize logo URL to prevent unnecessary re-renders
  const logoUrl = useMemo(() => {
    if (!logoImg) return null;
    return `${import.meta.env.VITE_BACKEND_URL || ''}/storage/uploads/tenant_logo/${logoImg}`;
  }, [logoImg]);

  // Responsive column sizing
  const getColumnSize = () => {
    if (isCombineForm) return { md: 10, lg: 8, xl: 6 };
    return { md: 8, lg: 6, xl: 4 };
  };

  const colSize = getColumnSize();

  // Logo component to avoid duplication
  const Logo = () => (
    <div className="auth-brand text-center mb-4">
      {logoImg && logoUrl ? (
        <div className="d-flex flex-column align-items-center">
          <img
            src={logoUrl}
            alt={CName || "Company Logo"}
            className="rounded-circle mb-2"
            style={{ 
              height: "82px", 
              width: "82px", 
              objectFit: "cover",
              border: `2px solid ${primary || '#fff'}`
            }}
            loading="eager"
          />
          {CName && (
            <h3 
              className="mb-0" 
              style={{ 
                color: primary || "#fe0002",
                fontSize: "1.5rem",
                fontWeight: "600"
              }}
            >
              {CName}
            </h3>
          )}
        </div>
      ) : CName ? (
        <div className="d-flex flex-column align-items-center">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center mb-2"
            style={{
              height: "82px",
              width: "82px",
              backgroundColor: primary || '#fe0002',
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {CName.charAt(0).toUpperCase()}
          </div>
          <h3 
            className="mb-0" 
            style={{ 
              color: primary || "#fe0002",
              fontSize: "1.5rem",
              fontWeight: "600"
            }}
          >
            {CName}
          </h3>
        </div>
      ) : (
        <div className="brand-placeholder" style={{ height: '100px' }}></div>
      )}
    </div>
  );

  return (
    <div 
      className="account-pages d-flex align-items-center"
      style={{ 
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${primary || '#4a90e2'} 0%, ${primary || '#4a90e2'}e6 100%)`,
        padding: '20px 0'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col 
            md={colSize.md} 
            lg={colSize.lg} 
            xl={colSize.xl}
          >
            <Card 
              className="border-0 shadow-lg overflow-hidden"
              style={{ 
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <Card.Body className="p-4 p-md-4">
                <div className="text-center">
                  <Logo />
                  
                  {helpText && (
                    <p 
                      className="text-muted mb-4 mt-3 px-3"
                      style={{ 
                        fontSize: '0.95rem',
                        lineHeight: '1.5'
                      }}
                    >
                      {helpText}
                    </p>
                  )}
                </div>
                
                {/* Children (form content) */}
                <div className="mt-4">
                  {children}
                </div>
                {bottomLinks}
              </Card.Body>
              
              
              {/* Footer links */}
              {/* {bottomLinks && (
                <Card.Footer 
                  className="border-0 bg-transparent pt-0"
                  style={{ backgroundColor: 'transparent' }}
                >
                  {bottomLinks}
                </Card.Footer>
              )} */}
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthLayout;