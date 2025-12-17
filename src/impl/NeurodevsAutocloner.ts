import { Autocloner, GitAutocloner } from '@neurodevs/meta-node'
import npmRepoNames from '../npmRepoNames.js'

export default class NeurodevsAutocloner implements PresetUrlsAutocloner {
    public static Class?: PresetUrlsAutoclonerConstructor

    private autocloner: Autocloner
    private dirPath!: string

    protected constructor(autocloner: Autocloner) {
        this.autocloner = autocloner
    }

    public static Create() {
        const autocloner = this.GitAutocloner()
        return new (this.Class ?? this)(autocloner)
    }

    public async run(dirPath: string) {
        this.dirPath = dirPath
        await this.runGitCloner()
    }

    private async runGitCloner() {
        await this.autocloner.run({
            urls: this.repoUrls,
            dirPath: this.dirPath,
        })
    }

    private repoNames = [
        'fili.js',
        'labrecorder',
        'liblsl',
        'libxdf',
        ...npmRepoNames,
    ]

    private repoUrls = this.repoNames.map(this.generateUrl)

    private generateUrl(repoName: string) {
        return `https://github.com/neurodevs/${repoName}.git`
    }

    private static GitAutocloner() {
        return GitAutocloner.Create()
    }
}

export interface PresetUrlsAutocloner {
    run(dirPath: string): Promise<void>
}

export type PresetUrlsAutoclonerConstructor = new (
    cloner: Autocloner
) => PresetUrlsAutocloner
