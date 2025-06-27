import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import LogoDark from "@/assets/images/logo-dark.png";
import LogoLight from "@/assets/images/logo-light.png";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// import Popup from '../../components/Popup/Popup'

const AuthLayout = ({ helpText, bottomLinks, children, isCombineForm }) => {
  // useEffect(() => {
  //   if (document.body)
  //     document.body.classList.add(
  //       "authentication-bg",
  //       "authentication-bg-pattern"
  //     );
  //   return () => {
  //     if (document.body)
  //       document.body.classList.remove(
  //         "authentication-bg",
  //         "authentication-bg-pattern"
  //       );
  //   };
  // }, []);

  const { tenantSlug } = useParams();
  const [logoData, setLogoData] = useState([]);
  const [loadingLogo, setLoadingLogo] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogoData = async (page = 1, pageSize = 10) => {
    setLoadingLogo;
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
      console.log(result);

      if (Array.isArray(result.data)) {
        // Sort the data by updated_at or created_at
        const sortedLogoData = result.data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        );
        setLogoData(sortedLogoData);
        console.log("Sorted Logo Data:", sortedLogoData);
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

  // const [popup, setPopup] = useState({ message: "", type: "", isVisible: false, buttonLabel: "", buttonRoute: "" });

  return (
    <>
      <div className="account-pages mt-5 mb-5" style={{ backgroundColor: primary, minHeight: "100vh", backgroundSize: "cover", backgroundPosition: "center" }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={isCombineForm ? 9 : 4}>
              <Card className="bg-pattern">
                <Card.Body className="p-4">
                  <div className="text-center w-75 m-auto">
                    <div className="auth-brand">
                      <Link
                        to="/auth/login"
                        className="logo logo-dark text-center"
                      >
                        <span className="logo-lg">
                          {logoData[0]?.logo ? (
                            <img
                              src={
                                logoData[0]?.logo
                                  ? `${
                                      import.meta.env.VITE_BACKEND_URL
                                    }/storage/uploads/tenant_logo/${
                                      logoData[0].logo
                                    }`
                                  : ""
                              }
                              alt=""
                              className="rounded-circle avatar-md"
                              height="82"
                            />
                          ) : (
                            ""
                          )}{" "}
                          <h3 color="#fe0002">
                            {" "}
                            {tenantSlug.toLocaleUpperCase()}{" "}
                          </h3>
                        </span>
                      </Link>

                      <Link
                        to="/auth/login"
                        className="logo logo-light text-center"
                      >
                        <span className="logo-lg">
                          {logoData[0]?.logo ? (
                            <img
                              src={
                                logoData[0]?.logo
                                  ? `${
                                      import.meta.env.VITE_BACKEND_URL
                                    }/storage/uploads/tenant_logo/${
                                      logoData[0].logo
                                    }`
                                  : ""
                              }
                              alt=""
                              className="rounded-circle avatar-md"
                              height="82"
                            />
                          ) : (
                            ""
                          )}
                          <h3 color="#fe0002">
                            {tenantSlug.toLocaleUpperCase()}
                          </h3>
                        </span>
                      </Link>
                    </div>
                    {/* <p className="text-muted mb-4 mt-3">{helpText}</p> */}
                  </div>
                  {children}
                </Card.Body>
              </Card>

              {/* bottom links */}
              {bottomLinks}
            </Col>
          </Row>
          {/* {popup.isVisible && (
                <Popup
                    message={popup.message}
                    type={popup.type}
                    onClose={() => setPopup({ ...popup, isVisible: false })}
                    buttonLabel={popup.buttonLabel}
                    buttonRoute={popup.buttonRoute}
                />
            )} */}
        </Container>
      </div>
    </>
  );
};
export default AuthLayout;
