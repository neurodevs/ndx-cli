import { assert, test } from '@sprucelabs/test-utils'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest'

export default class InstallSnippetsCommandTest extends AbstractCommandRunnerTest {
    protected static async beforeEach() {
        await super.beforeEach()
    }

    @test()
    protected static async createsInstance() {
        const instance = await this.run()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.installSnippetsCommand}!`
        )
    }

    private static async run() {
        const instance = this.CliCommandRunner([this.installSnippetsCommand])
        await instance.run()

        return instance
    }
}
