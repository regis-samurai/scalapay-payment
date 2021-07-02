
export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry(ms, fn, object) {
    await sleep(ms);
    return fn(...object)
}