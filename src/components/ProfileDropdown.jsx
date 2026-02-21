import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import classNames from "classnames";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useLogoColor } from "../context/LogoColorContext";

const ProfileDropdown = (props) => {
  const profilePic = props["profilePic"] || null;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logoImg, colour: primary } = useLogoColor();
  const { user } = useAuthContext();
  const { tenantSlug: tenantUrlSlug } = useParams();
  const styleInjected = useRef(false);

  const tenantSlug = user?.tenant || tenantUrlSlug;

  // Inject dynamic nav-link style for primary color - only once
  useEffect(() => {
    if (styleInjected.current) return;
    
    const styleId = "dynamic-nav-link-primary";
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    
    // Set the style content with the current primary color
    styleTag.innerHTML = `
      .nav-link.custom-primary {
        transition: color 0.2s;
      }
      .nav-link.custom-primary.show,
      .nav-link.custom-primary:hover,
      .nav-link.custom-primary:focus {
        color: ${primary} !important;
      }
    `;
    
    styleInjected.current = true;
    
    // Update style if primary changes
    const updateStyle = () => {
      if (styleTag) {
        styleTag.innerHTML = `
          .nav-link.custom-primary {
            transition: color 0.2s;
          }
          .nav-link.custom-primary.show,
          .nav-link.custom-primary:hover,
          .nav-link.custom-primary:focus {
            color: ${primary} !important;
          }
        `;
      }
    };
    
    // Only update if primary changes after initial injection
    return () => {
      // Cleanup not needed on unmount as we want to keep styles
      // for other components that might use the same class
    };
  }, [primary]); // Still need to update when primary changes

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const handleItemClick = useCallback((onClick) => {
    setDropdownOpen(false);
    if (onClick) {
      onClick();
    }
  }, []);

  return (
    <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
      <Dropdown.Toggle
        id="dropdown-profile"
        as="a"
        onClick={toggleDropdown}
        className={classNames(
          "nav-link",
          "custom-primary",
          "nav-user me-0 waves-effect waves-light",
          {
            show: dropdownOpen,
          }
        )}
        style={{ cursor: 'pointer' }}
      >
        {logoImg ? (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/storage/uploads/tenant_logo/${logoImg}`}
            alt="Company Logo"
            className="rounded-circle avatar-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = profilePic || '/default-avatar.png';
            }}
          />
        ) : (
          <img 
            src={profilePic || '/default-avatar.png'} 
            alt="Profile" 
            className="rounded-circle avatar-md"
          />
        )}
        <span className="pro-user-name ms-1" style={{ color: '#ffffff' }}>
          Welcome, {props["username"] || 'User'} <i className="mdi mdi-chevron-down"></i>
        </span>
      </Dropdown.Toggle>
      
      <Dropdown.Menu className="dropdown-menu dropdown-menu-end profile-dropdown">
        <div onClick={() => setDropdownOpen(false)}>
          <div className="dropdown-header noti-title">
            <h6 className="text-overflow m-0">Welcome!</h6>
          </div>
          
          {(props.menuItems || []).map((item, i) => {
            const isLast = i === (props.menuItems?.length || 0) - 1;
            
            return (
              <React.Fragment key={i}>
                {isLast && <div className="dropdown-divider" />}
                {item.redirectTo ? (
                  <Link
                    to={item.redirectTo}
                    className="dropdown-item notify-item"
                    onClick={() => handleItemClick(item.onClick)}
                  >
                    <i className={`${item.icon} me-1`}></i>
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    className="dropdown-item notify-item"
                    onClick={() => handleItemClick(item.onClick)}
                    style={{ width: '100%', border: 'none', textAlign: 'left' }}
                  >
                    <i className={`${item.icon} me-1`}></i>
                    <span>{item.label}</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ProfileDropdown);