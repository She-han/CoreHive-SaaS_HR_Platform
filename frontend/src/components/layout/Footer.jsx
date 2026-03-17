import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter
} from "lucide-react";

/**
 * Footer Component
 * Site-wide footer with links and company info
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-500 text-text-inverse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold">
                Core<span className="text-primary-500">Hive</span>
              </span>
            </div>
            <p className="text-blue-100 mb-6 max-w-md">
              Empowering Sri Lankan SMEs with modern, affordable HR management
              solutions. Streamline your workforce management with our
              cloud-based platform.
            </p>

            {/* Contact info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary-500" />
                <span className="text-blue-100">corehivehr@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary-500" />
                <span className="text-blue-100">+94 71 739 3080</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="text-blue-100">University of Ruhuna, Sri Lanka</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-blue-100 hover:text-primary-500 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-blue-100 hover:text-primary-500 transition-colors duration-200"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-blue-100 hover:text-primary-500 transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
           
              
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-blue-100 hover:text-primary-500 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-blue-100 hover:text-primary-500 transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="text-blue-100 hover:text-primary-500 transition-colors duration-200"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  to="/guide"
                  className="text-blue-100 hover:text-primary-500 transition-colors duration-200"
                >
                  User Guide
                </Link>
              </li>
            
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-blue-400 py-6 flex flex-col md:flex-row justify-center items-center">
          <p className="text-blue-100 text-sm">
            © {currentYear} CoreHive. All rights reserved.
          </p>

         
        </div>
      </div>
    </footer>
  );
};

export default Footer;
