import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  BarChart3,
  Clock,
  Shield,
  Award,
  Building2,
  TrendingUp,
  Briefcase,
  UserCheck,
  Calendar,
  PieChart
} from "lucide-react";

const MarqueeItem = ({ items, from, to, isIcon = false }) => {
  return (
    <div className="flex overflow-hidden">
      <motion.div
        initial={{ x: `${from}` }}
        animate={{ x: `${to}` }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="flex shrink-0"
      >
        {items.map((item, index) => {
          if (isIcon) {
            const IconComponent = item.icon;
            return (
              <div
                className="flex items-center justify-center h-24 pr-20 opacity-25 hover:opacity-60 transition-opacity duration-300"
                key={index}
              >
                <IconComponent className="w-16 h-16 text-primary-400" />
              </div>
            );
          }

          return (
            <div
              className={`flex items-center justify-center h-16 pr-16 whitespace-nowrap opacity-25 hover:opacity-50 transition-opacity duration-300 ${item.style}`}
              key={index}
            >
              {item.text}
            </div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ x: `${from}` }}
        animate={{ x: `${to}` }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="flex shrink-0"
      >
        {items.map((item, index) => {
          if (isIcon) {
            const IconComponent = item.icon;
            return (
              <div
                className="flex items-center justify-center h-24 pr-20 opacity-25 hover:opacity-60 transition-opacity duration-300"
                key={index}
              >
                <IconComponent className="w-16 h-16 text-primary-400" />
              </div>
            );
          }

          return (
            <div
              className={`flex items-center justify-center h-16 pr-16 whitespace-nowrap opacity-25 hover:opacity-50 transition-opacity duration-300 ${item.style}`}
              key={index}
            >
              {item.text}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

const Marquee = () => {
  const iconMarquee = [
    { icon: Users },
    { icon: DollarSign },
    { icon: BarChart3 },
    { icon: Clock },
    { icon: Shield },
    { icon: Award },
    { icon: Building2 },
    { icon: TrendingUp },
    { icon: Briefcase },
    { icon: UserCheck },
    { icon: Calendar },
    { icon: PieChart }
  ];

  return (
    <div className="container mx-auto overflow-hidden py-8 bg-gradient-to-r from-background-primary via-background-white to-background-primary">
      <MarqueeItem items={iconMarquee} from={0} to={"-100%"} isIcon={true} />
    </div>
  );
};

export default Marquee;
