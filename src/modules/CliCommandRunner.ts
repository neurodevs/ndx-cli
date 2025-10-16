import { exec as execSync } from 'child_process'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { promisify } from 'util'
import prompts from 'prompts'
import CreateImplCommand from './commands/CreateImplCommand'
import CreatePackageCommand from './commands/CreatePackageCommand'
import CreateUiCommand from './commands/CreateUiCommand'
import UpgradePackageCommand from './commands/UpgradePackageCommand'

export default class CliCommandRunner implements CommandRunner {
    public static Class?: CommandRunnerConstructor
    public static exec = promisify(execSync)
    public static mkdir = mkdir
    public static prompts = prompts
    public static readFile = readFile
    public static writeFile = writeFile

    private args: string[]

    private readonly createImplCommand = 'create.impl'
    private readonly createPackageCommand = 'create.package'
    private readonly createUiCommand = 'create.ui'
    private readonly upgradePackageCommand = 'upgrade.package'

    private readonly supportedCommands = [
        this.createImplCommand,
        this.createPackageCommand,
        this.createUiCommand,
        this.upgradePackageCommand,
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
            case this.upgradePackageCommand:
                await this.upgradePackage()
                break
        }
    }

    private async createImplModule() {
        const command = new CreateImplCommand()
        await command.run()
    }

    private async createPackage() {
        const command = new CreatePackageCommand()
        await command.run()
    }

    private async createUiModule() {
        const command = new CreateUiCommand()
        await command.run()
    }

    private async upgradePackage() {
        const command = new UpgradePackageCommand()
        await command.run()
    }
}

export interface CommandRunner {
    run(): Promise<void>
}

export type CommandRunnerConstructor = new (args: string[]) => CommandRunner
