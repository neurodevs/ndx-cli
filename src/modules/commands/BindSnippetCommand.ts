import { VscodeSnippetKeybinder } from '@neurodevs/meta-node'
import CliCommandRunner from '../CliCommandRunner'

export default class BindSnippetCommand {
    private name!: string
    private description!: string
    private lines!: string
    private keybinding!: string

    public constructor() {}

    public async run() {
        const { name, description, lines, keybinding } =
            await this.promptUserForInput()

        this.name = name
        this.description = description
        this.lines = lines
        this.keybinding = keybinding

        const keybinder = this.VscodeSnippetKeybinder()
        await keybinder.run()
    }

    private async promptUserForInput() {
        return await this.prompts([
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
                message: this.snippetMessage,
            },
            {
                type: 'text',
                name: 'keybinding',
                message: this.keybindingMessage,
            },
        ])
    }

    private readonly nameMessage = `Snippet name? Example: Singleton class template`
    private readonly descriptionMessage = `Snippet description? Example: A class template based on the singleton pattern`
    private readonly snippetMessage = `Snippet text content? Newlines allowed. Press Enter twice to finish`
    private readonly keybindingMessage = `Snippet keybinding? Examples: ctrl+alt+c, f4`

    private get prompts() {
        return CliCommandRunner.prompts
    }

    private VscodeSnippetKeybinder() {
        return VscodeSnippetKeybinder.Create({
            name: this.name,
            description: this.description,
            lines: this.lines.split('\n'),
            keybinding: this.keybinding,
        })
    }
}
