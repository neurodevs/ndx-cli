import { callsToLog } from '@neurodevs/fake-node-core'
import { test, assert } from '@neurodevs/node-tdd'

import AbstractCommandRunnerTest from '../AbstractCommandRunnerTest.js'

export default class CliCommandRunnerTest extends AbstractCommandRunnerTest {
    protected static async beforeEach() {
        await super.beforeEach()
    }

    @test()
    protected static async throwsIfCommandIsNotSupported() {
        const invalidArg = this.generateId()
        const instance = this.CliCommandRunner([invalidArg])

        const err = await assert.doesThrowAsync(
            async () => await instance.run()
        )

        assert.isEqual(
            err.message,
            `The command "${invalidArg}" is not supported!`,
            'Did not receive the expected error!'
        )
    }

    @test()
    protected static async helpOutputsHelpTextToConsole() {
        const instance = this.CliCommandRunner(['help'])
        await instance.run()

        assert.isEqual(
            callsToLog[0]?.message,
            this.helpText,
            'Help command should not execute any shell commands!'
        )
    }

    @test()
    protected static async helpAcceptsDashDashHelpFlag() {
        const instance = this.CliCommandRunner(['--help'])
        await instance.run()

        assert.isEqual(
            callsToLog[0]?.message,
            this.helpText,
            'Help command should not execute any shell commands!'
        )
    }

    @test()
    protected static async helpAcceptsDashHFlag() {
        const instance = this.CliCommandRunner(['-h'])
        await instance.run()

        assert.isEqual(
            callsToLog[0]?.message,
            this.helpText,
            'Help command should not execute any shell commands!'
        )
    }
}
