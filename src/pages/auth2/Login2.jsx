import { Button, FormGroup, FormLabel, FormControl, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import Popup from "../../components/Popup/Popup";
import { useParams } from "react-router-dom";
import useLogin2 from "@/hooks/useLogin2.js";
import { Controller } from "react-hook-form";
import Feedback from "react-bootstrap/esm/Feedback";
import { useState } from "react";

// components
import { VerticalForm, FormInput } from "@/components";
import AuthLayout from "./AuthLayout";
import { FiEye, FiEyeOff } from "react-icons/fi";

/* bottom link */
const BottomLink = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer footer-alt">
      {/* <p className="text-muted">
        {t("Don't have an account?")}{" "}
        <Link to={"/auth/register2"} className="text-muted ms-1">
          <b>{t("Sign Up")}</b>
        </Link>
      </p> */}
       <p className="text-black-50">
                      
                          <Link to={`/auth/forget-password2`} className="text-black ms-1">
                              {t("Forgot your password?")}
                          </Link>
                     
                          
                      </p>
    </footer>
  );
};

/* social links */
const SocialLinks = () => {
  const socialLinks = [
    {
      variant: "primary",
      icon: "facebook",
    },
    {
      variant: "danger",
      icon: "google",
    },
    {
      variant: "info",
      icon: "twitter",
    },
    {
      variant: "secondary",
      icon: "github",
    },
  ];
  return (
    <>
      <ul className="social-list list-inline mt-3 mb-0">
        {(socialLinks || []).map((item, index) => {
          return (
            <li key={index} className="list-inline-item">
              <Link
                to="#"
                className={classNames(
                  "social-list-item",
                  "border-" + item.variant,
                  "text-" + item.variant
                )}
              >
                <i className={classNames("mdi", "mdi-" + item.icon)}></i>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};
const Login2 = () => {
  const { t } = useTranslation();
  const { login, control, popup, setPopup, loading } = useLogin2();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <AuthLayout bottomLinks={<BottomLink />}>
        <h4 className="mt-0">{t("Sign In")}</h4>
        <p className="text-muted mb-4">
          {t("Enter your email address and password to access account.")}
        </p>
        <form onSubmit={login}>
          <div className="mb-3">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <FormGroup>
                  <FormLabel htmlFor="email">{t("Email")}</FormLabel>
                  <FormControl
                    id="email"
                    {...field}
                    isInvalid={Boolean(fieldState.error?.message)}
                  />
                  {fieldState.error?.message && (
                    <Feedback type="invalid" className="text-danger">
                      {fieldState.error?.message}
                    </Feedback>
                  )}
                </FormGroup>
              )}
            />
          </div>

          <div className="mb-3">
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <FormGroup>
                  <FormLabel htmlFor="password">{t("Password")}</FormLabel>

                  <div className="position-relative">
                    <FormControl
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                      isInvalid={Boolean(fieldState.error?.message)}
                    />
                    {fieldState.error?.message && (
                      <Feedback type="invalid" className="text-danger">
                        {fieldState.error?.message}
                      </Feedback>
                    )}
                    <span
                      className="d-flex position-absolute top-50 end-0 translate-middle-y p-0 pe-2 me-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {!fieldState.error &&
                        (showPassword ? (
                          <FiEye
                            height={18}
                            width={18}
                            className="cursor-pointer"
                          />
                        ) : (
                          <FiEyeOff
                            height={18}
                            width={18}
                            className="cursor-pointer"
                          />
                        ))}
                    </span>
                  </div>
                </FormGroup>
              )}
            />
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
    t("Log In")
  )}
</Button>
          </div>
        </form>
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
    </>
  );
};
export default Login2;
