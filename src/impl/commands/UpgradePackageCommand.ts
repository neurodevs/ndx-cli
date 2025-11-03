import { NpmAutopackage } from '@neurodevs/meta-node'

import CliCommandRunner from '../CliCommandRunner.js'
import expandHomeDir from '../expandHomeDir.js'

export default class UpgradePackageCommand {
    private packageName!: string
    private npmNamespace?: string
    private description!: string
    private keywords!: string[]

    public constructor() {}

    public async run() {
        await this.loadInfoFromPackageJson()

        const autopackage = this.NpmAutopackage()
        await autopackage.run()
    }

    private async loadInfoFromPackageJson() {
        const raw = await this.readFile('package.json', 'utf-8')
        const { name, description, keywords } = JSON.parse(raw)

        this.packageName = name.includes('/') ? name.split('/')[1] : name

        this.npmNamespace = name.includes('/')
            ? name.split('/')[0].replace('@', '')
            : ''

        this.description = description

        this.keywords = this.defaultKeywords.every((keyword) =>
            keywords?.includes(keyword)
        )
            ? keywords
            : [...this.defaultKeywords, ...(keywords || [])]
    }

    private readonly defaultKeywords = ['nodejs', 'typescript', 'tdd']

    private get readFile() {
        return CliCommandRunner.readFile
    }

    private NpmAutopackage() {
        return NpmAutopackage.Create({
            name: this.packageName,
            description: this.description,
            keywords: this.keywords,
            gitNamespace: 'neurodevs',
            npmNamespace: this.npmNamespace || 'neurodevs',
            installDir: expandHomeDir('~/dev'),
            license: 'MIT',
            author: 'Eric Yates <hello@ericthecurious.com>',
        })
    }
}
