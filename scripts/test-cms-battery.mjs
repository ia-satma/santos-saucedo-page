import { spawnSync } from "node:child_process";

const root = process.cwd();
const requireAdminVisual = process.env.CMS_BATTERY_REQUIRE_AUTH === "true";

const commands = [
  ["TypeScript", "npm", ["run", "check"]],
  ["Build", "npm", ["run", "build"]],
  ["Replit preflight", "npm", ["run", "replit:preflight"]],
  ["CMS flows", "npm", ["run", "test:cms"]],
  ["Access and permissions", "npm", ["run", "test:access"]],
  ["Admin panel contracts", "npm", ["run", "test:panel"]],
  ["Agent contracts", "npm", ["run", "test:agents"]],
  ["Localization", "npm", ["run", "test:localization"]],
  ["Public flows", "npm", ["run", "test:public-flows"]],
  ["Testimonials", "npm", ["run", "test:testimonials"]],
  ["Video source links", "npm", ["run", "test:video-source"]],
  ["Presentation reference template", "npm", ["run", "test:presentation:reference"]],
  ["Social reference kit", "npm", ["run", "test:social:reference"]],
  ["Documents", "npm", ["run", "test:documents-api"]],
  ["Social studio", "npm", ["run", "test:social-studio"]],
  ["Signatures", "npm", ["run", "test:signatures-api"]],
  ["Privacy", "npm", ["run", "test:privacy"]],
  ["Dependency audit", "npm", ["audit", "--audit-level=moderate"]],
];

if (process.env.ADMIN_VISUAL_TOKEN || requireAdminVisual) {
  commands.push(["Authenticated admin visual matrix", "npm", ["run", "test:visual:admin"]]);
}

const failures = [];
for (const [label, command, args] of commands) {
  process.stdout.write(`\n=== ${label} ===\n`);
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  if (result.status !== 0) failures.push(label);
}

if (requireAdminVisual && !process.env.ADMIN_VISUAL_TOKEN) {
  failures.push("Authenticated admin visual matrix missing ADMIN_VISUAL_TOKEN");
}

if (failures.length) {
  console.error(`\nCMS BATTERY FAILED (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`\nCMS BATTERY PASSED (${commands.length} checks)`);
