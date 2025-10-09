export interface DeploymentConfig {
    railway: {
        testService: string;
        stagingService: string;
        productionService: string;
    };
    environmentVariables: {
        test: Record<string, string>;
        staging: Record<string, string>;
        production: Record<string, string>;
    };
    database: {
        test: string;
        staging: string;
        production: string;
    };
}
export declare const deploymentConfig: DeploymentConfig;
export declare const railwayConfigs: {
    test: {
        build: {
            builder: string;
        };
        deploy: {
            healthcheckPath: string;
            healthcheckTimeout: number;
            restartPolicyType: string;
        };
        services: ({
            name: string;
            source: string;
            env: {
                PORT: string;
                FIO_API_MODE: string;
            };
            buildCommand?: undefined;
            startCommand?: undefined;
        } | {
            name: string;
            source: string;
            buildCommand: string;
            startCommand: string;
            env: Record<string, string>;
        })[];
    };
    staging: {
        build: {
            builder: string;
        };
        deploy: {
            healthcheckPath: string;
            healthcheckTimeout: number;
            restartPolicyType: string;
        };
        services: ({
            name: string;
            source: string;
            env: {
                PORT: string;
            };
            buildCommand?: undefined;
            startCommand?: undefined;
        } | {
            name: string;
            source: string;
            buildCommand: string;
            startCommand: string;
            env: Record<string, string>;
        })[];
    };
    production: {
        build: {
            builder: string;
        };
        deploy: {
            healthcheckPath: string;
            healthcheckTimeout: number;
            restartPolicyType: string;
        };
        services: ({
            name: string;
            source: string;
            env: {
                PORT: string;
            };
            buildCommand?: undefined;
            startCommand?: undefined;
        } | {
            name: string;
            source: string;
            buildCommand: string;
            startCommand: string;
            env: Record<string, string>;
        })[];
    };
};
