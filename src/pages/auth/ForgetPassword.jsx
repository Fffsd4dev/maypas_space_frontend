import { Button, Row, Col, FormGroup, FormLabel, FormControl, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import Popup from "../../components/Popup/Popup";
import { useParams } from "react-router-dom";
import { useLogoColor } from "../../context/LogoColorContext";


import { useEffect } from "react";

// components
import { VerticalForm, FormInput } from "@/components";
import AuthLayout from "./AuthLayout";
import useRequestOtp from "@/hooks/useRequestOtp.js";
import { Controller } from "react-hook-form";
import Feedback from "react-bootstrap/esm/Feedback";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";


/* bottom link */
const BottomLink = () => {
  const {
    t
  } = useTranslation();
        const { tenantSlug } = useParams();

  return <Row className="mt-3">
            <Col className="text-center">
                <p className="text-white-50">
                    {t("Back to")}{" "}
                    <Link to={`/${tenantSlug}/auth/login`} className="text-white ms-1">
                        <b>{t("Log in")}</b>
                    </Link>
                </p>
            </Col>
        </Row>;
};
const ForgetPassword = () => {
  const {
    t
  } = useTranslation();
   const {
      requestOtp,
      control,
      popup,
      setPopup,
      loading
    } = useRequestOtp();  

 const { logoImg } = useLogoColor();
   const { colour: primary } = useLogoColor();
   const { tenantSlug } = useParams();



    





  return <>
            <AuthLayout helpText={t("Enter your email address and we'll send you an email with instructions to reset your password.")} bottomLinks={<BottomLink />} primary={primary} >
              <form onSubmit={requestOtp}>
            
                                <div className="mb-3">
                                    <Controller name="email" control={control} render={({
                        field,
                        fieldState
                      }) => <FormGroup>
                                                <FormLabel htmlFor="email">
                                                    {t("Email")}
                                                </FormLabel>
                                                <FormControl id="email" {...field} isInvalid={Boolean(fieldState.error?.message)} />
                                                {fieldState.error?.message && <Feedback type="invalid" className="text-danger">{fieldState.error?.message}</Feedback>}
                                            </FormGroup>} />
                                </div>
            
                              
            
                                <div className="text-center d-grid">
                                <Button  type="submit" disabled={loading} style={{ background: primary, borderColor: primary, color: "#fff" }}>
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                t("Reset Password")
              )}
            </Button>
                                </div>
                            </form>



            </AuthLayout>

             {popup.isVisible && (
                            <Popup
                                message={popup.message}
                                type={popup.type}
                                onClose={() => setPopup({ ...popup, isVisible: false })}
                                buttonLabel={popup.buttonLabel}
                                buttonRoute={popup.buttonRoute}
                            />
                        )}
        </>;
};
export default ForgetPassword;