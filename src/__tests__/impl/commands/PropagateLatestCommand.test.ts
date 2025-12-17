import { FakePropagationCoordinator } from '@neurodevs/meta-node'
import { assert, test } from '@neurodevs/node-tdd'

import { CommandRunner } from '../../../impl/CliCommandRunner.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

export default class PropagateLatestCommandTest extends AbstractCommandRunnerTest {
    private static instance: CommandRunner

    private static readonly repoPath = '.'
    private static readonly repoPaths = this.npmRepoNames.map(
        (name) => `../${name}`
    )

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

    @test()
    protected static async createsNpmPropagationCoordinator() {
        assert.isEqualDeep(
            FakePropagationCoordinator.callsToConstructor[0],
            {
                repoPath: this.repoPath,
                repoPaths: this.repoPaths,
            },
            'Did not create with expected parameters!'
        )
    }

    @test()
    protected static async runsNpmPropagationCoordinator() {
        assert.isEqual(
            FakePropagationCoordinator.numCallsToRun,
            1,
            'Did not run!'
        )
    }

    private static async run() {
        const instance = this.CliCommandRunner([this.propagateLatestCommand])
        await instance.run()

        return instance
    }
}
