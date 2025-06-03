import { Button, Row, Col, FormGroup, FormLabel, FormControl, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import Popup from "../../components/Popup/Popup";
import { useParams } from "react-router-dom";

// components

import AuthLayout from "./AuthLayout";
import useLogin from "@/hooks/useLogin.js";
import { Controller } from "react-hook-form";
import Feedback from "react-bootstrap/esm/Feedback";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useConfirmNewPassword from "@/hooks/useConfirmNewPassword.js";

/* bottom links */
const BottomLink = () => {
  const {
    t
  } = useTranslation();

    const { tenantSlug } = useParams();
  
  return <Row className="mt-3">
            
        </Row>;
};

/* social links */
const SocialLinks = () => {
  const socialLinks = [{
    variant: "primary",
    icon: "facebook"
  }, {
    variant: "danger",
    icon: "google"
  }, {
    variant: "info",
    icon: "twitter"
  }, {
    variant: "secondary",
    icon: "github"
  }];
  return <>
            <ul className="social-list list-inline mt-3 mb-0">
                {(socialLinks || []).map((item, index) => {
        return <li key={index} className="list-inline-item">
                            <Link to="#" className={classNames("social-list-item", "border-" + item.variant, "text-" + item.variant)}>
                                <i className={classNames("mdi", "mdi-" + item.icon)}></i>
                            </Link>
                        </li>;
      })}
            </ul>
        </>;
};
const ConfirmNewPassword = () => {

  const { tenantSlug } = useParams();

  const {
    t
  } = useTranslation();
  const {
    confirmNewPassword,
    control,
    popup,
    setPopup,
    loading
  } = useConfirmNewPassword();

  

  const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

  return <>
            <AuthLayout helpText={t("Enter your email address and password to access admin panel.")} bottomLinks={<BottomLink />}>

                <form onSubmit={confirmNewPassword}>

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



                       <div className="mb-3">
                        <Controller name="otp" control={control} render={({
            field,
            fieldState
          }) => <FormGroup>
                                    <FormLabel htmlFor="otp">
                                        {t("Enter the OTP sent to your email")}
                                    </FormLabel>

                                    <div className="position-relative">
                                        <FormControl id="otp" type={showOtp ? 'text' : 'password'} {...field} isInvalid={Boolean(fieldState.error?.message)} />
                                        {fieldState.error?.message && <Feedback type="invalid" className="text-danger">{fieldState.error?.message}</Feedback>}
                                        <span className="d-flex position-absolute top-50 end-0 translate-middle-y p-0 pe-2 me-2" onClick={() => setShowOtp(!showOtp)}>
                                      {!fieldState.error && (showOtp ? <FiEye height={18} width={18} className="cursor-pointer" /> : <FiEyeOff height={18} width={18} className="cursor-pointer" />)}
                                    </span>
                                    </div>
                                </FormGroup>} />
                    </div>



                    <div className="mb-3">
                        <Controller name="password" control={control} render={({
            field,
            fieldState
          }) => <FormGroup>
                                    <FormLabel htmlFor="password">
                                        {t("New Password")}
                                    </FormLabel>

                                    <div className="position-relative">
                                        <FormControl id="password" type={showPassword ? 'text' : 'password'} {...field} isInvalid={Boolean(fieldState.error?.message)} />
                                        {fieldState.error?.message && <Feedback type="invalid" className="text-danger">{fieldState.error?.message}</Feedback>}
                                        <span className="d-flex position-absolute top-50 end-0 translate-middle-y p-0 pe-2 me-2" onClick={() => setShowPassword(!showPassword)}>
                                      {!fieldState.error && (showPassword ? <FiEye height={18} width={18} className="cursor-pointer" /> : <FiEyeOff height={18} width={18} className="cursor-pointer" />)}
                                    </span>
                                    </div>
                                </FormGroup>} />
                    </div>

                     
                     
                      <div className="mb-3">
                        <Controller name="password_confirmation" control={control} render={({
            field,
            fieldState
          }) => <FormGroup>
                                    <FormLabel htmlFor="password_confirmation">
                                        {t("Confirm Password")}
                                    </FormLabel>

                                    <div className="position-relative">
                                        <FormControl id="password_confirmation" type={showConfirmPassword ? 'text' : 'password'} {...field} isInvalid={Boolean(fieldState.error?.message)} />
                                        {fieldState.error?.message && <Feedback type="invalid" className="text-danger">{fieldState.error?.message}</Feedback>}
                                        <span className="d-flex position-absolute top-50 end-0 translate-middle-y p-0 pe-2 me-2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                      {!fieldState.error && (showConfirmPassword ? <FiEye height={18} width={18} className="cursor-pointer" /> : <FiEyeOff height={18} width={18} className="cursor-pointer" />)}
                                    </span>
                                    </div>
                                </FormGroup>} />
                    </div>

                    <div className="text-center d-grid">
                    <Button variant="primary" type="submit" disabled={loading}>
  {loading ? (
    <Spinner
      as="span"
      animation="border"
      size="sm"
      role="status"
      aria-hidden="true"
    />
  ) : (
    t("Confirm New Password")
  )}
</Button>
                    </div>
                </form>

                {/* SOCIAL LINK */}
                {/* <div className="text-center">
                    <h5 className="mt-3 text-muted">{t("Sign in with")}</h5>
                    <SocialLinks />
                </div> */}
            </AuthLayout>

             {/* Render the Popup UI when it is visible */}
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
export default ConfirmNewPassword;