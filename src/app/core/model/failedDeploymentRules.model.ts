export interface Documentation {
    content: string[];
}

export interface FailedDeploymentRule {
    documentation: Documentation[];
    id: string;
    name: string;
    target_namespace: string;
}

export interface FailedDeploymentRules {
    error_message: string;
    failed_deployment_rules: FailedDeploymentRule[];
}
