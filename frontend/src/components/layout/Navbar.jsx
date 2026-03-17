import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, Menu, X } from "lucide-react";
import Logo from "../../assets/logo_full.png";

import {
  logout,
  selectUser,
  selectIsAuthenticated
} from "../../store/slices/authSlice";

/**
 * Navigation Bar Component
 * Site-wide Navigation
 * Responsive navbar for site-wide navigation
 * Adaptive menu based on authentication and user role
 */
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { name: "Home", href: "/" },
    
    { name: "Careers", href: "/careers" },
    { name: "User Guide", href: "/guide" },
    { name: "About Us", href: "/about" }
  ];

  const getDashboardPath = () => {
    switch (user?.role) {
      case "SYS_ADMIN":
        return "/sys_admin/dashboard";
      case "ORG_ADMIN":
        return "/org_admin/dashboard";
      case "HR_STAFF":
        return "/hr_staff/dashboard";
      case "EMPLOYEE":
        return "/employee/profile";
      default:
        return "/dashboard";
    }
  };

  const isLinkActive = (href) => {
    if (href === "/") {
      return location.pathname === "/" && !location.hash;
    }

  

    return location.pathname === href;
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle user logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#0C397A] backdrop-blur-lg bg-opacity-95 shadow-lg border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src={Logo} alt="CoreHive Logo" className="w-45 " />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-300 relative group ${
                  isLinkActive(item.href)
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.name}
                <span
                  className={`absolute left-4 right-4 -bottom-0.5 h-0.5 bg-[#02C39A] transition-transform duration-300 origin-left ${
                    isLinkActive(item.href)
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right side - Auth buttons or dashboard/logout */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              // Guest user buttons
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-semibold border-1 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#02C39A] to-[#1ED292] rounded-lg hover:scale-105 transition-all duration-300">
                    Get Started
                  </button>
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to={getDashboardPath()}>
                  <button className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#02C39A] to-[#1ED292] rounded-lg shadow-lg shadow-[#02C39A]/30 hover:shadow-xl hover:shadow-[#02C39A]/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0C397A]/98 backdrop-blur-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-300 ${
                    isLinkActive(item.href)
                      ? "text-white bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={handleMenuClose}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile auth buttons */}
              {!isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-300"
                    onClick={handleMenuClose}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-[#02C39A] to-[#1ED292] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleMenuClose}
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Link
                    to={getDashboardPath()}
                    className="block w-full text-center px-4 py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-300"
                    onClick={handleMenuClose}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-[#02C39A] to-[#1ED292] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
