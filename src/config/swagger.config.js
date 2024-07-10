export const swaggerOpts = {
    definition: {
      openapi: "3.0.1",
      info: {
        title: "Documentacion - Proyecto Final [Ingresa primero para usar todas las opciones]",
        description: "Documentacion de la API del Proyecto Final",
        version: "1.0.0",
      },
    },
    apis: [`./src/docs/**/*.yml`],
    withCredentials: true,
  };