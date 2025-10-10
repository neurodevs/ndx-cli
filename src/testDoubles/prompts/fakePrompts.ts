export let callsToFakePrompts: Record<string, string>[][] = []

export function resetCallsToFakePrompts() {
    callsToFakePrompts = []
}

export function fakePrompts(questions: Record<string, string>[]) {
    callsToFakePrompts.push(questions)
    return Promise.resolve({})
}
