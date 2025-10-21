import { test, assert } from '@sprucelabs/test-utils'
import generateId from '@neurodevs/generate-id'
import { FakeAutopackage } from '@neurodevs/meta-node'
import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest'

export default class UpgradePackageCommandTest extends AbstractCommandRunnerTest {
    protected static async beforeEach() {
        await super.beforeEach()
    }

    @test()
    protected static async createsInstance() {
        const instance = await this.run()

        assert.isTruthy(
            instance,
            `Failed to create instance for ${this.upgradePackageCommand}!`
        )
    }

    @test()
    protected static async createsNpmAutopackage() {
        await this.run()

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0],
            {
                ...this.infoFromPackageJson,
                name: `${this.packageName}`,
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

    @test()
    protected static async addsDefaultKeywordsIfMissing() {
        await this.run({
            name: this.packageName,
            description: this.description,
            keywords: [] as string[],
        })

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0]?.keywords,
            this.defaultKeywords,
            'Did not add default keywords!'
        )
    }

    @test()
    protected static async doesNotOverwriteKeywordsEvenIfDefaultsMissing() {
        const keywords = [generateId(), generateId()]

        await this.run({
            name: this.packageName,
            description: this.description,
            keywords,
        })

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0]?.keywords,
            [...this.defaultKeywords, ...keywords],
            'Should not have overwritten keywords!'
        )
    }

    @test()
    protected static async extractsPackageNameFromScopedName() {
        await this.run({
            name: this.packageName,
            description: this.description,
            keywords: this.keywordsWithDefaults,
        })

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0]?.name,
            this.packageName,
            'Did not extract package name from scoped name!'
        )
    }

    private static async run(responses?: Record<string, string | string[]>) {
        this.setFakePackageJson(responses)

        const instance = this.CliCommandRunner([this.upgradePackageCommand])
        await instance.run()

        return instance
    }
}
