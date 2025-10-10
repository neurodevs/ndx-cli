import AbstractSpruceTest, {
    test,
    assert,
    generateId,
} from '@sprucelabs/test-utils'
import { FakeAutomodule, NodeAutomodule } from '@neurodevs/meta-node'
import CliCommandRunner, { CommandRunner } from '../../modules/CliCommandRunner'

export default class CliCommandRunnerTest extends AbstractSpruceTest {
    private static instance: CommandRunner

    protected static async beforeEach() {
        await super.beforeEach()

        NodeAutomodule.Class = FakeAutomodule

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

    private static CliCommandRunner(args?: string[]) {
        return CliCommandRunner.Create(args ?? ['create.module'])
    }
}
