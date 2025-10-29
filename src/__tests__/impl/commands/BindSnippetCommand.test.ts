import {
    FakeSnippetKeybinder,
    SnippetKeybinderOptions,
} from '@neurodevs/meta-node'
import { assert, test } from '@neurodevs/node-tdd'

import {
    callsToFakePrompts,
    setFakeResponses,
} from '../../../testDoubles/prompts/fakePrompts.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

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
                    name: 'lines',
                    message: this.linesMessage,
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

    @test()
    protected static async createsVscodeSnippetKeybinder() {
        await this.run(this.promptResponses as any)

        assert.isEqualDeep(
            FakeSnippetKeybinder.callsToConstructor[0],
            this.keybinderOptions,
            'Did not create VscodeSnippetKeybinder with expected options!'
        )
    }

    @test()
    protected static async runsVscodeSnippetKeybinder() {
        await this.run()

        assert.isEqual(
            FakeSnippetKeybinder.numCallsToRun,
            1,
            'Did not call run on VscodeSnippetKeybinder!'
        )
    }

    @test()
    protected static async doesNotContinueIfPromptsIsInterrupted() {
        await this.run({
            name: '',
            description: '',
            lines: '',
            keybinding: '',
        })

        assert.isEqual(
            FakeSnippetKeybinder.numCallsToRun,
            0,
            'Should not have called run on VscodeSnippetKeybinder!'
        )
    }

    private static readonly snippetName = this.generateId()
    private static readonly snippetDescription = this.generateId()
    private static readonly lines = `${this.generateId()}\\n${this.generateId()}`
    private static readonly keybinding = this.generateId()

    private static readonly promptResponses: Record<string, unknown> = {
        name: this.snippetName,
        description: this.snippetDescription,
        lines: this.lines,
        keybinding: this.keybinding,
    }

    private static readonly keybinderOptions: SnippetKeybinderOptions = {
        name: this.snippetName,
        description: this.snippetDescription,
        lines: this.lines.split('\\n'),
        keybinding: this.keybinding,
    }

    private static readonly nameMessage = `Snippet name? Example: Singleton class template`
    private static readonly descriptionMessage = `Snippet description? Example: A class template based on the singleton pattern`
    private static readonly linesMessage = `Snippet text content? Use \\n for newlines. Example: line-1\\nline-2`
    private static readonly keybindingMessage = `Snippet keybinding? Examples: ctrl+alt+c, f4`

    private static async run(responses?: Record<string, unknown>) {
        setFakeResponses(responses ?? this.promptResponses)

        const instance = this.CliCommandRunner([this.bindSnippetCommand])
        await instance.run()

        return instance
    }
}
