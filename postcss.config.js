import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const restoreSource = {
  postcssPlugin: "ss-restore-source",
  OnceExit(root) {
    const input = root.source?.input;
    if (!input) return;
    root.walk((node) => {
      if (!node.source) node.source = { start: { line: 1, column: 1 }, end: { line: 1, column: 1 }, input };
    });
  },
};

export default {
  plugins: [tailwindcss(), autoprefixer(), restoreSource],
}
