import { mkdir } from 'fs/promises'
import os from 'os'
import path from 'path'
import AbstractSpruceTest, {
    test,
    assert,
    generateId,
} from '@sprucelabs/test-utils'
import {
    FakeAutomodule,
    FakeAutopackage,
    ImplAutomodule,
    NpmAutopackage,
} from '@neurodevs/meta-node'
import prompts from 'prompts'
import CliCommandRunner from '../../modules/CliCommandRunner'
import fakeMkdir, {
    callsToMkdir,
    resetCallsToMkdir,
} from '../../testDoubles/fakeMkdir'
import {
    callsToFakePrompts,
    fakePrompts,
    resetCallsToFakePrompts,
    setFakeResponses,
} from '../../testDoubles/prompts/fakePrompts'

export default class CliCommandRunnerTest extends AbstractSpruceTest {
    private static readonly createImplCommand = 'create.impl'
    private static readonly createPackageCommand = 'create.package'

    private static readonly testSaveDir = 'src/__tests__/modules'

    private static readonly moduleSaveDir = 'src/modules'

    protected static async beforeEach() {
        await super.beforeEach()

        this.setFakePrompts()
        this.setFakeMkdir()
        this.setFakeAutomodule()
        this.setFakeAutopackage()

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

        assert.isEqual(
            callsToMkdir[0],
            this.testSaveDir,
            'Did not create test save dir!'
        )
    }

    @test()
    protected static async createImplCreatesImplAutomodule() {
        await this.runCreateImpl()

        assert.isEqualDeep(
            FakeAutomodule.callsToConstructor[0],
            {
                testSaveDir: this.testSaveDir,
                moduleSaveDir: this.moduleSaveDir,
                fakeSaveDir: this.fakeSaveDir,
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
        this.setFakePromptResponsesForCreatePackage()

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

    private static async runCreateImpl(responses?: Record<string, string>) {
        this.setFakeResponsesForCreateImpl(responses)

        const instance = this.CliCommandRunner([this.createImplCommand])
        await instance.run()

        return instance
    }

    private static async runCreatePackage(responses?: Record<string, string>) {
        this.setFakePromptResponsesForCreatePackage(responses)

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

    private static get fakeSaveDir() {
        return `src/testDoubles/${this.interfaceName}`
    }

    private static setFakeMkdir() {
        CliCommandRunner.mkdir = fakeMkdir as unknown as typeof mkdir
        resetCallsToMkdir()
    }

    private static setFakeAutomodule() {
        ImplAutomodule.Class = FakeAutomodule
        FakeAutomodule.resetTestDouble()
    }

    private static setFakeAutopackage() {
        NpmAutopackage.Class = FakeAutopackage
        FakeAutopackage.resetTestDouble()
    }

    private static setFakePrompts() {
        CliCommandRunner.prompts = fakePrompts as unknown as typeof prompts
        resetCallsToFakePrompts()
    }

    private static setFakeResponsesForCreateImpl(
        responses?: Record<string, string>
    ) {
        setFakeResponses({
            interfaceName: this.interfaceName,
            implName: this.implName,
            ...responses,
        })
    }

    private static setFakePromptResponsesForCreatePackage(
        responses?: Record<string, string>
    ) {
        setFakeResponses({
            packageName: this.packageName,
            description: this.description,
            keywords: this.keywords,
            ...responses,
        })
    }

    private static readonly interfaceName = generateId()
    private static readonly implName = generateId()
    private static readonly packageName = generateId()
    private static readonly description = generateId()
    private static readonly keywords = [generateId(), generateId()]
    private static readonly githubToken = generateId()

    private static readonly interfaceNameMessage =
        'What should the interface be called? Example: YourInterface'

    private static readonly implNameMessage =
        'What should the implementation class be called? Example: YourInterfaceImpl'

    private static readonly packageNameMessage =
        'What should the package be called? Example: useful-package'

    private static readonly packageDescriptionMessage =
        'What should the package description be? Example: A useful package.'

    private static CliCommandRunner(args: string[]) {
        return CliCommandRunner.Create(args)
    }
}
