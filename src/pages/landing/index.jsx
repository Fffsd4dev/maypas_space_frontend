import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// components
import Clients from "./Clients";
import ContactUs from "./ContactUs";
import FAQ from "./FAQ";
import Features from "./Features";
import Footer from "./Footer";
import OwnersLanding from "./OwnerHero";
import NavBar from "./NavBar";
import Pricing from "./Pricing";
import Services from "./Services";
import Testimonial from "./Testimonial";

// dummy data
import { features, rawFaqs, services, testimonial } from "./data";

const Landing = () => {
  useEffect(() => {
    if (document.body) document.body.classList.remove("authentication-bg", "authentication-bg-pattern");

    // manage go to top button
    let mybutton = document.getElementById("back-to-top-btn");
    window.addEventListener("scroll", () => {
      if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        mybutton.style.display = "block";
      } else {
        mybutton.style.display = "none";
      }
    });
  }, []);

  const topFunction = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  return (
    <motion.div
      id="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="bg-gray-50"
    >
      {/* Navbar */}
      <NavBar />

      {/* Hero Section */}
      <OwnersLanding />

      {/* Clients */}
      <Clients />

      {/* Services */}
      <Services services={services} />

      {/* Features */}
      <Features features={features} />

      {/* Pricing */}
      <Pricing />

      {/* FAQs */}
      <FAQ rawFaqs={rawFaqs} />

      {/* Testimonials */}
      <Testimonial testimonial={testimonial} />

      {/* Contact */}
      <ContactUs />

      {/* Footer */}
      <Footer />

      {/* Back to Top Button */}
      <Link
        to="#"
        onClick={() => topFunction()}
        className="back-to-top-btn btn btn-primary fixed bottom-5 right-5 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        id="back-to-top-btn"
        style={{ display: "none" }}
      >
        <i className="mdi mdi-chevron-up text-2xl"></i>
      </Link>
    </motion.div>
  );
};

export default Landing;