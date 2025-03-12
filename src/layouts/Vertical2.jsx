import React, { Suspense, useEffect, useState } from "react";
import { Container } from "react-bootstrap";

// utils
import { toggleDocumentAttribute } from "@/utils";
import { useViewport } from "@/hooks/useViewPort";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";

// code splitting and lazy loading
const Topbar2 = React.lazy(() => import("./Topbar2"));
const LeftSidebar2 = React.lazy(() => import("./LeftSidebar2"));
const Footer = React.lazy(() => import("./Footer"));
const RightSidebar2 = React.lazy(() => import("./RightSideBar2"));
const Menu2 = React.lazy(() => import("./Menu2"));
const loading = () => <div className=""></div>;

const VerticalLayout2 = ({ children }) => {
  const { width } = useViewport();
  const {
    topBar,
    menu,
    mode,
    width: layoutWidth,
    orientation,
    theme,
    showTwoToneIcons,
    showUserInfo,
    changeMenuSize,
    themeCustomizer
  } = useLayoutContext();
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  /*
  layout defaults
  */

  useEffect(() => {
    if (width < 1140) {
      changeMenuSize('full');
    } else if (width >= 1140) {
      changeMenuSize('default');
      document.getElementsByTagName("html")[0].classList.remove("sidebar-enable");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);
  useEffect(() => {
    toggleDocumentAttribute("data-layout", orientation);
  }, [orientation]);
  useEffect(() => {
    toggleDocumentAttribute("data-layout-mode", mode);
  }, [mode]);
  useEffect(() => {
    toggleDocumentAttribute("data-bs-theme", theme);
  }, [theme]);
  useEffect(() => {
    toggleDocumentAttribute("data-layout-width", layoutWidth);
  }, [layoutWidth]);
  useEffect(() => {
    toggleDocumentAttribute("data-menu-position", menu.position);
  }, [menu.position]);
  useEffect(() => {
    toggleDocumentAttribute("data-menu-color", menu.theme);
  }, [menu.theme]);
  useEffect(() => {
    toggleDocumentAttribute("data-sidenav-size", menu.size);
  }, [menu.size]);
  useEffect(() => {
    toggleDocumentAttribute("data-topbar-color", topBar.theme);
  }, [topBar.theme]);
  useEffect(() => {
    toggleDocumentAttribute("data-menu-icon", showTwoToneIcons ? "twotones" : "default");
  }, [showTwoToneIcons]);
  useEffect(() => {
    toggleDocumentAttribute("data-sidenav-user", String(showUserInfo));
  }, [showUserInfo]);

  /**
   * Open the menu when having mobile screen
   */
  const openMenu = () => {
    setIsMenuOpened(prevState => !prevState);
    if (document.body) {
      if (isMenuOpened) {
        document.body.classList.remove("sidebar-enable");
      } else {
        document.body.classList.add("sidebar-enable");
      }
    }
  };
  const isCondensed = menu.size === "condensed";
  return (
    <>
      <div id="wrapper">
        <Suspense fallback={loading()}>
          <LeftSidebar2 isCondensed={isCondensed} hideLogo={false} />
        </Suspense>

        <div className="content-page">
          <Suspense fallback={loading()}>
            <Topbar2 openLeftMenuCallBack={openMenu} />
          </Suspense>

          <div className="content">
            <Container fluid>
              <Suspense fallback={loading()}>{children}</Suspense>
            </Container>
          </div>

          <Suspense fallback={loading()}>
            <Footer />
          </Suspense>
        </div>
      </div>
      {themeCustomizer.open && (
        <Suspense fallback={loading()}>
          <RightSidebar2 />
        </Suspense>
      )}

      <Suspense fallback={loading()}>
        <Menu2 />
      </Suspense>
    </>
  );
};

export default VerticalLayout2;