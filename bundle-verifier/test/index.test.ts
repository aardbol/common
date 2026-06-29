import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

let tmpDir: string;

beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bv-index-test-"));
});

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("moveBundleFile", () => {
    it("creates a .backup copy of the file", async () => {
        const { moveBundleFile } = await import("../src/index");

        const srcPath = path.join(tmpDir, "bundle.js");
        fs.writeFileSync(srcPath, "original content", "utf-8");

        const backupPath = await moveBundleFile(srcPath);

        expect(backupPath).toBe(path.join(tmpDir, "bundle.js.backup"));
        expect(fs.existsSync(backupPath)).toBe(true);
        expect(fs.existsSync(srcPath)).toBe(false);
        expect(fs.readFileSync(backupPath, "utf-8")).toBe("original content");
    });

    it("overwrites an existing backup", async () => {
        const { moveBundleFile } = await import("../src/index");

        const srcPath = path.join(tmpDir, "overwrite.js");
        const backupPath = path.join(tmpDir, "overwrite.js.backup");

        fs.writeFileSync(srcPath, "new content", "utf-8");
        fs.writeFileSync(backupPath, "stale backup", "utf-8");

        await moveBundleFile(srcPath);

        expect(fs.readFileSync(backupPath, "utf-8")).toBe("new content");
    });
});
