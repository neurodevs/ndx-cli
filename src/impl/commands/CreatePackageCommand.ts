import { NpmAutopackage } from '@neurodevs/meta-node'

import CliCommandRunner from '../CliCommandRunner.js'
import expandHomeDir from '../expandHomeDir.js'

export default class CreatePackageCommand {
    private packageName!: string
    private description!: string
    private keywords!: string[]

    public constructor() {}

    public async run() {
        const { packageName, description, keywords } =
            await this.promptForAutopackage()

        this.packageName = packageName
        this.description = description
        this.keywords = keywords

        if (!this.userInputExistsForCreatePackage) {
            return
        }

        const autopackage = this.NpmAutopackage()
        await autopackage.run()
    }

    private async promptForAutopackage() {
        return await this.prompts([
            {
                type: 'text',
                name: 'packageName',
                message: this.packageNameMessage,
            },
            {
                type: 'text',
                name: 'description',
                message: this.descriptionMessage,
            },
            {
                type: 'text',
                name: 'keywords',
                message: this.keywordsMessage,
                initial: '',
                format: (value) =>
                    value ? this.splitOnCommaOrWhitespace(value) : [],
            },
        ])
    }

    private readonly packageNameMessage =
        'What should the package be called? Example: useful-package'

    private readonly descriptionMessage =
        'What should the package description be? Example: A useful package.'

    private readonly keywordsMessage =
        'Enter keywords (comma or space separated, lowercase, optional):'

    private splitOnCommaOrWhitespace(value: string) {
        return value
            .split(/[\s,]+/)
            .map((v: string) => v.trim())
            .filter(Boolean)
    }

    private get userInputExistsForCreatePackage() {
        return this.packageName && this.description
    }

    private get prompts() {
        return CliCommandRunner.prompts
    }

    private NpmAutopackage() {
        return NpmAutopackage.Create({
            name: this.packageName,
            description: this.description,
            keywords: ['nodejs', 'typescript', 'tdd', ...this.keywords],
            gitNamespace: 'neurodevs',
            npmNamespace: 'neurodevs',
            installDir: expandHomeDir('~/dev'),
            license: 'MIT',
            author: 'Eric Yates <hello@ericthecurious.com>',
        })
    }
}
