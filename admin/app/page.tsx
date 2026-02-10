'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Users, 
  BarChart3, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Phone,
  Mail,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Award,
  ChevronDown,
  Building2,
  LogIn
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showHeroDropdown, setShowHeroDropdown] = useState(false);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.login-dropdown') && !target.closest('.login-button')) {
        setShowLoginDropdown(false);
        setShowHeroDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-red-500" />,
      title: "Role-Based Access Control",
      description: "Secure multi-level access with SuperAdmin, Admin, Operations, Safety, and PR roles"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Personnel Management",
      description: "Comprehensive staff management with station and department assignments"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-500" />,
      title: "Real-time Analytics",
      description: "Live dashboards with key performance indicators and operational metrics"
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
      title: "Incident Management",
      description: "Track and manage emergency responses with real-time status updates"
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-500" />,
      title: "24/7 Operations",
      description: "Round-the-clock monitoring with watchroom and crew coordination"
    },
    {
      icon: <MapPin className="w-8 h-8 text-orange-500" />,
      title: "Station Management",
      description: "Multi-station operations with location-based resource allocation"
    }
  ];

  const roles = [
    {
      title: "Super Admin",
      description: "Full system access and configuration",
      color: "from-red-500 to-red-600",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "Station Admin",
      description: "Station-level management and oversight",
      color: "from-blue-500 to-blue-600",
      icon: <Users className="w-6 h-6" />
    },
    {
      title: "Operations",
      description: "Incident response and field operations",
      color: "from-green-500 to-green-600",
      icon: <AlertTriangle className="w-6 h-6" />
    },
    {
      title: "Safety Officer",
      description: "Compliance monitoring and safety protocols",
      color: "from-yellow-500 to-yellow-600",
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: "Public Relations",
      description: "Media management and communications",
      color: "from-purple-500 to-purple-600",
      icon: <Globe className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  GNFS Dashboard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ghana National Fire Service</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                className="login-button bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Access Dashboard
                <ChevronDown className={`w-4 h-4 transition-transform ${showLoginDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showLoginDropdown && (
                <div className="login-dropdown absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="py-2">
                    <Link
                      href="/super-admin/login"
                      onClick={() => setShowLoginDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Shield className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Super Admin</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">System administrators</div>
                      </div>
                    </Link>
                    <Link
                      href="/station-admin/login"
                      onClick={() => setShowLoginDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                    >
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Station Admin</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Fire station managers</div>
                      </div>
                    </Link>
                    <Link
                      href="/fire-personnel/login"
                      onClick={() => setShowLoginDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                    >
                      <Users className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Fire Personnel</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Operations & staff</div>
                      </div>
            </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Next-Generation Fire Service Management
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Empowering Ghana's
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"> Fire Service</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              A comprehensive management system designed to streamline operations, enhance safety protocols, 
              and improve emergency response coordination across all GNFS stations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/super-admin/login"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Fire Stations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">2,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Personnel</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Operations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Comprehensive Management Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform provides everything needed to manage fire service operations efficiently and effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Multi-Role Access System
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Tailored dashboards and permissions for different organizational roles and responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {roles.map((role, index) => (
              <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200 text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4`}>
                  {role.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {role.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join the GNFS management system and experience the future of fire service operations.
          </p>
          <Link 
            href="/super-admin/login"
            className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            Access Dashboard Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">GNFS Dashboard</h3>
                  <p className="text-gray-400 text-sm">Ghana National Fire Service</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering Ghana's fire service with modern technology and comprehensive management tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+233 302 123 456</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@gnfs.gov.gh</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Accra, Ghana</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="/super-admin/login" className="block hover:text-white transition-colors">Super Admin Login</Link>
                <Link href="/station-admin/login" className="block hover:text-white transition-colors">Station Admin Login</Link>
                <Link href="/fire-personnel/login" className="block hover:text-white transition-colors">Fire Personnel Login</Link>
                <a href="#" className="block hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ghana National Fire Service. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;