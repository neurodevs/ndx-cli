import os from 'os'
import path from 'path'
import { NpmAutopackage } from '@neurodevs/meta-node'
import CliCommandRunner from '../CliCommandRunner'

export default class UpgradePackageCommand {
    private packageName!: string
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

        this.packageName = name
        this.description = description
        this.keywords = keywords || []
    }

    private expandHomeDir(inputPath: string): string {
        return inputPath.startsWith('~')
            ? path.join(os.homedir(), inputPath.slice(1))
            : inputPath
    }

    private get readFile() {
        return CliCommandRunner.readFile
    }

    private NpmAutopackage() {
        return NpmAutopackage.Create({
            name: this.packageName,
            description: this.description,
            keywords: this.keywords,
            gitNamespace: 'neurodevs',
            npmNamespace: 'neurodevs',
            installDir: this.expandHomeDir('~/dev'),
            license: 'MIT',
            author: 'Eric Yates <hello@ericthecurious.com>',
        })
    }
}
