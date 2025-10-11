import { NodeAutomodule } from '@neurodevs/meta-node'
import prompts from 'prompts'

export default class CliCommandRunner implements CommandRunner {
    public static Class?: CommandRunnerConstructor
    public static prompts = prompts

    private args: string[]

    private currentInterfaceName!: string
    private currentImplName!: string

    protected constructor(args: string[]) {
        this.args = args
    }

    public static Create(args: string[]) {
        return new (this.Class ?? this)(args)
    }

    public async run() {
        this.throwIfCommandIsNotSupported()

        const { interfaceName, implName } = await this.promptUserInput()

        this.currentInterfaceName = interfaceName
        this.currentImplName = implName

        if (!this.userInputExists) {
            return
        }

        await this.createModule()
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
        return await this.prompts([
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
        'What should the interface be called? Example: YourInterface'

    private readonly implNameMessage =
        'What should the implementation class be called? Example: YourInterfaceImpl'

    private get prompts() {
        return CliCommandRunner.prompts
    }

    private get userInputExists() {
        return this.currentInterfaceName && this.currentImplName
    }

    private async createModule() {
        const automodule = this.NodeAutomodule()
        await automodule.run()
    }

    private NodeAutomodule() {
        return NodeAutomodule.Create({
            testSaveDir: 'src/__tests__/modules',
            moduleSaveDir: 'src/modules',
            interfaceName: this.currentInterfaceName,
            implName: this.currentImplName,
        })
    }
}

export interface CommandRunner {
    run(): Promise<void>
}

export type CommandRunnerConstructor = new (args: string[]) => CommandRunner
