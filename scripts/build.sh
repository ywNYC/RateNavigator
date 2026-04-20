#!/usr/bin/env bash
# Build Rate Navigator from a single JSX source file into a zero-deps HTML file.
# The output in dist/index.html uses CDN-hosted React + Babel-standalone and
# can be opened directly in a browser or deployed as a static site.

set -euo pipefail

SRC="src/rate-navigator.jsx"
OUT="dist/index.html"

if [[ ! -f "$SRC" ]]; then
  echo "error: $SRC not found — run this from the repo root" >&2
  exit 1
fi

mkdir -p dist

cat > "$OUT" << 'HEAD'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<title>利率导航 · Rate Navigator</title>
<meta name="description" content="NYC mortgage calculator with scenario comparison, closing-cost breakdown, ARM navigation, and 1031 exchange analysis."/>
<meta name="theme-color" content="#2F5D3C"/>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%232F5D3C'/><path d='M16 6L8 14V26H12V20H20V26H24V14L16 6Z' fill='white'/></svg>"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#F5F1E8;overflow-x:hidden;-webkit-font-smoothing:antialiased}
  #root{min-height:100vh}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.0.0-beta.6/Recharts.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
HEAD

# Strip ESM imports (drop everything up to & including the recharts import line)
# and rewrite bare React/recharts references to their globals.
sed '1,/^} from "recharts";$/d' "$SRC" \
  | sed 's/export default //' \
  | sed 's/\buseState\b/React.useState/g' \
  | sed 's/\buseMemo\b/React.useMemo/g' \
  | sed 's/\buseCallback\b/React.useCallback/g' \
  | sed 's/\buseRef\b/React.useRef/g' \
  | sed 's/\buseEffect\b/React.useEffect/g' \
  | sed 's/\bAreaChart\b/Recharts.AreaChart/g' \
  | sed 's/<Area\b/<Recharts.Area/g' \
  | sed 's|</Area>|</Recharts.Area>|g' \
  | sed 's/\bXAxis\b/Recharts.XAxis/g' \
  | sed 's/\bYAxis\b/Recharts.YAxis/g' \
  | sed 's/\bTooltip\b/Recharts.Tooltip/g' \
  | sed 's/\bResponsiveContainer\b/Recharts.ResponsiveContainer/g' \
  | sed 's/\bCartesianGrid\b/Recharts.CartesianGrid/g' \
  | sed 's/\bReferenceLine\b/Recharts.ReferenceLine/g' \
  >> "$OUT"

cat >> "$OUT" << 'TAIL'

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
</script>
</body>
</html>
TAIL

lines=$(wc -l < "$OUT")
bytes=$(wc -c < "$OUT")
echo "✓ Built: $OUT  (${lines} lines, $(( bytes / 1024 )) KB)"
