import { callsToMkdir } from '@neurodevs/fake-node-core'
import { FakeAutomodule } from '@neurodevs/meta-node'
import { assert, test } from '@neurodevs/node-tdd'

import {
    callsToFakePrompts,
    setFakeResponses,
} from '../../../testDoubles/prompts/fakePrompts.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

export default class CreateImplCommandTest extends AbstractCommandRunnerTest {
    protected static async beforeEach() {
        await super.beforeEach()
    }

    @test()
    protected static async createsInstance() {
        const instance = await this.run()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.createImplCommand}!`
        )
    }

    @test()
    protected static async promptsUserForInput() {
        await this.run()

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
    protected static async doesNotContinueIfPromptsIsInterrupted() {
        await this.run({
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
    protected static async createsTestSaveDirIfNotExists() {
        await this.run()

        assert.isEqualDeep(
            callsToMkdir[0],
            { path: this.implTestSaveDir, options: { recursive: true } },
            'Did not create test save dir!'
        )
    }

    @test()
    protected static async createsModuleSaveDirIfNotExists() {
        await this.run()

        assert.isEqualDeep(
            callsToMkdir[1],
            { path: this.implModuleSaveDir, options: { recursive: true } },
            'Did not create module save dir!'
        )
    }

    @test()
    protected static async createsFakeSaveDirIfNotExists() {
        await this.run()

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
    protected static async createsImplAutomodule() {
        await this.run()

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
    protected static async runsImplAutomodule() {
        await this.run()

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            1,
            'Did not call run on ImplAutomodule!'
        )
    }

    private static async run(responses?: Record<string, string>) {
        setFakeResponses({
            interfaceName: this.interfaceName,
            implName: this.implName,
            ...responses,
        })

        const instance = this.CliCommandRunner([this.createImplCommand])
        await instance.run()

        return instance
    }
}
