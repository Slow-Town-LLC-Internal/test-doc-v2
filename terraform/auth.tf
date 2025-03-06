###################################
# Documentation Auth Infrastructure
###################################

# Lambda for password authentication
resource "aws_lambda_function" "docs_auth" {
  function_name = "${var.project_name}-${var.environment}-docs-auth"
  description   = "Authentication for API documentation site"
  role          = aws_iam_role.docs_auth_lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs16.x"
  timeout       = 10
  memory_size   = 128

  filename         = data.archive_file.docs_auth_lambda_zip.output_path
  source_code_hash = data.archive_file.docs_auth_lambda_zip.output_base64sha256

  environment {
    variables = {
      ENVIRONMENT   = var.environment
      JWT_SECRET    = var.docs_auth_jwt_secret
      PASSWORD_HASH = var.docs_auth_password_hash
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-docs-auth"
    Environment = var.environment
    Project     = var.project_name
    Terraform   = "true"
  }
}

# Zip file for Lambda code
data "archive_file" "docs_auth_lambda_zip" {
  type        = "zip"
  output_path = "${path.module}/files/docs_auth_lambda.zip"
  source {
    content  = file("${path.module}/files/docs_auth_lambda.js")
    filename = "index.js"
  }
}

# IAM role for Lambda
resource "aws_iam_role" "docs_auth_lambda_role" {
  name = "${var.project_name}-${var.environment}-docs-auth-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-docs-auth-role"
    Environment = var.environment
    Project     = var.project_name
    Terraform   = "true"
  }
}

# Basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "docs_auth_lambda_basic" {
  role       = aws_iam_role.docs_auth_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "docs_api" {
  name        = "${var.project_name}-${var.environment}-docs-api"
  description = "API Gateway for documentation authentication"

  tags = {
    Name        = "${var.project_name}-${var.environment}-docs-api"
    Environment = var.environment
    Project     = var.project_name
    Terraform   = "true"
  }
}

# API Gateway resource for auth endpoint
resource "aws_api_gateway_resource" "docs_auth" {
  rest_api_id = aws_api_gateway_rest_api.docs_api.id
  parent_id   = aws_api_gateway_rest_api.docs_api.root_resource_id
  path_part   = "auth"
}

# API Gateway method for auth endpoint
resource "aws_api_gateway_method" "docs_auth_post" {
  rest_api_id   = aws_api_gateway_rest_api.docs_api.id
  resource_id   = aws_api_gateway_resource.docs_auth.id
  http_method   = "POST"
  authorization_type = "NONE"
}

# API Gateway integration with Lambda
resource "aws_api_gateway_integration" "docs_auth_lambda" {
  rest_api_id             = aws_api_gateway_rest_api.docs_api.id
  resource_id             = aws_api_gateway_resource.docs_auth.id
  http_method             = aws_api_gateway_method.docs_auth_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.docs_auth.invoke_arn
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "docs_auth_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.docs_auth.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.docs_api.execution_arn}/*/*"
}

# CORS configuration
resource "aws_api_gateway_method" "docs_auth_options" {
  rest_api_id   = aws_api_gateway_rest_api.docs_api.id
  resource_id   = aws_api_gateway_resource.docs_auth.id
  http_method   = "OPTIONS"
  authorization_type = "NONE"
}

resource "aws_api_gateway_integration" "docs_auth_options" {
  rest_api_id = aws_api_gateway_rest_api.docs_api.id
  resource_id = aws_api_gateway_resource.docs_auth.id
  http_method = aws_api_gateway_method.docs_auth_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "docs_auth_options_200" {
  rest_api_id = aws_api_gateway_rest_api.docs_api.id
  resource_id = aws_api_gateway_resource.docs_auth.id
  http_method = aws_api_gateway_method.docs_auth_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "docs_auth_options_response" {
  rest_api_id = aws_api_gateway_rest_api.docs_api.id
  resource_id = aws_api_gateway_resource.docs_auth.id
  http_method = aws_api_gateway_method.docs_auth_options.http_method
  status_code = aws_api_gateway_method_response.docs_auth_options_200.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Deployment and stage
resource "aws_api_gateway_deployment" "docs_api" {
  depends_on = [
    aws_api_gateway_integration.docs_auth_lambda,
    aws_api_gateway_integration.docs_auth_options
  ]

  rest_api_id = aws_api_gateway_rest_api.docs_api.id
  stage_name  = var.environment

  lifecycle {
    create_before_destroy = true
  }
}

# Get custom domain information if available
data "aws_api_gateway_domain_name" "api_domain" {
  count = var.use_custom_domain ? 1 : 0
  domain_name = var.api_domain_name
}

# Map API gateway to custom domain if available
resource "aws_api_gateway_base_path_mapping" "docs_api" {
  count = var.use_custom_domain ? 1 : 0
  
  api_id      = aws_api_gateway_rest_api.docs_api.id
  stage_name  = aws_api_gateway_deployment.docs_api.stage_name
  domain_name = data.aws_api_gateway_domain_name.api_domain[0].domain_name
  base_path   = "docs"
}

# Output values
output "docs_auth_api_url" {
  value = var.use_custom_domain ? "https://${var.api_domain_name}/docs/auth" : "${aws_api_gateway_deployment.docs_api.invoke_url}/auth"
  description = "URL for the documentation authentication API"
}