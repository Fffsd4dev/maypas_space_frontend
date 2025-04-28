import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function OwnersLanding() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      {/* Hero Section */}
      <header className="text-center py-20">
        <motion.h1
          className="text-5xl font-bold"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Build & Launch Your Own Booking Web App
        </motion.h1>
        <motion.p
          className="mt-4 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Maypas makes it easy for businesses to set up a multi-tenant booking system in minutes.
        </motion.p>
        <motion.button
          className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg shadow-md hover:bg-gray-200"
          whileHover={{ scale: 1.1 }}
        >
          Get Started
        </motion.button>
      </header>

      {/* Slider Section */}
      <section className="py-16">
        <Slider {...sliderSettings}>
          <div className="text-center">
            <h2 className="text-3xl font-bold">Custom Branding</h2>
            <p className="mt-2">Easily customize your platform to match your brand.</p>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold">Online Payments</h2>
            <p className="mt-2">Accept payments seamlessly with integrated solutions.</p>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold">Booking Dashboard</h2>
            <p className="mt-2">Manage all your bookings in one place.</p>
          </div>
        </Slider>
      </section>
    </div>
  );
}