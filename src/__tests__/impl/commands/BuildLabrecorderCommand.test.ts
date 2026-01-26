import { callsToExec } from '@neurodevs/fake-node-core'
import { assert, test } from '@neurodevs/node-tdd'

import { CommandRunner } from '../../../impl/CliCommandRunner.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

export default class BuildLabrecorderCommandTest extends AbstractCommandRunnerTest {
    private static instance: CommandRunner

    protected static async beforeEach() {
        await super.beforeEach()

        this.instance = await this.run()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(
            this.instance,
            `Failed to create instance for ${this.buildLabrecorderCommmand}!`
        )
    }

    @test()
    protected static async executesExpectedBashCommand() {
        assert.isEqualDeep(
            callsToExec[0],
            {
                command: this.bashCommand,
                options: { cwd: '.' },
            },
            'Did not execute expected bash command!'
        )
    }

    private static readonly bashCommand = `sudo rm -rf build/ \
&& cmake -S . -B build \
  -DCMAKE_INSTALL_PREFIX=/opt/local \
  -DLSL_INSTALL_ROOT=/opt/local \
  -DLSL_UNIXFOLDERS=1 \
  -DBUILD_GUI=OFF \
&& cmake --build build \
&& sudo cmake --install build`

    private static async run() {
        const instance = this.CliCommandRunner([this.buildLabrecorderCommmand])
        await instance.run()

        return instance
    }
}
