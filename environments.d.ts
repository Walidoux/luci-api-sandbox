declare global {
    namespace NodeJS {
        interface ProcessEnv extends Record<"PSWD" | 'INCLUDE_LOCAL_PAYLOADS' | 'NETWORK_INTERFACE', string> {

        }
    }
}

export { }