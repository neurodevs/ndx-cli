import AbstractSpruceTest, {
    test,
    assert,
    generateId,
} from '@sprucelabs/test-utils'
import { FakeAutomodule, NodeAutomodule } from '@neurodevs/meta-node'
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
        this.setFakePrompts()

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
    protected static async promptsUserForInput() {
        await this.run()

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
    protected static async createsNodeAutomodule() {
        await this.run()

        assert.isEqualDeep(FakeAutomodule.callsToConstructor[0], {
            testSaveDir: 'src/__tests__/modules',
            moduleSaveDir: 'src/modules',
            interfaceName: this.interfaceName,
            implName: this.implName,
        })
    }

    @test()
    protected static async callsRunOnNodeAutomodule() {
        await this.run()

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            1,
            'Did not call run on Automodule!'
        )
    }

    @test()
    protected static async doesNotContinueIfPromptsIsInterrupted() {
        setFakePromptsResponses({
            interfaceName: '',
            implName: '',
        })

        await this.run()

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            0,
            'Should not have called run on Automodule!'
        )
    }

    private static run() {
        return this.instance.run()
    }

    private static setFakeAutomodule() {
        NodeAutomodule.Class = FakeAutomodule
        FakeAutomodule.resetTestDouble()
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

    private static readonly interfaceNameMessage =
        'What should the interface be called? Example: YourClass'

    private static readonly implNameMessage =
        'What should the implementation class be called? Example: YourClassImpl'

    private static CliCommandRunner(args?: string[]) {
        return CliCommandRunner.Create(args ?? ['create.module'])
    }
}
