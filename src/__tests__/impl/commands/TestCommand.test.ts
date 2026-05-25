import { assert, test } from '@neurodevs/node-tdd'

import { CommandRunner } from '../../../impl/CliCommandRunner.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'
import fakeSpawn, {
    callsToSpawn,
    resetCallsToSpawn,
    setFakeSpawnExitCode,
} from '../../../testDoubles/child_process/fakeSpawn.js'
import CliCommandRunner from '../../../impl/CliCommandRunner.js'

export default class TestCommandTest extends AbstractCommandRunnerTest {
    private static instance: CommandRunner

    protected static async beforeEach() {
        await super.beforeEach()

        CliCommandRunner.spawn = fakeSpawn as any
        resetCallsToSpawn()

        this.instance = await this.run()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(
            this.instance,
            `Failed to create instance for ${this.testCommand}!`
        )
    }

    @test()
    protected static async spawnsNodeWithTestRunnerScript() {
        assert.isEqualDeep(
            callsToSpawn[0],
            {
                command: 'node',
                args: [
                    'node_modules/@neurodevs/node-tdd/build/workspace/testRunner.cli.js',
                    '--watchMode',
                    'standard',
                ],
                options: {
                    stdio: 'inherit',
                },
            },
            'Did not spawn node as command!'
        )
    }

    @test()
    protected static async throwsIfSpawnExitsWithNonZeroCode() {
        setFakeSpawnExitCode(1)

        await assert.doesThrowAsync(
            () => this.run(),
            /Test runner exited with code 1/
        )
    }

    private static async run() {
        const instance = this.CliCommandRunner([this.testCommand])
        await instance.run()

        return instance
    }
}
