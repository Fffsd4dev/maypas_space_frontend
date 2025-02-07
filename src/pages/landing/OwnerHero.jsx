import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";

import { motion } from "framer-motion";

export default function OwnersLanding() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <header className="text-center py-20 bg-blue-600 text-white">
        <h1 className="text-5xl font-bold">Build & Launch Your Own Booking Web App</h1>
        <p className="mt-4 text-lg">Maypas makes it easy for businesses to set up a multi-tenant booking system in minutes.</p>
        <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg shadow-md hover:bg-gray-200">
          Get Started
        </button>
      </header>

      {/* How It Works */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 px-10 mt-10">
          {["Subscribe", "Customize", "Launch"].map((step, index) => (
            <Card key={index} className="p-6">
              <CardContent>
                <h3 className="text-xl font-bold">Step {index + 1}: {step}</h3>
                <p className="mt-2 text-gray-600">{step} your own booking platform in a few clicks.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-200 text-center">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8 px-10 mt-10">
          {["Custom Branding", "Online Payments", "Booking Dashboard"].map((feature, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05 }} className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-bold">{feature}</h3>
              <p className="mt-2 text-gray-600">Seamless {feature.toLowerCase()} for your business.</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold">Choose a Plan</h2>
        <div className="grid md:grid-cols-3 gap-8 px-10 mt-10">
          {["Free", "Pro", "Business"].map((plan, index) => (
            <Card key={index} className="p-6 border border-gray-300">
              <CardContent>
                <h3 className="text-xl font-bold">{plan} Plan</h3>
                <p className="mt-2 text-gray-600">Best for {plan.toLowerCase()} users.</p>
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
                  Select Plan
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
