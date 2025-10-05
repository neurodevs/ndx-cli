import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'
import CliCommandRunner, { CommandRunner } from '../../modules/CliCommandRunner'

export default class CliCommandRunnerTest extends AbstractSpruceTest {
    private static instance: CommandRunner

    protected static async beforeEach() {
        await super.beforeEach()

        this.instance = this.CliCommandRunner()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(this.instance, 'Failed to create instance!')
    }

    @test()
    protected static async createsAutopackage() {}

    private static CliCommandRunner() {
        return CliCommandRunner.Create()
    }
}
