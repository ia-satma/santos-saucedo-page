import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

// Replit serves the generated static API beside the server. Load the CMS defaults from there
// at runtime so the Node executable does not embed the same large JSON as the browser bundle.
const runtimeCmsDefaultsPlugin = {
  name: "runtime-cms-defaults",
  setup(build: any) {
    build.onLoad({ filter: /[\\/]shared[\\/]cms-defaults\.json$/ }, async () => ({
      loader: "js",
      contents: `
        import { readFileSync } from "node:fs";
        import path from "node:path";
        const files = [
          path.resolve(process.cwd(), "shared/cms-defaults.json"),
          path.resolve(process.cwd(), "dist/public/static-api/site-config.json"),
          path.join(__dirname, "public/static-api/site-config.json"),
        ];
        let value = {};
        for (const file of files) {
          try {
            const parsed = JSON.parse(readFileSync(file, "utf8"));
            value = parsed?.content && typeof parsed.content === "object" ? parsed.content : parsed;
            if (value && typeof value === "object" && Object.keys(value).length) break;
          } catch {}
        }
        export default value;
      `,
    }));
  },
};

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  // Replit installs package.json dependencies for the build and runtime. Keeping them external
  // makes the server artifact small enough to avoid the deployment bundle warning.
  const externals = allDeps;

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    plugins: [runtimeCmsDefaultsPlugin],
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
