import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import * as yup from "yup";
import { useAuthContext } from "@/context/useAuthContext";
import httpClient from "@/helpers/httpClient";

const useRequestOtp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
  const { tenantSlug } = useParams();
  const otpFormSchema = yup.object({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Please enter your email"),
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(otpFormSchema),
    defaultValues: {
      email: "user@demo11.com",
    },
  });
  const redirectUser = () => {
    const redirectLink = searchParams.get("redirectTo");
    if (redirectLink) navigate(redirectLink);
    else navigate(`/${tenantSlug}/auth/confirmNewPassword`);
  };

  const [popup, setPopup] = useState({
    message: "",
    type: "",
    isVisible: false,
    buttonLabel: "",
    buttonRoute: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const requestOtp = handleSubmit(async (data) => {
    setLoading(true);
    console.log("submitting");
    console.log({ tenantSlug });
    console.log(data);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/${tenantSlug}/confirm-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      console.log(res);

      const result = await res.json();

      console.log(result);
      if ( res.ok) {
        console.log(res.ok);
        // console.log(result.user.tenant_id);
        // saveSession({ ...(result ?? {}), tenantToken: result.token, tenant: tenantSlug, tenant_id: result.user.tenant_id, user_type_id: result.user.user_type_id, tenantFirstName: result?.user?.first_name, tenantLastName: result?.user?.last_name, tenantEmail: result?.user?.email, tenantPhone: result?.user?.phone });
        console.log(result)
        setPopup({
          message: "An OTP has been sent to your email!",
          type: "success",
          isVisible: true,
          buttonLabel: "Proceed to enter OTP and your new Password",
          buttonRoute: `/${tenantSlug}/auth/confirmNewPassword`,
        });

        // redirectUser();
      } else {
        console.error("OTP Request Failed:", res);
        let errorMsg = "An error Occured."; // Default message

        if (result?.errors) {
          // Extract all error messages and join them into a single string
          errorMsg = Object.values(result.errors)
            .flat() // Flatten array in case multiple errors per field
            .join("\n"); // Join errors with line breaks
        } else if (result?.message) {
          errorMsg = result.message;
        }

        setErrorMessage(errorMsg);

        const errorMessages = result.message;
        setPopup({
          message: `OTP Request Failed: ${errorMsg}`,
          type: "error",
          isVisible: true,
          buttonLabel: "Retry",
          buttonRoute: `/${tenantSlug}/auth/forget-password`,
        });
      }
    } catch (e) {
      console.error("Error during OTP Request:", e);
      let errorMsg = "An error Occured.";
      if (e.response?.data?.errors) {
        // Extract all error messages and join them into a single string
        errorMsg = Object.values(e.response.data.errors)
          .flat() // Flatten array in case multiple errors per field
          .join("\n"); // Join errors with line breaks
      } else if (e.response?.data?.message) {
        errorMsg = e.response.data.message;
      }
      setErrorMessage(errorMsg);

      setPopup({
        message: `Failed: ${
          errorMsg || "An error occurred. Please try again."
        }`,
        type: "error",
        isVisible: true,
        buttonLabel: "Retry",
        buttonRoute: `/${tenantSlug}/auth/forget-password`,
      });

      if (e.response?.data?.error) {
        control.setError("email", {
          type: "custom",
          message: e.response?.data?.error,
        });
      }
    } finally {
      setLoading(false);
    }
  });
  return {
    loading,
    requestOtp,
    control,
    popup,
    setPopup,
  };
};
export default useRequestOtp;
