import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import LogoDark from "@/assets/images/logo-dark.png";
import LogoLight from "@/assets/images/logo-light.png";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useLogoColor } from "../../context/LogoColorContext";


// import Popup from '../../components/Popup/Popup'

const AuthLayout = ({ helpText, bottomLinks, children, isCombineForm }) => {
  useEffect(() => {
    if (document.body)
      document.body.classList.add(
        "authentication-bg",
        "authentication-bg-pattern"
      );
    return () => {
      if (document.body)
        document.body.classList.remove(
          "authentication-bg",
          "authentication-bg-pattern"
        );
    };
  }, []);

  const { tenantSlug } = useParams();
  const { user } = useAuthContext();
  const CName  = user?.CName;
  console.log(CName)
      const { colour: primary, secondaryColor: secondary, logoImg } = useLogoColor();



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
                          {logoImg ? (
                            <img
                              src={
                                logoImg
                                  ? `${
                                      import.meta.env.VITE_BACKEND_URL
                                    }/storage/uploads/tenant_logo/${
                                      logoImg
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
                            {CName}{" "}
                          </h3>
                        </span>
                      </Link>

                      <Link
                        to="/auth/login"
                        className="logo logo-light text-center"
                      >
                        <span className="logo-lg">
                          {logoImg ? (
                            <img
                              src={
                                logoImg
                                  ? `${
                                      import.meta.env.VITE_BACKEND_URL
                                    }/storage/uploads/tenant_logo/${
                                      logoImg
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
                            {CName}
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
