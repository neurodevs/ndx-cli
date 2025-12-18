import { NpmPropagationCoordinator } from '@neurodevs/meta-node'

import npmRepoNames from '../../npmRepoNames.js'

export default class PropagateLatestCommand {
    public constructor() {}

    public async run() {
        const coordinator = this.NpmPropagationCoordinator()
        await coordinator.run()
    }

    private NpmPropagationCoordinator() {
        const repoPaths = npmRepoNames.map((name) => `../${name}`)
        return NpmPropagationCoordinator.Create('.', repoPaths)
    }
}
