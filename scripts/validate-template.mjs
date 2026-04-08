import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    fail(`Invalid JSON: ${relative(root, path)} (${err.message})`);
    return null;
  }
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const marketplacePath = join(root, ".cursor-plugin", "marketplace.json");
if (!existsSync(marketplacePath)) {
  fail("Missing .cursor-plugin/marketplace.json");
} else {
  const marketplace = readJson(marketplacePath);
  if (marketplace) {
    if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
      fail("marketplace.json must include a non-empty plugins array");
    } else {
      for (const plugin of marketplace.plugins) {
        if (!plugin?.name || !plugin?.path) {
          fail("Each marketplace plugin entry needs name and path");
          continue;
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plugin.name)) {
          fail(`Plugin name must be kebab-case: ${plugin.name}`);
        }
        const pluginDir = join(root, plugin.path);
        if (!existsSync(pluginDir)) {
          fail(`Plugin path missing: ${plugin.path}`);
          continue;
        }

        const pluginJsonPath = join(pluginDir, ".cursor-plugin", "plugin.json");
        if (!existsSync(pluginJsonPath)) {
          fail(`Missing plugin manifest: ${relative(root, pluginJsonPath)}`);
          continue;
        }
        const pluginJson = readJson(pluginJsonPath);
        if (!pluginJson) continue;

        for (const required of ["name", "displayName", "version", "description", "logo"]) {
          if (!pluginJson[required]) {
            fail(`Missing ${required} in ${relative(root, pluginJsonPath)}`);
          }
        }

        if (pluginJson.name !== plugin.name) {
          fail(
            `Plugin name mismatch: marketplace=${plugin.name}, plugin.json=${pluginJson.name}`
          );
        }

        const logoPath = join(pluginDir, pluginJson.logo || "");
        if (!pluginJson.logo || !existsSync(logoPath)) {
          fail(`Logo path not found: ${relative(root, logoPath)}`);
        }

        const mcpConfigPath = join(pluginDir, "mcp.json");
        if (!existsSync(mcpConfigPath)) {
          fail(`Missing plugin MCP config: ${relative(root, mcpConfigPath)}`);
        }

        for (const contentFolder of ["rules", "skills", "agents"]) {
          const folderPath = join(pluginDir, contentFolder);
          if (!existsSync(folderPath)) continue;
          const files = walk(folderPath).filter((f) => statSync(f).isFile());
          for (const file of files) {
            if (!(file.endsWith(".md") || file.endsWith(".mdc"))) continue;
            const text = readFileSync(file, "utf8");
            if (!text.startsWith("---")) {
              fail(`Missing frontmatter in ${relative(root, file)}`);
            }
          }
        }
      }
    }
  }
}

if (failures.length) {
  console.error("Template validation failed:");
  for (const msg of failures) console.error(`- ${msg}`);
  process.exit(1);
}

console.log("Template validation passed.");
