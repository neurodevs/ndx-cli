import { assert, test } from '@sprucelabs/test-utils'
import {
    callsToFakePrompts,
    setFakeResponses,
} from '../../../testDoubles/prompts/fakePrompts'
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

    @test()
    protected static async promptsUserForInput() {
        await this.run()

        assert.isEqualDeep(
            callsToFakePrompts[0],
            [
                {
                    type: 'text',
                    name: 'name',
                    message: this.nameMessage,
                },
                {
                    type: 'text',
                    name: 'description',
                    message: this.descriptionMessage,
                },
                {
                    type: 'text',
                    name: 'snippet',
                    message: this.snippetMessage,
                },
                {
                    type: 'text',
                    name: 'keybinding',
                    message: this.keybindingMessage,
                },
            ],
            'Did not prompt user for expected input!'
        )
    }

    private static readonly nameMessage = `Snippet name? Example: Singleton class template`
    private static readonly descriptionMessage = `Snippet description? Example: A class template based on the singleton pattern`
    private static readonly snippetMessage = `Snippet text content? Newlines allowed. Press Enter twice to finish`
    private static readonly keybindingMessage = `Snippet keybinding? Examples: ctrl+alt+c, f4`

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
