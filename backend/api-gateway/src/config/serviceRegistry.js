"use strict";

function getServiceUrl(envKey, fallbackUrl) {
  const value = process.env[envKey];
  if (value && value.trim()) {
    return value;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[gateway-config] ${envKey} is not set. Using fallback ${fallbackUrl}`);
  }

  return fallbackUrl;
}

const services = {
  auth: {
    route: "/auth",
    target: getServiceUrl("AUTH_SERVICE_URL", "http://localhost:4001")
  },
  fatigue: {
    route: "/fatigue",
    target: getServiceUrl("FATIGUE_SERVICE_URL", "http://localhost:4002")
  },
  emi: {
    route: "/emi",
    target: getServiceUrl("EMI_SERVICE_URL", "http://localhost:4003")
  },
  analytics: {
    route: "/analytics",
    target: getServiceUrl("ANALYTICS_SERVICE_URL", "http://localhost:4000")
  }
};

module.exports = services;
