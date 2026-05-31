import type {
  MiddlewaresConfig,
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http";

async function logger(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  console.log("Request received");
  next();
}

export const config: MiddlewaresConfig = {
  routes: [
    {
      matcher: "/store/custom",
      middlewares: [logger],
    },
  ],
};
