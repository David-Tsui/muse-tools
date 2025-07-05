/**
 * snapshot.js
 * 用途：掃描任意 JS/TS/Vue 專案，輸出專案結構、函式清單與依賴清單至 snapshot.md
 * 使用方式：在專案根目錄執行 `node snapshot.js`
 * 僅依賴 Node.js 內建模組：fs, path
 */

///////////////////////////////////////
// 1. 可編輯設定區
///////////////////////////////////////

/**
 * 要排除掃描的檔案或資料夾（相對於專案根目錄）
 * 使用者可自行新增或移除
 */
const EXCLUDES = ["node_modules", ".git", "dist", "build", "snapshot.js", ".spec.ts", ".test.ts"];

/** 支援的檔案副檔名，可按需擴充 */
const FILE_EXTENSIONS = [".js", ".ts", ".vue"];

/** 目錄樹最大深度，0 或 null 表示不限 */
const MAX_DEPTH = 0;

/** 解析規則：Controller 物件模式與 Export 函式模式 */
const PARSERS = {
  controller: {
    test: /(?:module\.exports\s*=\s*|\bexport\s+default\s*)\{/,
    // 方法名稱與參數
    regex: /(\w+)\s*:\s*(?:async\s*)?function\s*(?:\w*)\s*\(([^)]*)\)(?:\s*:\s*[\w<>\[\],\s\|]+)?/g,
    comment: /\/\/\s*(.*)/,
  },
  export: {
    test: /export\s+(?:async\s+)?(?:function|const)/,
    // 支援 TypeScript 泛型、回傳型別、箭頭函式、型別標註
    // export function foo<T>(a: T): number {}
    // export const bar = <T>(x: T): void => {}
    regex:
      /export\s+(?:async\s+)?function\s+.*(\w|\})?\s?\{|export\s+const\s+(\w+)\s*=\s*(?:async\s*)?(<[^>]+>)?\s*\(?([^)]*)\)?\s*(?::\s*[\w<>\[\],\s\|]+)?\s*/g,
    comment: /\/\/\s*(.*)/,
  },
};

///////////////////////////////////////
// 2. 引入 Node 內建模組
///////////////////////////////////////
const fs = require("fs");
const path = require("path");

///////////////////////////////////////
// 3. 判斷是否排除路徑
///////////////////////////////////////
function isExcluded(filePath) {
  return EXCLUDES.some((ex) => filePath.includes(ex));
}

///////////////////////////////////////
// 4. 遞迴掃描檔案
///////////////////////////////////////
function scanFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir);
  for (const name of entries) {
    const fullPath = path.join(dir, name);

    if (isExcluded(fullPath)) continue;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanFiles(fullPath, fileList);
    } else if (FILE_EXTENSIONS.includes(path.extname(name))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

///////////////////////////////////////
// 5. 解析檔案中函式／方法
///////////////////////////////////////
function parseFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  let parser = null;
  if (PARSERS.controller.test.test(content)) {
    parser = PARSERS.controller;
  } else if (PARSERS.export.test.test(content)) {
    parser = PARSERS.export;
  } else {
    return []; // 無匹配解析模式
  }

  const lines = content.split(/\r?\n/);
  const results = [];

  lines.forEach((line, idx) => {
    parser.regex.lastIndex = 0;
    let match;
    while ((match = parser.regex.exec(line)) !== null) {
      // 取出整段函式簽名
      // 例如：export function foo<T>(a: T): number {
      const signature = match[0]
        // 去除開頭的 export function 或 export const
        .replace(/^\s*export\s+(function|const)\s+/, "")
        // 去除函式簽名結尾的 \s+{
        .replace(/\s*{\s*$/, "")
        // 去除箭頭函式指派 =
        .replace(/\s+=\s+/, "")
        // 補上針對 '<', '>' 的跳脫字元
        .replace(/\<T\>/g, "\\<T\\>")
        .trim()

      // 嘗試讀取上一行的單行註解
      let comment = "";
      if (idx > 0) {
        const prev = lines[idx - 1].match(parser.comment);
        if (prev) comment = prev[1].trim();
      }
      results.push({ signature, comment });
    }
  });

  return results;
}

///////////////////////////////////////
// 6. 生成 ASCII 目錄樹
///////////////////////////////////////
function buildTree(dir, prefix = "", depth = 1) {
  if (MAX_DEPTH && depth > MAX_DEPTH) return "";

  let tree = "";
  const BRANCH = "├── "
  const LEAF = "└── ";

  const entries = fs
    .readdirSync(dir)
    .filter((name) => !isExcluded(path.join(dir, name)))
    .sort();

  entries.forEach((name, idx) => {
    const fullPath = path.join(dir, name);
    const isDir = fs.statSync(fullPath).isDirectory();
    const connector = idx === entries.length - 1
      ? LEAF
      : BRANCH;
    tree += `${prefix}${connector}${name}\n`;
    if (isDir) {
      const newPrefix = prefix + (idx === entries.length - 1 ? "    " : "│   ");
      tree += buildTree(fullPath, newPrefix, depth + 1);
    }
  });

  return tree;
}

///////////////////////////////////////
// 7. 搜尋各子專案的 package.json
///////////////////////////////////////
function findPackages(dir, list = []) {
  const entries = fs.readdirSync(dir);
  for (const name of entries) {
    const fullPath = path.join(dir, name);
    if (isExcluded(fullPath)) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findPackages(fullPath, list);
    } else if (name === "package.json") {
      list.push(fullPath);
    }
  }
  return list;
}

