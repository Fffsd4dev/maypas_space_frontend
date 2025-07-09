import { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useLogoColor } from "@/context/LogoColorContext";

const formCheckDynamicStyle = `
  .form-check-input:checked {
    background-color: var(--primary-form, #fe0002) !important;
    border-color: var(--primary-form, #fe0002) !important;
  }
`;

const TopBarTheme = ({ changeTopBarTheme, theme }) => {
  const { colour: primary } = useLogoColor();

  useEffect(() => {
    const styleId = "dynamic-form-check-primary";
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = formCheckDynamicStyle;
    document.documentElement.style.setProperty(
      "--primary-form",
      primary || "#fe0002"
    );
    return () => {
      if (styleTag) styleTag.remove();
    };
  }, [primary]);

  return (
    <>
      <h6 className="fw-medium font-14 mt-4 mb-2 pb-1">Topbar</h6>

      <Form.Check className="form-check form-switch mb-1">
        <Form.Check.Input
          type="radio"
          name="topbar-color"
          id="lighttopbar-check"
          value={"light"}
          onChange={(e) => changeTopBarTheme(e.target.value)}
          checked={theme === "light"}
        />
        <Form.Check.Label htmlFor="lighttopbar-check">Light</Form.Check.Label>
      </Form.Check>

      <Form.Check className="form-check form-switch mb-1">
        <Form.Check.Input
          type="radio"
          name="topbar-color"
          id="darktopbar-check"
          value={"dark"}
          onChange={(e) => changeTopBarTheme(e.target.value)}
          checked={theme === "dark"}
        />
        <Form.Check.Label htmlFor="darktopbar-check">Dark</Form.Check.Label>
      </Form.Check>

      <Form.Check className="form-check form-switch mb-1">
        <Form.Check.Input
          type="radio"
          name="topbar-color"
          id="brandtopbar-check"
          value={"brand"}
          onChange={(e) => changeTopBarTheme(e.target.value)}
          checked={theme === "brand"}
        />
        <Form.Check.Label htmlFor="brandtopbar-check">Brand</Form.Check.Label>
      </Form.Check>
    </>
  );
};
export default TopBarTheme;
