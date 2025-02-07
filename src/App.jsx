import { Fragment } from "react";
import "nouislider/dist/nouislider.css";
import "jsvectormap/dist/css/jsvectormap.min.css";
import "react-datepicker/dist/react-datepicker.min.css";
import '@/assets/scss/Default.scss';
import "@/assets/scss/Icons.scss";
import configureFakeBackend from "@/helpers/fake-backend.js";
import AllRoutes from "@/routes/Routes.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import AppProvidersWrapper from "@/components/AppProvidersWrapper.jsx";
configureFakeBackend();
function App() {
  return <>
            <Fragment>
                <AppProvidersWrapper>
                <ErrorBoundary>
                    <AllRoutes />
                </ErrorBoundary>
                </AppProvidersWrapper>
            </Fragment>
        </>;
}
export default App;