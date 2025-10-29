import {
    callsToExec,
    resetCallsToExec,
    callsToWriteFile,
    callsToMkdir,
} from '@neurodevs/fake-node-core'
import { FakeAutomodule } from '@neurodevs/meta-node'
import { assert, test } from '@neurodevs/node-tdd'

import {
    callsToFakePrompts,
    setFakeResponses,
} from '../../../testDoubles/prompts/fakePrompts.js'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

export default class CreateUiCommandTest extends AbstractCommandRunnerTest {
    protected static async beforeEach() {
        await super.beforeEach()
    }

    @test()
    protected static async createsInstance() {
        const instance = await this.run()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.createUiCommand}!`
        )
    }

    @test()
    protected static async promptsInstallDependenciesIfMissing() {
        this.setFakeReadToEmptyPackageJson()

        await this.run()

        assert.isEqualDeep(
            callsToFakePrompts[0],
            [
                {
                    type: 'confirm',
                    name: 'shouldInstall',
                    message:
                        'Some required dependencies are missing! Press Enter to install, or any other key to abort.',
                    initial: true,
                },
            ],
            'Did not prompt user for expected input!'
        )
    }

    @test()
    protected static async installsDependenciesIfMissing() {
        this.setFakeReadToEmptyPackageJson()

        await this.run({
            shouldInstall: true,
        })

        assert.isEqualDeep(
            callsToExec[0],
            this.installDependenciesCommand,
            'Did not install dependencies!'
        )
    }

    @test()
    protected static async installsDevDependenciesIfMissing() {
        this.setFakeReadToEmptyPackageJson()

        await this.run({
            shouldInstall: true,
        })

        assert.isEqualDeep(
            callsToExec[1],
            this.installDevDependenciesCommand,
            'Did not install dependencies!'
        )
    }

    @test()
    protected static async installsIfAnyDepIsMissing() {
        for (const dep of this.allRequiredDependencies) {
            this.setFakeReadToAllInstalledExcept(dep)
            resetCallsToExec()

            await this.run({
                shouldInstall: true,
            })

            assert.isEqual(
                callsToExec[1],
                this.installDevDependenciesCommand,
                'Should not have installed devDependencies!'
            )
        }
    }

    @test()
    protected static async updatesTsconfigIfDepsWereMissing() {
        this.setFakeReadToEmptyPackageJson()
        this.setFakeReadFileResultToTsconfig()

        await this.run({
            shouldInstall: true,
        })

        assert.isEqualDeep(
            callsToWriteFile[0],
            {
                file: this.tsconfigPath,
                data: this.updatedTsconfigFile,
                options: undefined,
            },
            'Did not update tsconfig!'
        )
    }

    @test()
    protected static async createsSetupTestsIfDepsWereMissing() {
        this.setFakeReadToEmptyPackageJson()

        await this.run({
            shouldInstall: true,
        })

        assert.isEqualDeep(
            callsToWriteFile[1],
            {
                file: 'src/__tests__/setupTests.ts',
                data: this.setupTestsFile,
                options: undefined,
            },
            'Did not create setupTests script!'
        )
    }

    @test()
    protected static async addsSetupTestsToPackageJsonIfDepsWereMissing() {
        this.setFakeReadToEmptyPackageJson()

        await this.run({
            shouldInstall: true,
        })

        assert.isEqualDeep(
            callsToWriteFile[2],
            {
                file: 'package.json',
                data: JSON.stringify(
                    {
                        jest: {
                            setupFiles: [
                                '<rootDir>/build/__tests__/setupTests.js',
                            ],
                        },
                    },
                    null,
                    4
                ),
                options: undefined,
            },
            'Did not update package.json!'
        )
    }

    @test()
    protected static async recompilesTypescriptIfDepsWereMissing() {
        this.setFakeReadToEmptyPackageJson()

        await this.run({
            shouldInstall: true,
        })

        assert.isEqualDeep(
            callsToExec[2],
            'npx tsc',
            'Did not recompile typescript!'
        )
    }

    @test()
    protected static async doesNotPromptIfDependenciesAreInstalled() {
        this.setFakeReadToAllInstalled()

        await this.run()

        assert.isEqual(callsToFakePrompts.length, 1, 'Prompted too many times!')
    }

    @test()
    protected static async promptsUserForInput() {
        this.setFakeReadToAllInstalled()

        await this.run()

        assert.isEqualDeep(
            callsToFakePrompts[0],
            [
                {
                    type: 'text',
                    name: 'componentName',
                    message: this.componentNameMessage,
                },
            ],
            'Did not prompt user for expected input!'
        )
    }

    @test()
    protected static async doesNotContinueIfPromptsIsInterrupted() {
        await this.run({
            componentName: '',
        })

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            0,
            'Should not have called run on UiAutomodule!'
        )
    }

    @test()
    protected static async createsTestSaveDirIfNotExists() {
        await this.run()

        assert.isEqualDeep(
            callsToMkdir[0],
            { path: this.uiTestSaveDir, options: { recursive: true } },
            'Did not create test save dir!'
        )
    }

    @test()
    protected static async createsModuleSaveDirIfNotExists() {
        await this.run()

        assert.isEqualDeep(
            callsToMkdir[1],
            { path: this.uiModuleSaveDir, options: { recursive: true } },
            'Did not create module save dir!'
        )
    }

    @test()
    protected static async createsFakeSaveDirIfNotExists() {
        await this.run()

        assert.isEqualDeep(
            callsToMkdir[2],
            {
                path: this.uiFakeSaveDir,
                options: { recursive: true },
            },
            'Did not create fake save dir!'
        )
    }

    @test()
    protected static async createsUiAutomodule() {
        await this.run()

        assert.isEqualDeep(
            FakeAutomodule.callsToConstructor[0],
            {
                testSaveDir: this.uiTestSaveDir,
                moduleSaveDir: this.uiModuleSaveDir,
                fakeSaveDir: this.uiFakeSaveDir,
                componentName: this.componentName,
            },
            'Did not create UiAutomodule with expected options!'
        )
    }

    @test()
    protected static async runsUiAutomodule() {
        await this.run()

        assert.isEqual(
            FakeAutomodule.numCallsToRun,
            1,
            'Did not call run on UiAutomodule!'
        )
    }

    private static async run(responses?: Record<string, string | boolean>) {
        setFakeResponses({
            componentName: this.componentName,
            ...responses,
        })

        const instance = this.CliCommandRunner([this.createUiCommand])
        await instance.run()

        return instance
    }
}
