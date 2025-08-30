import * as React from "react";

const Card = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`rounded-xl border bg-white shadow-sm p-6 ${className}`} {...props} />
));
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-4 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardContent };
