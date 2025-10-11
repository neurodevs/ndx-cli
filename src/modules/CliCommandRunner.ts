import os from 'os'
import path from 'path'
import { NodeAutomodule, NpmAutopackage } from '@neurodevs/meta-node'
import prompts from 'prompts'

export default class CliCommandRunner implements CommandRunner {
    public static Class?: CommandRunnerConstructor
    public static prompts = prompts

    private args: string[]

    private currentInterfaceName!: string
    private currentImplName!: string

    private readonly createModuleCommand = 'create.module'
    private readonly createPackageCommand = 'create.package'

    private readonly supportedCommands = [
        this.createModuleCommand,
        this.createPackageCommand,
    ]

    protected constructor(args: string[]) {
        this.args = args
    }

    public static Create(args: string[]) {
        return new (this.Class ?? this)(args)
    }

    public async run() {
        this.throwIfCommandIsNotSupported()
        await this.runCommand()
    }

    private throwIfCommandIsNotSupported() {
        if (!this.commandIsSupported) {
            throw new Error(`The command "${this.command}" is not supported!`)
        }
    }

    private get commandIsSupported() {
        return this.supportedCommands.includes(this.command)
    }

    private get command() {
        return this.args[0]
    }

    private async runCommand() {
        if (this.command === 'create.module') {
            await this.createModule()
        } else if (this.command === 'create.package') {
            await this.createPackage()
        }
    }

    private async createModule() {
        const { interfaceName, implName } = await this.promptForAutomodule()

        this.currentInterfaceName = interfaceName
        this.currentImplName = implName

        if (!this.userInputExists) {
            return
        }

        const automodule = this.NodeAutomodule()
        await automodule.run()
    }

    private async promptForAutomodule() {
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

    private get userInputExists() {
        return this.currentInterfaceName && this.currentImplName
    }

    private async createPackage() {
        await this.promptForAutopackage()

        const autopackage = await this.NpmAutopackage()
        await autopackage.run()
    }

    private async promptForAutopackage() {
        return await this.prompts([
            {
                type: 'text',
                name: 'packageName',
                message: this.packageNameMessage,
            },
            {
                type: 'text',
                name: 'description',
                message: this.packageDescriptionMessage,
            },
        ])
    }

    private readonly packageNameMessage =
        'What should the package be called? Example: useful-package'

    private readonly packageDescriptionMessage =
        'What should the package description be? Example: A useful package.'

    private expandHomeDir(inputPath: string): string {
        return inputPath.startsWith('~')
            ? path.join(os.homedir(), inputPath.slice(1))
            : inputPath
    }

    private get prompts() {
        return CliCommandRunner.prompts
    }

    private NodeAutomodule() {
        return NodeAutomodule.Create({
            testSaveDir: 'src/__tests__/modules',
            moduleSaveDir: 'src/modules',
            interfaceName: this.currentInterfaceName,
            implName: this.currentImplName,
        })
    }

    private NpmAutopackage() {
        return NpmAutopackage.Create({
            name: '',
            description: '',
            gitNamespace: 'neurodevs',
            npmNamespace: 'neurodevs',
            installDir: this.expandHomeDir('~/dev'),
            license: 'MIT',
            author: 'Eric Yates <hello@ericthecurious.com>',
        })
    }
}

export interface CommandRunner {
    run(): Promise<void>
}

export type CommandRunnerConstructor = new (args: string[]) => CommandRunner
