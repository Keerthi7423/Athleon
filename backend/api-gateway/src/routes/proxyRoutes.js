"use strict";

const { createProxyMiddleware } = require("http-proxy-middleware");

function createServiceProxy(target, routeName) {
  if (!target) {
    throw new Error(`Missing target URL for ${routeName} service`);
  }

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 8000,
    timeout: 8000,
    on: {
      error(err, req, res) {
        const statusCode = 502;
        res.status(statusCode).json({
          error: `${routeName} service unavailable`
        });
      }
    }
  });
}

module.exports = {
  createServiceProxy
};
