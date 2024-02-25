import fs from "node:fs";
import { createServer } from "node:http";
import handler from "serve-handler";

const port = 50000 + Math.floor(Math.random() * 10000);

const server = createServer(async (request, response) => {
	await handler(request, response, {
		public: "dist",
	});
});

await new Promise<void>((resolve) => server.listen(port, resolve));

const res = await fetch(`http://localhost:${port}`);
const html = await res.text();
fs.writeFileSync("dist/index.html", html.replace(/href="&#47;/g, 'href=".&#47;'));
server.close();
