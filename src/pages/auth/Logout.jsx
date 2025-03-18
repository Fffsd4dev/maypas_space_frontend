import { Row, Col } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useAuthContext } from "@/context/useAuthContext";
import axios from "axios";

// components
import AuthLayout from "./AuthLayout";
const LogoutIcon = () => {
  return <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2"> <circle className="path circle" fill="none" stroke="#4bd396" strokeWidth="6" strokeMiterlimit="10" cx="65.1" cy="65.1" r="62.1" /> <polyline className="path check" fill="none" stroke="#4bd396" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 " /> </svg>;
};

/* bottom link */
const BottomLink = () => {
  const { tenantSlug } = useParams();
  const { user } = useAuthContext();
  const tenantSlugg = user?.tenant;

  const { t } = useTranslation();
  return (
    <Row className="mt-3">
      <Col className="text-center">
        <p className="text-white-50">
          {t("Back to")}{" "}
          <Link to={`/${tenantSlugg}/auth/login`} className="text-white ms-1">
            <b>{t("Sign In")}</b>
          </Link>
        </p>
      </Col>
    </Row>
  );
};

const Logout = () => {
  const { t } = useTranslation();
  const { tenantSlug } = useParams();
  const navigate = useNavigate();
  const { removeSession, user } = useAuthContext();

  const token = user?.tenantToken;

  useEffect(() => {
    const logout = async () => {
      console.log(token);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          console.log(res.data.message);
          removeSession();

        } else {
          console.error('Logout Failed:', res);
        }
      } catch (e) {
        console.error('Error during Logout:', e);
       
      }
    };

    logout();
  }, [tenantSlug, removeSession, navigate, token]);

  return (
    <>
      <AuthLayout bottomLinks={<BottomLink />}>
        <div className="text-center">
          <div className="mt-4">
            <div className="logout-checkmark">
              <LogoutIcon />
            </div>
          </div>

          <h3>{t("See you again !")}</h3>

          <p className="text-muted">
            {" "}
            {t("You are now successfully signed out.")}{" "}
          </p>
        </div>
      </AuthLayout>
    </>
  );
};

export default Logout;