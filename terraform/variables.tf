variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
}

variable "docs_auth_jwt_secret" {
  description = "Secret key for signing JWT tokens for documentation authentication"
  type        = string
  sensitive   = true
}

variable "docs_auth_password_hash" {
  description = "Hashed password for documentation site authentication (format: algorithm:salt:hash)"
  type        = string
  sensitive   = true
}

variable "use_custom_domain" {
  description = "Whether to use a custom domain for API Gateway"
  type        = bool
  default     = false
}

variable "api_domain_name" {
  description = "Custom domain name for API Gateway (only used if use_custom_domain is true)"
  type        = string
  default     = ""
}