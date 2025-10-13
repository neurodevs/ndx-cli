export let callsToMkdir: string[] = []

export function resetCallsToMkdir() {
    callsToMkdir = []
}

export default async function mkdir(path: string) {
    callsToMkdir.push(path)
}
