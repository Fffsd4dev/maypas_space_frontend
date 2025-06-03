import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { useAuthContext } from '@/context/useAuthContext';
import httpClient from '@/helpers/httpClient';

const useConfirmNewPassword2 = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { saveSession } = useAuthContext();
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
    const [errorMessage, setErrorMessage] = useState("");
  const { tenantSlug } = useParams();
  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    otp: yup.string().required('Please enter the OTP sent to your email'),
    password: yup.string().required('Please enter your new password'),
    password_confirmation: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Please confirm your password')
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: 'user@demo1.com',
      otp: '1234',
      password: '123456',
      password_confirmation: '9876543210'
    }
  });
  const redirectUser = () => {
    const redirectLink = searchParams.get('redirectTo');
    if (redirectLink) navigate(redirectLink); else navigate(`/login2`);
  };

  const [popup, setPopup] = useState({ message: "", type: "", isVisible: false, buttonLabel: "", buttonRoute: "" });

  const confirmNewPassword = handleSubmit(async (data) => {
    setLoading(true);
    console.log('submitting');
    console.log({ tenantSlug });
    console.log(data);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/system-admin/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log(res);

      const result = await res.json();

      console.log(result);
      if (result.token && res.ok) {
        console.log(res.ok);
        console.log(result.user.tenant_id);
        saveSession({ ...(result ?? {}), tenantToken: result.token, tenant: tenantSlug, tenant_id: result.user.tenant_id, user_type_id: result.user.user_type_id, tenantFirstName: result?.user?.first_name, tenantLastName: result?.user?.last_name, tenantEmail: result?.user?.email, tenantPhone: result?.user?.phone });
        console.log(result)
        setPopup({
          message: "Password has successfully been changed!",
          type: "success",
          isVisible: true,
          buttonLabel: "Proceed to Login",
          buttonRoute: `/auth/login2`,
        });

        // redirectUser();
      } else {
        console.error('Failed:', result);
        const errorMessages = result.message;
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
console.error('Error Message:', errorMsg);
setPopup({
  message: `Failed: ${errorMsg}`,
  type: "error",
  isVisible: true,
  buttonLabel: "Retry",
  buttonRoute: `/auth/confirmNewPassword2`,
});
      }
    } catch (e) {
      console.error('Error during Confirm New Password:', e);
      let errorMsg = "An error Occured."; 
      if (e.response?.data?.errors) {
        // Extract all error messages and join them into a single string
        errorMsg = Object.values(e.response.data.errors)
          .flat() // Flatten array in case multiple errors per field
          .join("\n"); // Join errors with line breaks
      }
        else if (e.response?.data?.message) {   
        errorMsg = e.response.data.message;
      }
            setErrorMessage(errorMsg);

setPopup({
  message:  `Failed: ${ errorMsg || "An error occurred. Please try again."}`,
  type: "error",
  isVisible: true,
  buttonLabel: "Retry",
  buttonRoute: `/auth/confirmNewPassword2`,
});

      if (e.response?.data?.error) {
        control.setError('email', {
          type: "custom",
          message: e.response?.data?.error
        });
        control.setError('otp', {
          type: "custom",
          message: e.response?.data?.error
        });
        control.setError('password', {
          type: "custom",
          message: e.response?.data?.error
        });
        control.setError('password_confirmation', {
          type: "custom",
          message: e.response?.data?.error
        });
      }
    } finally {
      setLoading(false);
    }
  });
  return {
    loading,
    confirmNewPassword,
    control,
    popup,
    setPopup
  };
};
export default useConfirmNewPassword2;