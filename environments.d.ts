declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ROUTER_ADDRESS?: string
            WIFI_PASSWORD?: string
        }
    }
}

export {}