import { PresetUrlsAutocloner } from '../../modules/NeurodevsAutocloner'

export default class FakeNeurodevsAutocloner implements PresetUrlsAutocloner {
    public static numCallsToConstructor = 0
    public static callsToRun: string[] = []

    public async run(dirPath: string) {
        FakeNeurodevsAutocloner.callsToRun.push(dirPath)
    }

    public static resetTestDouble() {
        FakeNeurodevsAutocloner.numCallsToConstructor = 0
        FakeNeurodevsAutocloner.callsToRun = []
    }
}
