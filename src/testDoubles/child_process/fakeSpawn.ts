import { SpawnOptions } from 'node:child_process'
import { EventEmitter } from 'node:events'

export interface SpawnCall {
    command: string
    args: string[]
    options?: SpawnOptions
}

export let callsToSpawn: SpawnCall[] = []

export function resetCallsToSpawn() {
    callsToSpawn = []
}

export let fakeSpawnExitCode = 0

export function setFakeSpawnExitCode(code: number) {
    fakeSpawnExitCode = code
}

export default function fakeSpawn(
    command: string,
    args: string[],
    options?: SpawnOptions
) {
    callsToSpawn.push({ command, args, options })

    const emitter = new EventEmitter()

    process.nextTick(() => emitter.emit('close', fakeSpawnExitCode))

    return emitter as any
}
