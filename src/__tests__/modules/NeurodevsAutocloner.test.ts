import AbstractSpruceTest, {
    test,
    assert,
    generateId,
} from '@sprucelabs/test-utils'
import { FakeAutocloner, GitAutocloner } from '@neurodevs/meta-node'
import NeurodevsAutocloner, {
    PresetUrlsAutocloner,
} from '../../modules/NeurodevsAutocloner'

export default class NeurodevsAutoclonerTest extends AbstractSpruceTest {
    private static instance: PresetUrlsAutocloner

    protected static async beforeEach() {
        await super.beforeEach()

        this.setFakeAutocloner()

        this.instance = this.NeurodevsAutocloner()
    }

    @test()
    protected static async canCreateNeurodevsAutocloner() {
        assert.isTruthy(this.instance, 'Should create a new instance!')
    }

    @test()
    protected static async createsGitAutocloner() {
        assert.isEqual(
            FakeAutocloner.numCallsToConstructor,
            1,
            'Should create a new instance of GitAutocloner!'
        )
    }

    @test()
    protected static async callsGitAutoclonerWithExpectedOptions() {
        await this.instance.run(this.dirPath)

        const options = FakeAutocloner.callsToRun[0]

        assert.isEqualDeep(options, {
            urls: this.repoUrls,
            dirPath: this.dirPath,
        })
    }

    private static repoNames = [
        'fili.js',
        'labrecorder',
        'liblsl',
        'libxdf',
        'node-autocloner',
        'node-autopackage',
        'node-autoupgrader',
        'node-biometrics',
        'node-biosensors',
        'node-biosignal-experiments',
        'node-ble',
        'node-csv',
        'node-eeg',
        'node-file-checker',
        'node-file-loader',
        'node-html-loader',
        'node-knowledge-graphs',
        'node-lsl',
        'node-mangled-names',
        'node-neuropype',
        'node-ppg',
        'node-server-plots',
        'node-signal-processing',
        'node-task-queue',
        'node-test-counter',
        'node-xdf',
        'personomic',
    ]

    private static generateUrl(repoName: string) {
        return `https://github.com/neurodevs/${repoName}.git`
    }

    private static repoUrls = this.repoNames.map(this.generateUrl)

    private static readonly dirPath = generateId()

    private static setFakeAutocloner() {
        GitAutocloner.Class = FakeAutocloner
        FakeAutocloner.resetTestDouble()
    }

    private static NeurodevsAutocloner() {
        return NeurodevsAutocloner.Create()
    }
}
