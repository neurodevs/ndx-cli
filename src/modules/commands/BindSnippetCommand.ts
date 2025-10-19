import CliCommandRunner from '../CliCommandRunner'

export default class BindSnippetCommand {
    public constructor() {}

    public async run() {
        await this.promptUserForInput()
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
                name: 'snippet',
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
}
