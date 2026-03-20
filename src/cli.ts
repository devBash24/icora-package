import { createProgram } from "./commands.js";

export async function run(argv = process.argv): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv);
}
