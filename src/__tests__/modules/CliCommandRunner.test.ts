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
    NodeAutomodule,
    NpmAutopackage,
} from '@neurodevs/meta-node'
import prompts from 'prompts'
import CliCommandRunner from '../../modules/CliCommandRunner'
import {
    callsToFakePrompts,
    fakePrompts,
    resetCallsToFakePrompts,
    setFakeResponses,
} from '../../testDoubles/prompts/fakePrompts'

export default class CliCommandRunnerTest extends AbstractSpruceTest {
    private static readonly createModuleCommand = 'create.module'
    private static readonly createPackageCommand = 'create.package'

    protected static async beforeEach() {
        await super.beforeEach()

        this.setFakeAutomodule()
        this.setFakeAutopackage()
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
    protected static async createModuleCreatesInstance() {
        const instance = await this.runCreateModule()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.createModuleCommand}!`
        )
    }

    @test()
    protected static async createModulePromptsUserForInput() {
        await this.runCreateModule()

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
    protected static async createModuleDoesNotContinueIfPromptsIsInterrupted() {
        await this.runCreateModule({
            interfaceName: '',
            implName: '',
        })

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            0,
            'Should not have called run on NodeAutomodule!'
        )
    }

    @test()
    protected static async createModuleCreatesNodeAutomodule() {
        await this.runCreateModule()

        assert.isEqualDeep(
            FakeAutomodule.callsToConstructor[0],
            {
                testSaveDir: 'src/__tests__/modules',
                moduleSaveDir: 'src/modules',
                interfaceName: this.interfaceName,
                implName: this.implName,
            },
            'Did not create NodeAutomodule with expected options!'
        )
    }

    @test()
    protected static async createModuleRunsNodeAutomodule() {
        await this.runCreateModule()

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            1,
            'Did not call run on NodeAutomodule!'
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
                        'Enter keywords (comma or space separated, optional):',
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
                keywords: this.keywords,
                gitNamespace: 'neurodevs',
                npmNamespace: 'neurodevs',
                installDir: this.expandHomeDir('~/dev'),
                license: 'MIT',
                author: 'Eric Yates <hello@ericthecurious.com>',
            },
            'Did not create NpmAutopackage with expected options!'
        )
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

    private static async runCreateModule(responses?: Record<string, string>) {
        this.setFakeResponsesForCreateModule(responses)

        const instance = this.CliCommandRunner([this.createModuleCommand])
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

    private static setFakeAutomodule() {
        NodeAutomodule.Class = FakeAutomodule
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

    private static setFakeResponsesForCreateModule(
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

    private static CliCommandRunner(args?: string[]) {
        return CliCommandRunner.Create(args ?? ['create.module'])
    }
}
