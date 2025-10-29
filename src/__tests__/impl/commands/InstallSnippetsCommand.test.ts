import { FakeSnippetSuite } from '@neurodevs/meta-node'
import { assert, test } from '@neurodevs/node-tdd'

import { CommandRunner } from '../../../impl/CliCommandRunner.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

export default class InstallSnippetsCommandTest extends AbstractCommandRunnerTest {
    private static instance: CommandRunner

    protected static async beforeEach() {
        await super.beforeEach()

        this.instance = await this.run()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(
            this.instance,
            `Failed to create instance for ${this.installSnippetsCommand}!`
        )
    }

    @test()
    protected static async callsInstallOnTypescriptClassSnippetSuite() {
        assert.isEqual(
            FakeSnippetSuite.numCallsToInstall,
            1,
            'Did not install snippet suite!'
        )
    }

    private static async run() {
        const instance = this.CliCommandRunner([this.installSnippetsCommand])
        await instance.run()

        return instance
    }
}
