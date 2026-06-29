import * as path from "path";
import type { Opts } from "minimist";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const minimist = require("minimist");

import * as logger from "./util/logger";
import generator from "./generator/generator";

export async function cli(): Promise<void> {
    const minimistOptions: Opts = {
        alias: {
            a: "actionYml",
            s: "silent",
            o: "outFile",
            w: "watch",
        },
        boolean: [ "silent", "watch" ],
    };

    const args = minimist(process.argv.slice(2), minimistOptions);

    logger.setSilent(args.silent);

    let actionYmlFile = args.actionYml;
    if (!actionYmlFile) {
        logger.log(`No action.yml path provided, looking in working directory`);
        actionYmlFile = path.resolve(process.cwd(), "action.yml");
    }

    logger.log(`Loading action file "${actionYmlFile}"`);

    const outFile = args.outFile;
    if (!outFile) {
        console.error(`Fatal: -o or --outFile must be set. eg, "--outFile=./inputs-outputs.ts"`);
        process.exit(2);
    }
    else if (!/\.[tj]sx?$/.test(outFile)) {
        logger.log(`Warning: outfile "${outFile}" does not appear to be a JavaScript/TypeScript file.`);
        // but still continue
    }

    await generator(actionYmlFile, outFile, args.watch);
}
