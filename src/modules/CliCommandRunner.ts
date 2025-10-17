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
    public static log = console.log
    public static mkdir = mkdir
    public static prompts = prompts
    public static readFile = readFile
    public static writeFile = writeFile

    private args: string[]

    private readonly createImplCommand = 'create.impl'
    private readonly createPackageCommand = 'create.package'
    private readonly createUiCommand = 'create.ui'
    private readonly helpCommand = 'help'
    private readonly dashDashHelpCommand = '--help'
    private readonly dashHCommand = '-h'
    private readonly upgradePackageCommand = 'upgrade.package'

    private readonly supportedCommands = [
        this.createImplCommand,
        this.createPackageCommand,
        this.createUiCommand,
        this.helpCommand,
        this.dashDashHelpCommand,
        this.dashHCommand,
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
            case this.helpCommand:
                await this.help()
                break
            case this.dashDashHelpCommand:
                await this.help()
                break
            case this.dashHCommand:
                await this.help()
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

    private async help() {
        CliCommandRunner.log(`ndx CLI (Command Line Interface)

    Available commands:

    - create.impl       Create implementation for interface with test and fake.
    - create.package    Create npm package using latest template.
    - create.ui         Create React component with test and fake.
    - upgrade.package   Upgrade existing npm package to latest template.
    - help, --help, -h  Show this help text.
    
    Usage:

    - ndx <command> [options]
    `)
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
