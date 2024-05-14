import Fastify from "fastify";

const PORT = 3636;

const app = Fastify({
  logger: false,
});

app.get("/", () => {
  return { hello: "world" };
});

await app.listen({ port: PORT });

console.log(`Server listening on port ${PORT}`);
