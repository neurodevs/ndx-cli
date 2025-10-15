import { exec as execSync } from 'child_process'
import { mkdir } from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import AbstractSpruceTest, {
    test,
    assert,
    generateId,
} from '@sprucelabs/test-utils'
import {
    callsToExec,
    callsToMkdir,
    fakeExec,
    fakeMkdir,
    resetCallsToExec,
    resetCallsToMkdir,
} from '@neurodevs/fake-node-core'
import {
    FakeAutomodule,
    FakeAutopackage,
    ImplAutomodule,
    NpmAutopackage,
    UiAutomodule,
} from '@neurodevs/meta-node'
import prompts from 'prompts'
import CliCommandRunner from '../../modules/CliCommandRunner'
import fakePrompts, {
    callsToFakePrompts,
    resetCallsToFakePrompts,
    setFakeResponses,
} from '../../testDoubles/prompts/fakePrompts'

const exec = promisify(execSync)

export default class CliCommandRunnerTest extends AbstractSpruceTest {
    private static readonly createImplCommand = 'create.impl'
    private static readonly interfaceName = generateId()
    private static readonly implName = generateId()

    private static readonly createPackageCommand = 'create.package'
    private static readonly packageName = generateId()
    private static readonly description = generateId()
    private static readonly keywords = [generateId(), generateId()]

    private static readonly createUiCommand = 'create.ui'
    private static readonly componentName = generateId()

    private static readonly githubToken = generateId()

    protected static async beforeEach() {
        await super.beforeEach()

        this.setFakeImplAutomodule()
        this.setFakeUiAutomodule()
        this.setFakeAutopackage()

        this.setFakeExec()
        this.setFakeMkdir()
        this.setFakePrompts()

        process.env.GITHUB_TOKEN = this.githubToken
    }

    @test()
    protected static async throwsIfCommandIsNotSupported() {
        const invalidArg = generateId()
        const instance = this.CliCommandRunner([invalidArg])

        const err = await assert.doesThrowAsync(
            async () => await instance.run()
        )

        assert.isEqual(
            err.message,
            `The command "${invalidArg}" is not supported!`,
            'Did not receive the expected error!'
        )
    }

