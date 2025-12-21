import { FakeWorkspaceTypeChecker } from '@neurodevs/meta-node'
import { assert, test } from '@neurodevs/node-tdd'

import { CommandRunner } from '../../../impl/CliCommandRunner.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

export default class CheckTypesCommandTest extends AbstractCommandRunnerTest {
    private static instance: CommandRunner

    protected static async beforeEach() {
        await super.beforeEach()

        this.instance = await this.run()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(
            this.instance,
            `Failed to create instance for ${this.checkTypesCommand}!`
        )
    }

    @test()
    protected static async createsNpmWorkspaceTypeChecker() {
        assert.isEqual(
            FakeWorkspaceTypeChecker.callsToConstructor[0],
            '.',
            'Failed to create type checker!'
        )
    }

    private static async run() {
        const instance = this.CliCommandRunner([this.checkTypesCommand])
        await instance.run()

        return instance
    }
}
