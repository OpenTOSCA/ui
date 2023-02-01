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
    failed_wldeployment_rules: FailedDeploymentRule[];
    failed_bldeployment_rules: FailedDeploymentRule[];
}