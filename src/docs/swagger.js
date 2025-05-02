// import swaggerJSDoc from "swagger-jsdoc";

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Donation API",
//       version: "1.0.0",
//       description: "توثيق API الخاص بمشروع التبرع",
//     },
//     servers: [
//       {
//         url: "https://your-vercel-domain.vercel.app/api", // عدل الرابط بعد النشر
//       },
//       {
//         url: "http://localhost:5001/api", // للسيرفر المحلي أثناء التطوير
//       },
//     ],
//   },
//   apis: ["./src/modules/**/*.js"], // مسارات ملفات الراوتات
// };

// const swaggerSpec = swaggerJSDoc(options);

// export default swaggerSpec;
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "https://your-vercel-domain.vercel.app/api", // عدل الرابط بعد النشر
      },
      {
        url: "http://localhost:3000", // replace with Vercel URL in prod
      },
    ],
  },
  apis: ["./routes/*.js"], // adjust path if needed
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
