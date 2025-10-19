import { assert, test } from '@sprucelabs/test-utils'
import { FakeAutopackage } from '@neurodevs/meta-node'
import {
    callsToFakePrompts,
    setFakeResponses,
} from '../../../testDoubles/prompts/fakePrompts'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest'

export default class CreatePackageCommandTest extends AbstractCommandRunnerTest {
    protected static async beforeEach() {
        await super.beforeEach()
    }

    @test()
    protected static async createsInstance() {
        const instance = await this.run()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.createPackageCommand}!`
        )
    }

    @test()
    protected static async promptsUserForInput() {
        await this.run()

        assert.isEqualDeep(
            JSON.stringify(callsToFakePrompts[0]),
            JSON.stringify([
                {
                    type: 'text',
                    name: 'packageName',
                    message: this.packageNameMessage,
                },
                {
                    type: 'text',
                    name: 'description',
                    message: this.packageDescriptionMessage,
                },
                {
                    type: 'text',
                    name: 'keywords',
                    message:
                        'Enter keywords (comma or space separated, lowercase, optional):',
                    initial: '',
                    format: (value: string) =>
                        value ? this.splitOnCommaOrWhitespace(value) : [],
                },
            ]),
            'Did not prompt user for expected input!'
        )
    }

    @test()
    protected static async doesNotContinueIfPromptsIsInterrupted() {
        await this.run({
            packageName: '',
            description: '',
        })

        assert.isEqual(
            FakeAutopackage.numCallsToRun,
            0,
            'Should not have called run on Autopackage!'
        )
    }

    @test()
    protected static async createsNpmAutopackage() {
        await this.run()

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0],
            {
                name: this.packageName,
                description: this.description,
                keywords: this.keywordsWithDefaults,
                gitNamespace: 'neurodevs',
                npmNamespace: 'neurodevs',
                installDir: this.expandHomeDir('~/dev'),
                license: 'MIT',
                author: 'Eric Yates <hello@ericthecurious.com>',
            },
            'Did not create NpmAutopackage with expected options!'
        )
    }

    @test()
    protected static async runsNpmAutopackage() {
        await this.run()

        assert.isEqual(
            FakeAutopackage.numCallsToRun,
            1,
            'Did not call run on NpmAutopackage!'
        )
    }

    private static async run(responses?: Record<string, string>) {
        setFakeResponses({
            packageName: this.packageName,
            description: this.description,
            keywords: this.keywords,
            ...responses,
        })

        const instance = this.CliCommandRunner([this.createPackageCommand])
        await instance.run()

        return instance
    }
}
