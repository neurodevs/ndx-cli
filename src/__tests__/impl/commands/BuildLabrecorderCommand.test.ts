import { ChildProcess } from 'child_process'
import {
    callsToError,
    callsToExec,
    callsToLog,
    setFakeExecResult,
} from '@neurodevs/fake-node-core'
import { assert, test } from '@neurodevs/node-tdd'

import { CommandRunner } from '../../../impl/CliCommandRunner.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

export default class BuildLabrecorderCommandTest extends AbstractCommandRunnerTest {
    private static instance: CommandRunner

    private static readonly fakeStdout = this.generateId()
    private static readonly fakeStderr = this.generateId()

    private static readonly fakeResult = {
        stdout: this.fakeStdout,
        stderr: this.fakeStderr,
    } as unknown as ChildProcess

    protected static async beforeEach() {
        await super.beforeEach()

        setFakeExecResult(this.bashCommand, this.fakeResult)

        this.instance = await this.run()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(
            this.instance,
            `Failed to create instance for ${this.buildLabrecorderCommand}!`
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

    @test()
    protected static async logsStdoutToConsole() {
        assert.isEqual(
            callsToLog[0].message,
            this.fakeStdout,
            'Did not log expected stdout to console!'
        )
    }

    @test()
    protected static async logsStderrToConsole() {
        assert.isEqual(
            callsToError[0].message,
            this.fakeStderr,
            'Did not log expected stderr to console!'
        )
    }

    private static async run() {
        const instance = this.CliCommandRunner([this.buildLabrecorderCommand])
        await instance.run()

        return instance
    }

    private static readonly bashCommand = `sudo rm -rf build/ \
&& cmake -S . -B build \
  -DCMAKE_INSTALL_PREFIX=/opt/local \
  -DLSL_INSTALL_ROOT=/opt/local \
  -DLSL_UNIXFOLDERS=1 \
  -DBUILD_GUI=OFF \
&& cmake --build build \
&& sudo cmake --install build`
}
