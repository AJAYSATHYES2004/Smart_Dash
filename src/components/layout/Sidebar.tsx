import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Navigation,
  User,
  Car,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/zone-control', icon: MapPin, label: 'Zone Control' },
    { to: '/navigation', icon: Navigation, label: 'Navigation' },
    { to: '/drowsiness-monitor', icon: Eye, label: 'Drowsiness Monitor' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/car-details', icon: Car, label: 'Car Details' },
    { to: '/insurance', icon: Shield, label: 'Insurance' },
    { to: '/rc-book', icon: FileText, label: 'RC Book' },
  ];

  const NavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({
    to,
    icon: Icon,
    label
  }) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive
          ? 'bg-primary/20 text-primary neon-glow'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-5 h-5" />
          <span className="font-medium flex-1">{label}</span>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ChevronRight className="w-4 h-4 text-primary" />
            </motion.div>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className={`h-full flex flex-col bg-sidebar border-r border-sidebar-border ${isMobile ? 'w-full' : 'w-64'
      }`}>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center neon-glow border border-primary/20">
            <img src="/logo.png" alt="Smart Dash Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">Smart Dash</h1>
            <p className="text-xs text-muted-foreground">Digital Cockpit</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
