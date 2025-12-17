import { exec as execSync } from 'child_process'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { promisify } from 'util'
import prompts from 'prompts'

import BindSnippetCommand from './commands/BindSnippetCommand.js'
import CreateImplCommand from './commands/CreateImplCommand.js'
import CreatePackageCommand from './commands/CreatePackageCommand.js'
import CreateUiCommand from './commands/CreateUiCommand.js'
import InstallSnippetsCommand from './commands/InstallSnippetsCommand.js'
import UpgradePackageCommand from './commands/UpgradePackageCommand.js'

export default class CliCommandRunner implements CommandRunner {
    public static Class?: CommandRunnerConstructor
    public static exec = promisify(execSync)
    public static log = console.log
    public static mkdir = mkdir
    public static prompts = prompts
    public static readFile = readFile
    public static writeFile = writeFile

    private args: string[]

    private readonly bindSnippetCommand = 'bind.snippet'
    private readonly createImplCommand = 'create.impl'
    private readonly createPackageCommand = 'create.package'
    private readonly createUiCommand = 'create.ui'
    private readonly helpCommand = 'help'
    private readonly helpFlagShort = '-h'
    private readonly helpFlagLong = '--help'
    private readonly installSnippetsCommand = 'install.snippets'
    private readonly propagateLatestCommand = 'propagate.latest'
    private readonly upgradePackageCommand = 'upgrade.package'

    private readonly supportedCommands = [
        this.bindSnippetCommand,
        this.createImplCommand,
        this.createPackageCommand,
        this.createUiCommand,
        this.helpCommand,
        this.helpFlagShort,
        this.helpFlagLong,
        this.installSnippetsCommand,
        this.propagateLatestCommand,
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
            case this.bindSnippetCommand:
                await this.bindSnippet()
                break
            case this.createImplCommand:
                await this.createImplModule()
                break
            case this.createPackageCommand:
                await this.createPackage()
                break
            case this.createUiCommand:
                await this.createUiModule()
                break
            case this.installSnippetsCommand:
                await this.installSnippets()
                break
            case this.upgradePackageCommand:
                await this.upgradePackage()
                break
            case this.helpCommand:
                await this.help()
                break
            case this.helpFlagLong:
                await this.help()
                break
            case this.helpFlagShort:
                await this.help()
                break
        }
    }

    private async bindSnippet() {
        const command = new BindSnippetCommand()
        await command.run()
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

    private async installSnippets() {
        const command = new InstallSnippetsCommand()
        await command.run()
    }

    private async upgradePackage() {
        const command = new UpgradePackageCommand()
        await command.run()
    }

    private async help() {
        this.log(this.helpText)
    }

    private get log() {
        return CliCommandRunner.log
    }

    private readonly helpText = `ndx CLI (Command Line Interface)

    Available commands:

    - bind.snippet      Bind a text snippet to a keyboard shortcut in vscode.
    - create.impl       Create implementation for interface with test and fake.
    - create.package    Create npm package using latest template.
    - create.ui         Create React component with test and fake.
    - install.snippets  Install text snippets with vscode keybindings.
    - upgrade.package   Upgrade existing npm package to latest template.
    - help, --help, -h  Show this help text.
    
    Usage:

    - ndx <command>
    `
}

export interface CommandRunner {
    run(): Promise<void>
}

export type CommandRunnerConstructor = new (args: string[]) => CommandRunner
