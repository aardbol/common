import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("hash", () => {
    it("produces a consistent hash for the same content", async () => {
        const { hash } = await import("../src/hash");

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bv-hash-test-"));
        const filePath = path.join(tmpDir, "test.txt");
        fs.writeFileSync(filePath, "hello world", "utf-8");

        const result1 = await hash(filePath);
        const result2 = await hash(filePath);

        expect(result1).toBe(result2);

        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("produces different hashes for different content", async () => {
        const { hash } = await import("../src/hash");

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bv-hash-test-"));
        const fileA = path.join(tmpDir, "a.txt");
        const fileB = path.join(tmpDir, "b.txt");
        fs.writeFileSync(fileA, "content a", "utf-8");
        fs.writeFileSync(fileB, "content b", "utf-8");

        const hashA = await hash(fileA);
        const hashB = await hash(fileB);

        expect(hashA).not.toBe(hashB);

        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
});
