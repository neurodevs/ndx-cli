import AbstractModuleTest from '@neurodevs/node-tdd'

export default class AbstractPackageTest extends AbstractModuleTest {
    protected static async beforeEach() {
        await super.beforeEach()
    }

    protected static npmRepoNames = [
        'commit-sense',
        'fake-node-core',
        'generate-id',
        'i-insula',
        'meta-node',
        'ndx-cli',
        'node-biometrics',
        'node-biosensors',
        'node-biosignal-processing',
        'node-ble',
        'node-causality',
        'node-lsl',
        'node-mangled-names',
        'node-neuropype',
        'node-osf',
        'node-robotic-arm',
        'node-runtime-monitors',
        'node-server-plots',
        'node-signal-processing',
        'node-task-queue',
        'node-tdd',
        'node-test-counter',
        'node-wifi-connector',
        'node-xdf',
        'personomic',
        'react-biosensors',
        'react-connectivity-graphs',
        'react-github-badge',
    ]

    protected static repoNames = [
        'fili.js',
        'labrecorder',
        'liblsl',
        'libxdf',
        ...this.npmRepoNames,
    ]
}
