/**
 * Checks whether WebAssembly is supported in the current environment.
 */
function isWebAssemblySupported() {
    try {
        return (!!window.WebAssembly &&
            (!!window.WebAssembly.compile || !!window.WebAssembly.compileStreaming));
    }
    catch (e) {
        return false;
    }
}

export { isWebAssemblySupported };
