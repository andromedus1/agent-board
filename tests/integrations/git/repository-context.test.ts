import assert from "node:assert/strict";
import test from "node:test";

import type { ProcessRequest, ProcessResult, ProcessRunner } from "../../../src/integrations/process-runner.js";
import { GitRepositoryContext } from "../../../src/integrations/git/repository-context.js";

class FakeRunner implements ProcessRunner {
  readonly requests: ProcessRequest[] = [];
  constructor(private readonly results: ProcessResult[]) {}
  async run(request: ProcessRequest): Promise<ProcessResult> {
    this.requests.push(request);
    return this.results.shift() ?? { stdout: "", stderr: "", exitCode: 1 };
  }
}

test("Git discovery uses bounded argv values and returns repository context", async () => {
  const runner = new FakeRunner([
    { stdout: "/tmp/work tree\n", stderr: "", exitCode: 0 },
    { stdout: "feature/one\n", stderr: "", exitCode: 0 },
  ]);

  const result = await new GitRepositoryContext({ runner, timeoutMs: 321, maxOutputBytes: 456 }).discover("/tmp/work tree; echo unsafe");

  assert.deepEqual(result, { repoPath: "/tmp/work tree", gitBranch: "feature/one" });
  assert.deepEqual(runner.requests.map((request) => request.args), [
    ["-C", "/tmp/work tree; echo unsafe", "rev-parse", "--show-toplevel"],
    ["-C", "/tmp/work tree; echo unsafe", "symbolic-ref", "--quiet", "--short", "HEAD"],
  ]);
  assert.equal(runner.requests[0].timeoutMs, 321);
  assert.equal(runner.requests[0].maxOutputBytes, 456);
});

test("Git discovery degrades for non-repositories, detached heads, and malformed output", async () => {
  const missing = new FakeRunner([{ stdout: "", stderr: "not a repository", exitCode: 128 }]);
  assert.deepEqual(await new GitRepositoryContext({ runner: missing }).discover("/tmp/no-repo"), {});

  const detached = new FakeRunner([
    { stdout: "/tmp/repo\n", stderr: "", exitCode: 0 },
    { stdout: "", stderr: "detached", exitCode: 1 },
  ]);
  assert.deepEqual(await new GitRepositoryContext({ runner: detached }).discover("/tmp/repo"), { repoPath: "/tmp/repo" });

  const malformed = new FakeRunner([{ stdout: "/tmp/repo\nextra\n", stderr: "", exitCode: 0 }]);
  assert.deepEqual(await new GitRepositoryContext({ runner: malformed }).discover("/tmp/repo"), {});
});
