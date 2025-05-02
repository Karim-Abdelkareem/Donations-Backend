import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Donation API",
      version: "1.0.0",
      description: "API documentation for Donation backend",
    },
    servers: [
      {
        url: "http://localhost:5000", // or your deployed Vercel URL
      },
    ],
  },
  apis: ["./src/modules/**/*.js"], // <-- This must point to files with JSDoc comments
};

const specs = swaggerJsdoc(options);
export { swaggerUi, specs };
