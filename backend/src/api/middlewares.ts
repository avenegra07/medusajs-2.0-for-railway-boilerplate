import { defineMiddlewares } from "@medusajs/utils";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/",
      middlewares: [
        (req, res, next) => {
          // CSP personalizada para resolver el bloqueo de scripts
          res.setHeader(
            "Content-Security-Policy",
            `default-src 'self'; ` +
            `script-src-elem 'self' 'unsafe-inline' 'sha256-ZswfTY7H35rbv8WC7NXBoiC7WNu86vSzCDChNWwZZDM=' https: http:; ` +
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; ` +
            `img-src 'self' data: https: http:; ` +
            `style-src 'self' 'unsafe-inline' https: http:; ` +
            `font-src 'self' data: https: http:; ` +
            `connect-src 'self' https: http: ws: wss:; ` +
            `frame-src 'self' https:;`
          );
          next();
        },
      ],
    },
    // Aplica a todas las rutas del admin y store
    {
      matcher: "/admin*",
      middlewares: [
        (req, res, next) => {
          res.setHeader(
            "Content-Security-Policy",
            `default-src 'self'; ` +
            `script-src-elem 'self' 'unsafe-inline' 'sha256-ZswfTY7H35rbv8WC7NXBoiC7WNu86vSzCDChNWwZZDM=' https: http:; ` +
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; ` +
            `img-src 'self' data: https: http:; ` +
            `style-src 'self' 'unsafe-inline' https: http:; ` +
            `font-src 'self' data: https: http:; ` +
            `connect-src 'self' https: http: ws: wss:; ` +
            `frame-src 'self' https:;`
          );
          next();
        },
      ],
    },
    {
      matcher: "/store*",
      middlewares: [
        (req, res, next) => {
          res.setHeader(
            "Content-Security-Policy",
            `default-src 'self'; ` +
            `script-src-elem 'self' 'unsafe-inline' 'sha256-ZswfTY7H35rbv8WC7NXBoiC7WNu86vSzCDChNWwZZDM=' https: http:; ` +
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; ` +
            `img-src 'self' data: https: http:; ` +
            `style-src 'self' 'unsafe-inline' https: http:; ` +
            `font-src 'self' data: https: http:; ` +
            `connect-src 'self' https: http: ws: wss:; ` +
            `frame-src 'self' https:;`
          );
          next();
        },
      ],
    },
  ],
});
