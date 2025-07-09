import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import classNames from "classnames";
import { toast } from "react-toastify";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { useLogoColor } from "../context/LogoColorContext";

const ProfileDropdown = (props) => {
  const profilePic = props["profilePic"] || null;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logoImg } = useLogoColor();
  const { colour: primary } = useLogoColor();

  // Inject dynamic nav-link style for primary color
  useEffect(() => {
    const styleId = "dynamic-nav-link-primary";
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      .nav-link.custom-primary {
        transition: color 0.2s;
      }
      .nav-link.custom-primary.show {
        color: ${primary} !important;
      }
      .nav-link.custom-primary:hover,
      .nav-link.custom-primary:focus {
        color: ${primary} !important;
      }
    `;
    return () => {
      if (styleTag) styleTag.remove();
    };
  }, [primary]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const { user } = useAuthContext();
  const { tenantSlug: tenantUrlSlug, category } = useParams();

  const tenantSlug = user?.tenant || tenantUrlSlug;

  return (
    <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
      <Dropdown.Toggle
        id="dropdown-profile"
        as="a"
        onClick={toggleDropdown}
        className={classNames(
          "nav-link",
          "custom-primary", // <-- add this class
          "nav-user me-0 waves-effect waves-light",
          {
            show: dropdownOpen,
          }
        )}
      >
        {logoImg ? (
          <img
            src={
              logoImg
                ? `${import.meta.env.VITE_BACKEND_URL}/storage/uploads/tenant_logo/${logoImg}`
                : profilePic
            }
            alt=""
            className="rounded-circle avatar-md"
          />
        ) : (
          <img src={profilePic} alt="" className="" />
        )}
        <span className="pro-user-name ms-1">
          Welcome, {props["username"]} <i className="mdi mdi-chevron-down"></i>
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu dropdown-menu-end profile-dropdown">
        <div onClick={toggleDropdown}>
          <div className="dropdown-header noti-title">
            <h6 className="text-overflow m-0">Welcome !</h6>
          </div>
          {(props.menuItems || []).map((item, i) => {
            return (
              <React.Fragment key={i}>
                {i === props["menuItems"].length - 1 && (
                  <div className="dropdown-divider"></div>
                )}
                <Link
                  to={item.redirectTo}
                  onClick={item.onClick}
                  className="dropdown-item notify-item"
                  key={i + "-profile-menu"}
                >
                  <i className={`${item.icon} me-1`}></i>
                  <span>{item.label}</span>
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};
export default ProfileDropdown;