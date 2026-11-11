pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'node23'
    }

    environment {
        AWS_REGION = 'ap-southeast-2'
        AWS_ACCOUNT_ID = '471371516697'
        ECR_REPOSITORY = 'snake-and-ladder'
        EKS_CLUSTER_NAME = 'YOUR-EKS-CLUSTER-NAME'

        IMAGE_NAME = 'snake-and-ladder'
        IMAGE_TAG = 'latest'

        SCANNER_HOME = tool 'sonar-scanner'
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout from Git') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/sravanichitti2002janu/snake-and-ladder.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectName=Snake-and-Ladder \
                        -Dsonar.projectKey=snake-and-ladder \
                        -Dsonar.sources=src
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate(
                        abortPipeline: false,
                        credentialsId: 'Sonar-token'
                    )
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck(
                    additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit',
                    odcInstallation: 'DP-Check'
                )

                dependencyCheckPublisher(
                    pattern: '**/dependency-check-report.xml'
                )
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                sh '''
                    trivy fs . > trivyfs.txt
                '''
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    sh '''
                        docker build -t $IMAGE_NAME:$IMAGE_TAG .
                    '''
                }
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                    trivy image $IMAGE_NAME:$IMAGE_TAG > trivy.txt
                '''
            }
        }

        stage('Push Image to AWS ECR') {
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin \
                    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

                    docker tag $IMAGE_NAME:$IMAGE_TAG \
                    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG

                    docker push \
                    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy to AWS EKS') {
            steps {
                sh '''
                    aws eks update-kubeconfig \
                    --region $AWS_REGION \
                    --name $EKS_CLUSTER_NAME

                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml

                    kubectl set image deployment/snake-and-ladder \
                    snake-and-ladder=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG

                    kubectl rollout status deployment/snake-and-ladder
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    kubectl get pods
                    kubectl get services
                    kubectl get deployments
                '''
            }
        }
    }

    post {
        always {
            echo 'Snake and Ladder CI/CD Pipeline Completed'
        }
    }
}
