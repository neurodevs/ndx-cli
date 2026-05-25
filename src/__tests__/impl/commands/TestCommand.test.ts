import { assert, test } from '@neurodevs/node-tdd'

import { CommandRunner } from '../../../impl/CliCommandRunner.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'
import { callsToExec } from '@neurodevs/fake-node-core'

export default class TestCommandTest extends AbstractCommandRunnerTest {
    private static instance: CommandRunner

    protected static async beforeEach() {
        await super.beforeEach()

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
    protected static async runsExpectedCommand() {
        assert.isEqual(
            callsToExec[0]?.command,
            'node $([ -f node_modules/@neurodevs/node-tdd/build/workspace/testRunner.cli.js ] && echo node_modules/@neurodevs/node-tdd/build/workspace/testRunner.cli.js || echo build/workspace/testRunner.cli.js) --watchMode standard',
            'Did not execute the expected command!'
        )
    }

    private static async run() {
        const instance = this.CliCommandRunner([this.testCommand])
        await instance.run()

        return instance
    }
}
