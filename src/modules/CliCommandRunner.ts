import { exec as execSync } from 'child_process'
import { mkdir } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import {
    ImplAutomodule,
    NpmAutopackage,
    UiAutomodule,
} from '@neurodevs/meta-node'
import prompts from 'prompts'

export default class CliCommandRunner implements CommandRunner {
    public static Class?: CommandRunnerConstructor
    public static exec = promisify(execSync)
    public static prompts = prompts
    public static mkdir = mkdir

    private args: string[]

    private readonly createImplCommand = 'create.impl'
    private interfaceName!: string
    private implName!: string

    private readonly createPackageCommand = 'create.package'
    private packageName!: string
    private description!: string
    private keywords!: string[]

    private readonly createUiCommand = 'create.ui'
    private componentName!: string

    private readonly supportedCommands = [
        this.createImplCommand,
        this.createPackageCommand,
        this.createUiCommand,
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
        switch (this.command) {
            case this.createImplCommand:
                await this.createImplModule()
                break
            case this.createPackageCommand:
                await this.createPackage()
                break
            case this.createUiCommand:
                await this.createUiModule()
                break
        }
    }

    private async createImplModule() {
        const { interfaceName, implName } = await this.promptForAutomodule()

        this.interfaceName = interfaceName
        this.implName = implName

        if (!this.userInputExistsForCreateImpl) {
            return
        }

        await this.makeRequiredImplDirectories()

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

    private async makeRequiredImplDirectories() {
        await this.mkdir(this.implTestSaveDir, { recursive: true })
        await this.mkdir(this.implModuleSaveDir, { recursive: true })
        await this.mkdir(this.implFakeSaveDir, { recursive: true })
    }

    private readonly implTestSaveDir = 'src/__tests__/modules'
    private readonly implModuleSaveDir = 'src/modules'

    private get implFakeSaveDir() {
        return `src/testDoubles/${this.interfaceName}`
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

    private async createUiModule() {
        const { shouldInstall } = await this.promptForInstallDependencies()

        debugger

        if (shouldInstall) {
            await this.installDependencies()
        }

        const { componentName } = await this.promptForUimodule()

        this.componentName = componentName

        if (!this.componentName) {
            return
        }

        await this.makeRequiredUiDirectories()

        const instance = this.UiAutomodule()
        await instance.run()
    }

    private async promptForInstallDependencies() {
        const result = await this.prompts([
            {
                type: 'confirm',
                name: 'shouldInstall',
                message:
                    'Some required dependencies are missing! Press Enter to install, or any other key to abort.',
                initial: true,
            },
        ])
        debugger
        return result
    }

    private async installDependencies() {
        console.log('Installing dependencies...')

        await this.exec(
            'yarn add -D @types/react @testing-library/react @testing-library/jest-dom'
        )
    }

    private async promptForUimodule() {
        return await this.prompts([
            {
                type: 'text',
                name: 'componentName',
                message: this.componentNameMessage,
            },
        ])
    }

    private readonly componentNameMessage =
        'What should the component be called? Example: YourComponent'

    private async makeRequiredUiDirectories() {
        await this.mkdir(this.uiTestSaveDir, { recursive: true })
        await this.mkdir(this.uiModuleSaveDir, { recursive: true })
        await this.mkdir(this.uiFakeSaveDir, { recursive: true })
    }

    private expandHomeDir(inputPath: string): string {
        return inputPath.startsWith('~')
            ? path.join(os.homedir(), inputPath.slice(1))
            : inputPath
    }

    private readonly uiTestSaveDir = 'src/__tests__/ui'
    private readonly uiModuleSaveDir = 'src/ui'

    private get uiFakeSaveDir() {
        return `src/testDoubles/${this.componentName}`
    }

    private get exec() {
        return CliCommandRunner.exec
    }

    private get mkdir() {
        return CliCommandRunner.mkdir
    }

    private get prompts() {
        return CliCommandRunner.prompts
    }

    private ImplAutomodule() {
        return ImplAutomodule.Create({
            testSaveDir: this.implTestSaveDir,
            moduleSaveDir: this.implModuleSaveDir,
            fakeSaveDir: this.implFakeSaveDir,
            interfaceName: this.interfaceName,
            implName: this.implName,
        })
    }

    private UiAutomodule() {
        return UiAutomodule.Create({
            testSaveDir: this.uiTestSaveDir,
            moduleSaveDir: this.uiModuleSaveDir,
            fakeSaveDir: this.uiFakeSaveDir,
            componentName: this.componentName,
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