    @test()
    protected static async createImplCreatesInstance() {
        const instance = await this.runCreateImpl()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.createImplCommand}!`
        )
    }

    @test()
    protected static async createImplPromptsUserForInput() {
        await this.runCreateImpl()

        assert.isEqualDeep(
            callsToFakePrompts[0],
            [
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
            ],
            'Did not prompt user for expected input!'
        )
    }

    @test()
    protected static async createImplDoesNotContinueIfPromptsIsInterrupted() {
        await this.runCreateImpl({
            interfaceName: '',
            implName: '',
        })

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            0,
            'Should not have called run on ImplAutomodule!'
        )
    }

    @test()
    protected static async createImplCreatesTestSaveDirIfNotExists() {
        await this.runCreateImpl()

        assert.isEqualDeep(
            callsToMkdir[0],
            { path: this.implTestSaveDir, options: { recursive: true } },
            'Did not create test save dir!'
        )
    }

    @test()
    protected static async createImplCreatesModuleSaveDirIfNotExists() {
        await this.runCreateImpl()

        assert.isEqualDeep(
            callsToMkdir[1],
            { path: this.implModuleSaveDir, options: { recursive: true } },
            'Did not create module save dir!'
        )
    }

    @test()
    protected static async createImplCreatesFakeSaveDirIfNotExists() {
        await this.runCreateImpl()

        assert.isEqualDeep(
            callsToMkdir[2],
            {
                path: `src/testDoubles/${this.interfaceName}`,
                options: { recursive: true },
            },
            'Did not create fake save dir!'
        )
    }

    @test()
    protected static async createImplCreatesImplAutomodule() {
        await this.runCreateImpl()

        assert.isEqualDeep(
            FakeAutomodule.callsToConstructor[0],
            {
                testSaveDir: this.implTestSaveDir,
                moduleSaveDir: this.implModuleSaveDir,
                fakeSaveDir: this.implFakeSaveDir,
                interfaceName: this.interfaceName,
                implName: this.implName,
            },
            'Did not create ImplAutomodule with expected options!'
        )
    }

    @test()
    protected static async createImplRunsImplAutomodule() {
        await this.runCreateImpl()

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            1,
            'Did not call run on ImplAutomodule!'
        )
    }

    @test()
    protected static async createPackageCreatesInstance() {
        const instance = await this.runCreatePackage()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.createPackageCommand}!`
        )
    }

    @test()
    protected static async createPackagePromptsUserForInput() {
        await this.runCreatePackage()

        assert.isEqualDeep(
            JSON.stringify(callsToFakePrompts[0]),
            JSON.stringify([
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
                {
                    type: 'text',
                    name: 'keywords',
                    message:
                        'Enter keywords (comma or space separated, lowercase, optional):',
                    initial: '',
                    format: (value: string) =>
                        value ? this.splitOnCommaOrWhitespace(value) : [],
                },
            ]),
            'Did not prompt user for expected input!'
        )
    }

    @test()
    protected static async createPackageDoesNotContinueIfPromptsIsInterrupted() {
        await this.runCreatePackage({
            packageName: '',
            description: '',
        })

        assert.isEqual(
            FakeAutopackage.numCallsToRun,
            0,
            'Should not have called run on Autopackage!'
        )
    }

    @test()
    protected static async createPackageCreatesNpmAutopackage() {
        await this.runCreatePackage()

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0],
            {
                name: this.packageName,
                description: this.description,
                keywords: this.keywordsWithDefaults(),
                gitNamespace: 'neurodevs',
                npmNamespace: 'neurodevs',
                installDir: this.expandHomeDir('~/dev'),
                license: 'MIT',
                author: 'Eric Yates <hello@ericthecurious.com>',
            },
            'Did not create NpmAutopackage with expected options!'
        )
    }

    private static keywordsWithDefaults() {
        return ['nodejs', 'typescript', 'tdd', ...this.keywords]
    }

    @test()
    protected static async createPackageRunsNpmAutopackage() {
        await this.runCreatePackage()

        assert.isEqual(
            FakeAutopackage.numCallsToRun,
            1,
            'Did not call run on Autopackage!'
        )
    }

    @test()
    protected static async createUiCreatesInstance() {
        const instance = await this.runCreateUi()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.createUiCommand}!`
        )
    }

    @test()
    protected static async createUiPromptsInstallDependenciesIfMissing() {
        await this.runCreateUi()

        assert.isEqualDeep(
            callsToFakePrompts[0],
            [
                {
                    type: 'confirm',
                    name: 'shouldInstall',
                    message:
                        'Some required dependencies are missing! Press Enter to install, or any other key to abort.',
                    initial: true,
                },
            ],
            'Did not prompt user for expected input!'
        )
    }

    @test()
    protected static async createUiInstallsDependenciesIfMissing() {
        await this.runCreateUi({
            shouldInstall: true,
        })

        assert.isEqualDeep(
            callsToExec[0],
            this.installDevDependenciesCommand,
            'Did not install dependencies!'
        )
    }

    @test()
    protected static async createUiPromptsUserForInput() {
        await this.runCreateUi()

        assert.isEqualDeep(
            callsToFakePrompts[1],
            [
                {
                    type: 'text',
                    name: 'componentName',
                    message: this.componentNameMessage,
                },
            ],
            'Did not prompt user for expected input!'
        )
    }

    @test()
    protected static async createUiDoesNotContinueIfPromptsIsInterrupted() {
        await this.runCreateUi({
            componentName: '',
        })

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            0,
            'Should not have called run on UiAutomodule!'
        )
    }

    @test()
    protected static async createUiCreatesTestSaveDirIfNotExists() {
        await this.runCreateUi()

        assert.isEqualDeep(
            callsToMkdir[0],
            { path: this.uiTestSaveDir, options: { recursive: true } },
            'Did not create test save dir!'
        )
    }

    @test()
    protected static async createUiCreatesModuleSaveDirIfNotExists() {
        await this.runCreateUi()

        assert.isEqualDeep(
            callsToMkdir[1],
            { path: this.uiModuleSaveDir, options: { recursive: true } },
            'Did not create module save dir!'
        )
    }

    @test()
    protected static async createUiCreatesFakeSaveDirIfNotExists() {
        await this.runCreateUi()

        assert.isEqualDeep(
            callsToMkdir[2],
            {
                path: this.uiFakeSaveDir,
                options: { recursive: true },
            },
            'Did not create fake save dir!'
        )
    }

    @test()
    protected static async createUiCreatesUiAutomodule() {
        await this.runCreateUi()

        assert.isEqualDeep(
            FakeAutomodule.callsToConstructor[0],
            {
                testSaveDir: this.uiTestSaveDir,
                moduleSaveDir: this.uiModuleSaveDir,
                fakeSaveDir: this.uiFakeSaveDir,
                componentName: this.componentName,
            },
            'Did not create UiAutomodule with expected options!'
        )
    }

    @test()
    protected static async createUiRunsUiAutomodule() {
        await this.runCreateUi()

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            1,
            'Did not call run on UiAutomodule!'
        )
    }

    private static async runCreateUi(
        responses?: Record<string, string | boolean>
    ) {
        setFakeResponses({
            componentName: this.componentName,
            ...responses,
        })

        const instance = this.CliCommandRunner([this.createUiCommand])
        await instance.run()

        return instance
    }

    private static async runCreateImpl(responses?: Record<string, string>) {
        setFakeResponses({
            interfaceName: this.interfaceName,
            implName: this.implName,
            ...responses,
        })

        const instance = this.CliCommandRunner([this.createImplCommand])
        await instance.run()

        return instance
    }

    private static async runCreatePackage(responses?: Record<string, string>) {
        setFakeResponses({
            packageName: this.packageName,
            description: this.description,
            keywords: this.keywords,
            ...responses,
        })

        const instance = this.CliCommandRunner([this.createPackageCommand])
        await instance.run()

        return instance
    }

    private static expandHomeDir(inputPath: string): string {
        return inputPath.startsWith('~')
            ? path.join(os.homedir(), inputPath.slice(1))
            : inputPath
    }

    private static splitOnCommaOrWhitespace(value: string) {
        return value
            .split(/[\s,]+/)
            .map((v: string) => v.trim())
            .filter(Boolean)
    }

    private static readonly implTestSaveDir = 'src/__tests__/modules'
    private static readonly implModuleSaveDir = 'src/modules'

    private static get implFakeSaveDir() {
        return `src/testDoubles/${this.interfaceName}`
    }

    private static readonly uiTestSaveDir = 'src/__tests__/ui'
    private static readonly uiModuleSaveDir = 'src/ui'

    private static get uiFakeSaveDir() {
        return `src/testDoubles/${this.componentName}`
    }

    private static readonly installDevDependenciesCommand =
        'yarn add -D @types/react @testing-library/react @testing-library/jest-dom'

    private static setFakeImplAutomodule() {
        ImplAutomodule.Class = FakeAutomodule
        FakeAutomodule.resetTestDouble()
    }

    private static setFakeUiAutomodule() {
        UiAutomodule.Class = FakeAutomodule
        FakeAutomodule.resetTestDouble()
    }

    private static setFakeAutopackage() {
        NpmAutopackage.Class = FakeAutopackage
        FakeAutopackage.resetTestDouble()
    }

    private static setFakeExec() {
        CliCommandRunner.exec = fakeExec as unknown as typeof exec
        resetCallsToExec()
    }

    private static setFakeMkdir() {
        CliCommandRunner.mkdir = fakeMkdir as unknown as typeof mkdir
        resetCallsToMkdir()
    }

    private static setFakePrompts() {
        CliCommandRunner.prompts = fakePrompts as unknown as typeof prompts
        resetCallsToFakePrompts()
    }

    private static readonly interfaceNameMessage =
        'What should the interface be called? Example: YourInterface'

    private static readonly implNameMessage =
        'What should the implementation class be called? Example: YourInterfaceImpl'

    private static readonly packageNameMessage =
        'What should the package be called? Example: useful-package'

    private static readonly packageDescriptionMessage =
        'What should the package description be? Example: A useful package.'

    private static readonly componentNameMessage =
        'What should the component be called? Example: YourComponent'

    private static CliCommandRunner(args: string[]) {
        return CliCommandRunner.Create(args)
    }
}
