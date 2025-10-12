import os from 'os'
import path from 'path'
import { ImplAutomodule, NpmAutopackage } from '@neurodevs/meta-node'
import prompts from 'prompts'

export default class CliCommandRunner implements CommandRunner {
    public static Class?: CommandRunnerConstructor
    public static prompts = prompts

    private args: string[]

    private readonly createImplCommand = 'create.impl'
    private interfaceName!: string
    private implName!: string

    private readonly createPackageCommand = 'create.package'
    private packageName!: string
    private description!: string
    private keywords!: string[]

    private readonly supportedCommands = [
        this.createImplCommand,
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
        if (this.isCreateImplCommand) {
            await this.createImpl()
        } else if (this.isCreatePackageCommand) {
            await this.createPackage()
        }
    }

    private get isCreateImplCommand() {
        return this.command === this.createImplCommand
    }

    private get isCreatePackageCommand() {
        return this.command === this.createPackageCommand
    }

    private async createImpl() {
        const { interfaceName, implName } = await this.promptForAutomodule()

        this.interfaceName = interfaceName
        this.implName = implName

        if (!this.userInputExistsForCreateImpl) {
            return
        }

        const automodule = this.ImplAutomodule()
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

    private get userInputExistsForCreateImpl() {
        return this.interfaceName && this.implName
    }

    private async createPackage() {
        const { packageName, description, keywords } =
            await this.promptForAutopackage()

        this.packageName = packageName
        this.description = description
        this.keywords = keywords

        if (!this.userInputExistsForCreatePackage) {
            return
        }

        const autopackage = this.NpmAutopackage()
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
                message: this.descriptionMessage,
            },
            {
                type: 'text',
                name: 'keywords',
                message: this.keywordsMessage,
                initial: '',
                format: (value) =>
                    value ? this.splitOnCommaOrWhitespace(value) : [],
            },
        ])
    }

    private readonly packageNameMessage =
        'What should the package be called? Example: useful-package'

    private readonly descriptionMessage =
        'What should the package description be? Example: A useful package.'

    private readonly keywordsMessage =
        'Enter keywords (comma or space separated, lowercase, optional):'

    private splitOnCommaOrWhitespace(value: string) {
        return value
            .split(/[\s,]+/)
            .map((v: string) => v.trim())
            .filter(Boolean)
    }

    private get userInputExistsForCreatePackage() {
        return this.packageName && this.description
    }

    private expandHomeDir(inputPath: string): string {
        return inputPath.startsWith('~')
            ? path.join(os.homedir(), inputPath.slice(1))
            : inputPath
    }

    private get prompts() {
        return CliCommandRunner.prompts
    }

    private ImplAutomodule() {
        return ImplAutomodule.Create({
            testSaveDir: 'src/__tests__/modules',
            moduleSaveDir: 'src/modules',
            interfaceName: this.interfaceName,
            implName: this.implName,
        })
    }

    private NpmAutopackage() {
        return NpmAutopackage.Create({
            name: this.packageName,
            description: this.description,
            keywords: ['nodejs', 'typescript', 'tdd', ...this.keywords],
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
