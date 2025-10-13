export let callsToMkdir: { path: string; options: any }[] = []

export function resetCallsToMkdir() {
    callsToMkdir = []
}

export default async function fakeMkdir(
    path: string,
    options: Record<string, boolean>
) {
    callsToMkdir.push({ path, options })
}
