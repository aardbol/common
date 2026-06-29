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

const EDGE_CASE_YML = `
name: "Edge Cases"
description: "Edge case testing"
inputs:
  my-input:
    description: A kebab-case input
    required: false
    default: ""
  no-default:
    description: Input without default
    required: true
outputs: {}
`;

const MULTILINE_YML = `
name: "Multi-line"
description: "Test"
inputs:
  desc:
    description: |
      Line one
      Line two
    required: false
outputs: {}
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

    it("handles empty inputs and outputs", async () => {
        const { default: generate } = await import("../src/generator/generator");

        const edgeYml = path.join(tmpDir, "edge.yml");
        const edgeOut = path.join(tmpDir, "edge-output.ts");
        fs.writeFileSync(edgeYml, `name: "Empty"\ndescription: "Test"\n`, "utf-8");

        await generate(edgeYml, edgeOut, false);
        const output = fs.readFileSync(edgeOut, "utf-8");

        expect(output).toContain("export enum Inputs {\n}");
        expect(output).toContain("export enum Outputs {\n}");
    });

    it("converts kebab-case names to UPPER_SNAKE_CASE", async () => {
        const { default: generate } = await import("../src/generator/generator");

        const edgeYml = path.join(tmpDir, "kebab.yml");
        const edgeOut = path.join(tmpDir, "kebab-output.ts");
        fs.writeFileSync(edgeYml, EDGE_CASE_YML.trimStart(), "utf-8");

        await generate(edgeYml, edgeOut, false);
        const output = fs.readFileSync(edgeOut, "utf-8");

        expect(output).toContain('MY_INPUT = "my-input"');
    });

    it("renders empty default as empty string, not None", async () => {
        const { default: generate } = await import("../src/generator/generator");

        const edgeYml = path.join(tmpDir, "default.yml");
        const edgeOut = path.join(tmpDir, "default-output.ts");
        fs.writeFileSync(edgeYml, EDGE_CASE_YML.trimStart(), "utf-8");

        await generate(edgeYml, edgeOut, false);
        const output = fs.readFileSync(edgeOut, "utf-8");

        expect(output).toContain('Default: ""');
    });

    it("renders absent default as None", async () => {
        const { default: generate } = await import("../src/generator/generator");

        const edgeYml = path.join(tmpDir, "none-default.yml");
        const edgeOut = path.join(tmpDir, "none-default-output.ts");
        fs.writeFileSync(edgeYml, EDGE_CASE_YML.trimStart(), "utf-8");

        await generate(edgeYml, edgeOut, false);
        const output = fs.readFileSync(edgeOut, "utf-8");

        expect(output).toContain("Default: None.");
    });

    it("renders required field correctly", async () => {
        const { default: generate } = await import("../src/generator/generator");

        const edgeYml = path.join(tmpDir, "required.yml");
        const edgeOut = path.join(tmpDir, "required-output.ts");
        fs.writeFileSync(edgeYml, EDGE_CASE_YML.trimStart(), "utf-8");

        await generate(edgeYml, edgeOut, false);
        const output = fs.readFileSync(edgeOut, "utf-8");

        expect(output).toContain("Required: true");
        expect(output).toContain("Required: false");
    });

    it("folds multi-line descriptions correctly", async () => {
        const { default: generate } = await import("../src/generator/generator");

        const multiYml = path.join(tmpDir, "multi.yml");
        const multiOut = path.join(tmpDir, "multi-output.ts");
        fs.writeFileSync(multiYml, MULTILINE_YML.trimStart(), "utf-8");

        await generate(multiYml, multiOut, false);
        const output = fs.readFileSync(multiOut, "utf-8");

        expect(output).toContain(" * Line one");
        expect(output).toContain(" * Line two");
    });

    it("rejects on non-existent file", async () => {
        const { default: generate } = await import("../src/generator/generator");

        const missingFile = path.join(tmpDir, "nonexistent.yml");
        const dummyOut = path.join(tmpDir, "dummy.ts");

        await expect(generate(missingFile, dummyOut, false)).rejects.toThrow();
    });
});
