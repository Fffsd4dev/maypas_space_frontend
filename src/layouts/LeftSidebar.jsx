import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import { getMenuItems } from "@/helpers/menu";

// components
import AppMenu from "./Menu";
import profileImg from "@/assets/images/users/user-1.jpg";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useLogoColor } from "@/context/LogoColorContext";

/* user box */
const UserBox = () => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant;
  const tenantFirstName = user?.tenantFirstName;
  const tenantLastName = user?.tenantLastName;
  const { colour: primary, logoImg } = useLogoColor(); // Get logo from context

  const { themeCustomizer } = useLayoutContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Profile menu items
  const ProfileMenus = useMemo(() => [
    {
      label: "Settings",
      icon: FiSettings,
      onClick: () => {
        themeCustomizer.toggle();
      },
    },
    {
      label: "Logout",
      icon: FiLogOut,
      redirectTo: `/${tenantSlug}/auth/logout`,
    },
  ], [tenantSlug, themeCustomizer]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const handleItemClick = useCallback((onClick) => {
    setDropdownOpen(false);
    if (onClick) {
      onClick();
    }
  }, []);

  const userFullName = useMemo(() => 
    `${tenantFirstName || ''} ${tenantLastName || ''}`.trim() || 'User',
    [tenantFirstName, tenantLastName]
  );

  const logoSrc = useMemo(() => {
    if (logoImg) {
      return `${import.meta.env.VITE_BACKEND_URL}/storage/uploads/tenant_logo/${logoImg}`;
    }
    return profileImg;
  }, [logoImg]);

  return (
    <div className="user-box text-center">
      <img
        src={logoSrc}
        alt={userFullName}
        title={userFullName}
        className="rounded-circle avatar-md"
        style={{ backgroundColor: '#ffffff', objectFit: 'cover' }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = profileImg;
        }}
      />
      
      <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
        <Dropdown.Toggle
          id="dropdown-notification"
          as="a"
          onClick={toggleDropdown}
          className="cursor-pointer text-light h5 mt-2 mb-1 d-block"
          style={{ textDecoration: 'none' }}
        >
          {userFullName}
        </Dropdown.Toggle>
        
        <Dropdown.Menu className="user-pro-dropdown">
          <div onClick={() => setDropdownOpen(false)}>
            {ProfileMenus.map((item, index) => {
              const Icon = item.icon;
              return item.redirectTo ? (
                <Link
                  to={item.redirectTo}
                  className="dropdown-item notify-item"
                  key={index + "-profile-menu"}
                  onClick={() => handleItemClick(item.onClick)}
                >
                  <Icon className="me-1" size={16} />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  className="dropdown-item notify-item"
                  key={index + "-profile-menu"}
                  onClick={() => handleItemClick(item.onClick)}
                  style={{ width: '100%', border: 'none', textAlign: 'left' }}
                >
                  <Icon className="me-1" size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

// Memoize UserBox
const MemoizedUserBox = React.memo(UserBox);

/* sidebar content */
const SideBarContent = () => {
  const { user } = useAuthContext();
  const tenantSlug = user?.tenant || "";
  
  // Memoize menu items
  const menuItems = useMemo(() => getMenuItems(tenantSlug), [tenantSlug]);

  return (
    <>
      <MemoizedUserBox />
      <AppMenu menuItems={menuItems} />
      <div className="clearfix" />
    </>
  );
};

const MemoizedSideBarContent = React.memo(SideBarContent);

const LeftSidebar = ({ isCondensed, hideLogo }) => {
  const menuNodeRef = useRef(null);
  const { orientation } = useLayoutContext();
  const { colour: primary } = useLogoColor();

  const handleOtherClick = useCallback((e) => {
    if (menuNodeRef.current && menuNodeRef.current.contains(e.target)) return;
    if (document.body) {
      document.body.classList.remove("sidebar-enable");
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleOtherClick, false);
    return () => {
      document.removeEventListener("mousedown", handleOtherClick, false);
    };
  }, [handleOtherClick]);

  return (
    <React.Fragment>
      <div className="app-menu" ref={menuNodeRef} style={{ backgroundColor: primary }}>
        {!hideLogo && <div className="logo-box" />}
        {!isCondensed ? (
          <SimpleBar className="scrollbar show h-100" scrollbarMaxSize={320}>
            <MemoizedSideBarContent />
          </SimpleBar>
        ) : (
          <MemoizedSideBarContent />
        )}
      </div>
    </React.Fragment>
  );
};

LeftSidebar.defaultProps = { isCondensed: false };
export default React.memo(LeftSidebar);