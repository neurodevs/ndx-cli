import { assert, test } from '@sprucelabs/test-utils'
import { FakeSnippetSuite } from '@neurodevs/meta-node'
import { CommandRunner } from '../../../impl/CliCommandRunner'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest'

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
