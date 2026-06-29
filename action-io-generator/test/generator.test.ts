import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const TEST_YML = `
name: "Test Action"
description: "Test"
inputs:
  foo:
    description: The foo input
    required: true
    default: foo-default
  bar:
    description: The bar input
    required: false
outputs:
  result:
    description: The result output
`;

let tmpDir: string;
let ymlPath: string;
let outPath: string;

beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aio-gen-test-"));
    ymlPath = path.join(tmpDir, "action.yml");
    outPath = path.join(tmpDir, "inputs-outputs.ts");
    fs.writeFileSync(ymlPath, TEST_YML.trimStart(), "utf-8");
});

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("generator", () => {
    it("generates enum file from action.yml", async () => {
        const { default: generate } = await import("../src/generator/generator");
        await generate(ymlPath, outPath, false);

        const output = fs.readFileSync(outPath, "utf-8");

        expect(output).toContain("export enum Inputs");
        expect(output).toContain("export enum Outputs");

        expect(output).toContain('FOO = "foo"');
        expect(output).toContain('BAR = "bar"');
        expect(output).toContain('RESULT = "result"');

        expect(output).toContain("The foo input");
        expect(output).toContain("The bar input");
        expect(output).toContain("The result output");

        expect(output).toContain('Default: "foo-default"');
        expect(output).toContain("Default: None.");
    });

    it("sorts inputs alphabetically", async () => {
        const { default: generate } = await import("../src/generator/generator");
        await generate(ymlPath, outPath, false);

        const output = fs.readFileSync(outPath, "utf-8");
        const inputsStart = output.indexOf("export enum Inputs");
        const inputsEnd = output.indexOf("export enum Outputs");
        const inputsSection = output.slice(inputsStart, inputsEnd);

        const barIdx = inputsSection.indexOf('BAR = "bar"');
        const fooIdx = inputsSection.indexOf('FOO = "foo"');
        expect(barIdx).toBeLessThan(fooIdx);
    });
});
