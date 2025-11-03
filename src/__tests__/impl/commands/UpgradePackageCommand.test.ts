import { FakeAutopackage } from '@neurodevs/meta-node'
import { test, assert } from '@neurodevs/node-tdd'

import AbstractCommandRunnerTest from '../../AbstractCommandRunnerTest.js'

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
        const keywords = [this.generateId(), this.generateId()]

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
            name: `${this.generateId()}/${this.packageName}`,
            description: this.description,
            keywords: this.keywordsWithDefaults,
        })

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0]?.name,
            this.packageName,
            'Did not extract package name from scoped name!'
        )
    }

    @test()
    protected static async extractsNpmNamespaceFromScopedName() {
        const npmNamespace = this.generateId()

        const scopedName = `@${npmNamespace}/${this.packageName}`

        await this.run({
            name: scopedName,
        })

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0]?.npmNamespace,
            npmNamespace,
            'Did not use scoped name from package.json!'
        )
    }

    @test()
    protected static async extractsGitNamespaceFromRepositoryUrl() {
        const gitNamespace = this.generateId()
        const repositoryUrl = `git+https://github.com/${gitNamespace}/${this.packageName}.git`

        await this.run({
            repository: {
                url: repositoryUrl,
            },
        })

        assert.isEqualDeep(
            FakeAutopackage.callsToConstructor[0]?.gitNamespace,
            gitNamespace,
            'Did not use git namespace from repository URL!'
        )
    }

    private static async run(
        responses?: Record<string, string | string[] | object>
    ) {
        this.setFakePackageJson(responses)

        const instance = this.CliCommandRunner([this.upgradePackageCommand])
        await instance.run()

        return instance
    }
}
