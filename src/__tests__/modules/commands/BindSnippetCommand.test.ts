import { assert, test } from '@sprucelabs/test-utils'
import { setFakeResponses } from '../../../testDoubles/prompts/fakePrompts'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest'

export default class BindSnippetCommandTest extends AbstractCommandRunnerTest {
    protected static async beforeEach() {
        await super.beforeEach()
    }

    @test()
    protected static async createsInstance() {
        const instance = await this.run()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.bindSnippetCommand}!`
        )
    }

    private static async run(responses?: Record<string, string>) {
        setFakeResponses({
            interfaceName: this.interfaceName,
            implName: this.implName,
            ...responses,
        })

        const instance = this.CliCommandRunner([this.bindSnippetCommand])
        await instance.run()

        return instance
    }
}
