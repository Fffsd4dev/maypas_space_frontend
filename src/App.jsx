import React, { Fragment } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles
import "nouislider/dist/nouislider.css";
import "jsvectormap/dist/css/jsvectormap.min.css";
import "react-datepicker/dist/react-datepicker.min.css";
import '@/assets/scss/Default.scss';
import "@/assets/scss/Icons.scss";
import AllRoutes from "@/routes/Routes.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import AppProvidersWrapper from "@/components/AppProvidersWrapper.jsx";

function App() {
  return (
    <>
      <Fragment>
        <AppProvidersWrapper>
          <ErrorBoundary>
            <AllRoutes />
          </ErrorBoundary>
        </AppProvidersWrapper>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Fragment>
    </>
  );
}

export default App;