///////////////////////////////////////
// 8. 主流程：掃描、解析、組合 Markdown
///////////////////////////////////////
function main() {
  const root = process.cwd();

  // 目錄樹
  const tree = buildTree(root);

  // 掃描所有檔案並解析函式
  const files = scanFiles(root);
  const funcMap = {}; // filePath -> [ {name, params, comment}, ... ]
  files.forEach((fp) => {
    const rel = path.relative(root, fp);
    const funcs = parseFile(fp);
    if (funcs.length) funcMap[rel] = funcs;
  });

  // 收集依賴
  const pkgFiles = findPackages(root);
  const depsMap = {}; // projectName -> { dependencies, devDependencies }
  pkgFiles.forEach((pf) => {
    try {
      const data = JSON.parse(fs.readFileSync(pf, "utf-8"));
      const proj = data.name || path.basename(path.dirname(pf));
      depsMap[proj] = {
        dependencies: data.dependencies || {},
        devDependencies: data.devDependencies || {},
      };
    } catch (err) {
      console.warn(`解析 ${pf} 時發生錯誤：${err.message}`);
    }
  });

  // 組合 Markdown
  let md = "";

  // 1. 專案目錄結構
  md += "# 專案快照\n\n";
  md += "## 專案目錄結構\n\n";
  md += "```text\n" + tree + "```\n\n";

  // 2. 函式清單
  md += "## 函式清單\n\n";
  for (const [file, funcs] of Object.entries(funcMap)) {
    md += `### ${file}\n\n`;
    funcs.forEach((f) => {
      md += `- **${f.signature}**${
        f.comment ? " - " + f.comment : ""
      }\n`;
    });
    md += "\n";
  }

  // 3. 依賴清單
  md += "## 依賴清單\n\n";
  for (const [proj, info] of Object.entries(depsMap)) {
    md += `### ${proj}\n\n`;
    md += "### devDependencies\n\n";
    if (Object.keys(info.devDependencies).length) {
      md +=
        "```json\n" + JSON.stringify(info.devDependencies, null, 2) + "\n```\n";
    } else {
      md += "無\n";
    }
    md += "\n### dependencies\n\n";
    if (Object.keys(info.dependencies).length) {
      md +=
        "```json\n" + JSON.stringify(info.dependencies, null, 2) + "\n```";
    } else {
      md += "無\n";
    }
    md += "\n";
  }

  // 輸出至 snapshot.md
  fs.writeFileSync(path.join(root, "snapshot.md"), md, "utf-8");
  console.log("已生成 snapshot.md");
}

main();
