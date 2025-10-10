import prompts from 'prompts'

export default class CliCommandRunner implements CommandRunner {
    public static Class?: CommandRunnerConstructor
    public static prompts = prompts

    private args: string[]

    protected constructor(args: string[]) {
        this.args = args
    }

    public static Create(args: string[]) {
        return new (this.Class ?? this)(args)
    }

    public async run() {
        this.throwIfCommandIsNotSupported()

        await this.promptUserInput()
    }

    private throwIfCommandIsNotSupported() {
        if (this.command !== 'create.module') {
            throw new Error(`The command "${this.command}" is not supported!`)
        }
    }

    private get command() {
        return this.args[0]
    }

    private async promptUserInput() {
        await this.prompts([
            {
                type: 'text',
                name: 'interfaceName',
                message: this.interfaceNameMessage,
            },
            {
                type: 'text',
                name: 'implName',
                message: this.implNameMessage,
            },
        ])
    }

    private readonly interfaceNameMessage =
        'What should the interface be called? Example: YourClass'

    private readonly implNameMessage =
        'What should the implementation class be called? Example: YourClassImpl'

    private get prompts() {
        return CliCommandRunner.prompts
    }
}

export interface CommandRunner {
    run(): Promise<void>
}

export type CommandRunnerConstructor = new (args: string[]) => CommandRunner
