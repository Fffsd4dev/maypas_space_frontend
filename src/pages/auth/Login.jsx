import { Button, Row, Col, FormGroup, FormLabel, FormControl, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useLogoColor } from "../../context/LogoColorContext";
import AuthLayout from "./AuthLayout";
import useLogin from "@/hooks/useLogin.js";
import { Controller } from "react-hook-form";
import Feedback from "react-bootstrap/esm/Feedback";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

/* BottomLink Component */
const BottomLink = () => {
    const { t } = useTranslation();
    const { tenantSlug } = useParams();
    const { colour: primary } = useLogoColor();
    
    return (
        <Row className="mt-3">
            <Col className="text-center">
                <p className="text-white-50 mb-0">
                    <Link 
                        to={`/${tenantSlug}/auth/forget-password`} 
                        style={{
                          color: primary
                        }}
                    >
                        {t("Forgot your password?")}
                    </Link>
                </p>
            </Col>
        </Row>
    );
};

/* PasswordInput Component */
const PasswordInput = ({ control, name, label, placeholder }) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    return (
        <Controller 
            name={name} 
            control={control}
            render={({ field, fieldState }) => (
                <FormGroup>
                    <FormLabel htmlFor={name} className="form-label">
                        {label}
                    </FormLabel>
                    <div className="position-relative">
                        <FormControl
                            id={name}
                            type={showPassword ? 'text' : 'password'}
                            placeholder={placeholder}
                            {...field}
                            isInvalid={Boolean(fieldState.error?.message)}
                            className="form-control"
                        />
                        {fieldState.error?.message && (
                            <Feedback type="invalid" className="text-danger">
                                {fieldState.error?.message}
                            </Feedback>
                        )}
                        <button
                            type="button"
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y p-0 pe-2 me-2 border-0 bg-transparent"
                            onClick={togglePasswordVisibility}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    togglePasswordVisibility();
                                }
                            }}
                            aria-label={showPassword ? t("Hide password") : t("Show password")}
                            style={{ zIndex: 5 }}
                        >
                            {showPassword ? 
                                <FiEye size={18} className="text-secondary" /> : 
                                <FiEyeOff size={18} className="text-secondary" />
                            }
                        </button>
                    </div>
                </FormGroup>
            )}
        />
    );
};

/* Main Login Component */
const Login = () => {
    const { t } = useTranslation();
    const { tenantSlug } = useParams();
    const { colour: primary } = useLogoColor();
    const { login, control, loading } = useLogin();
    
    return (
        <>
            <AuthLayout 
                bottomLinks={<BottomLink />}
            >
                <form onSubmit={login}>
                    <fieldset disabled={loading}>
                        <div className="mb-3">
                            <Controller 
                                name="email" 
                                control={control}
                                render={({ field, fieldState }) => (
                                    <FormGroup>
                                        <FormLabel htmlFor="email" className="form-label">
                                            {t("Email")}
                                        </FormLabel>
                                        <FormControl 
                                            id="email"
                                            type="email"
                                            placeholder={t("Enter your email")}
                                            {...field}
                                            isInvalid={Boolean(fieldState.error?.message)}
                                            className="form-control"
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
                            <PasswordInput 
                                control={control}
                                name="password"
                                label={t("Password")}
                                placeholder={t("Enter your password")}
                            />
                        </div>

                        <div className="text-center d-grid">
                            <Button 
                                style={{ 
                                    background: primary, 
                                    borderColor: primary, 
                                    color: "#fff",
                                    height: '48px'
                                }} 
                                type="submit"
                                disabled={loading}
                                className="fw-medium"
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        {t("Logging in...")}
                                    </>
                                ) : (
                                    t("Log In")
                                )}
                            </Button>
                        </div>
                    </fieldset>
                </form>
            </AuthLayout>
        </>
    );
};

export default Login;