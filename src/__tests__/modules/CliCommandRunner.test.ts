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
import CliCommandRunner, { CommandRunner } from '../../modules/CliCommandRunner'
import {
    callsToFakePrompts,
    fakePrompts,
    resetCallsToFakePrompts,
    setFakePromptsResponses,
} from '../../testDoubles/prompts/fakePrompts'

export default class CliCommandRunnerTest extends AbstractSpruceTest {
    private static instance: CommandRunner

    protected static async beforeEach() {
        await super.beforeEach()

        this.setFakeAutomodule()
        this.setFakeAutopackage()
        this.setFakePrompts()

        process.env.GITHUB_TOKEN = this.githubToken

        this.instance = this.CliCommandRunner()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(this.instance, 'Failed to create instance!')
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
    protected static async createsNodeAutomodule() {
        await this.runAutomodule()

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
    protected static async callsRunOnNodeAutomodule() {
        await this.runAutomodule()

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            1,
            'Did not call run on Automodule!'
        )
    }

    @test()
    protected static async promptsUserForInput() {
        await this.runAutomodule()

        assert.isEqualDeep(callsToFakePrompts[0], [
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

    @test()
    protected static async automoduleDoesNotContinueIfPromptsIsInterrupted() {
        setFakePromptsResponses({
            interfaceName: '',
            implName: '',
        })

        await this.runAutomodule()

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            0,
            'Should not have called run on Automodule!'
        )
    }

    @test()
    protected static async createsNpmAutopackage() {
        const instance = this.CliCommandRunner(['create.package'])
        await instance.run()

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0],
            {
                name: '',
                description: '',
                gitNamespace: 'neurodevs',
                npmNamespace: 'neurodevs',
                installDir: this.expandHomeDir('~/dev'),
                license: 'MIT',
                author: 'Eric Yates <hello@ericthecurious.com>',
            },
            'Did not create NpmAutopackage with expected options!'
        )
    }

    private static expandHomeDir(inputPath: string): string {
        return inputPath.startsWith('~')
            ? path.join(os.homedir(), inputPath.slice(1))
            : inputPath
    }

    private static runAutomodule() {
        return this.instance.run()
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
        CliCommandRunner.prompts = fakePrompts as any
        resetCallsToFakePrompts()

        setFakePromptsResponses({
            interfaceName: this.interfaceName,
            implName: this.implName,
        })
    }

    private static readonly interfaceName = generateId()
    private static readonly implName = generateId()
    private static readonly githubToken = generateId()

    private static readonly interfaceNameMessage =
        'What should the interface be called? Example: YourInterface'

    private static readonly implNameMessage =
        'What should the implementation class be called? Example: YourInterfaceImpl'

    private static CliCommandRunner(args?: string[]) {
        return CliCommandRunner.Create(args ?? ['create.module'])
    }
}
