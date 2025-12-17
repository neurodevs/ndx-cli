import { assert, test } from '@neurodevs/node-tdd'

import { CommandRunner } from '../../../impl/CliCommandRunner.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

export default class PropagateLatestCommandTest extends AbstractCommandRunnerTest {
    private static instance: CommandRunner

    protected static async beforeEach() {
        await super.beforeEach()

        this.instance = await this.run()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(
            this.instance,
            `Failed to create instance for ${this.propagateLatestCommand}!`
        )
    }

    private static async run() {
        const instance = this.CliCommandRunner([this.propagateLatestCommand])
        await instance.run()

        return instance
    }
}
