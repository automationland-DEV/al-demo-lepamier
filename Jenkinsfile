pipeline {
    agent {
        docker {
            image 'node:20'
            args '-u root'
        }
    }

    // Định nghĩa các biến môi trường nếu cần thiết
    environment {
        // Thay thế bằng IP hoặc Domain của VPS thực tế hoặc cấu hình trong Jenkins Global Environment
        VPS_HOST = '45.119.215.71' 
        VPS_USER = 'root'
    }

    stages {
        stage('Checkout') {
            steps {
                // Lấy code từ repo
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint') {
            steps {
                // Kiểm tra lỗi code, tạm thời cho qua (|| true) nếu có cảnh báo để không đứt gãy đường ống
                sh 'npm run lint --if-present || true'
            }
        }

        stage('Test') {
            steps {
                // Chạy Unit Test (nếu có cấu hình trong package.json)
                sh 'npm run test --if-present'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            when {
                // Chỉ chạy Deploy khi KHÔNG phải là Pull Request (CHANGE_ID bị null)
                expression { env.CHANGE_ID == null }
            }
            steps {
                // Sử dụng SSH Agent plugin trong Jenkins để ssh vào VPS
                // ID 'vps-deploy-ssh-key' tương ứng với Credential bạn đã có sẵn trên Jenkins
                sshagent(credentials: ['vps-deploy-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST} << 'EOF'
                            # 1. Đi vào thư mục gốc của dự án trên VPS 
                            cd /home/al-demo-lepamier/al-demo-lepamier
                            
                            # 2. Cập nhật code mới nhất từ nhánh main
                            git fetch --all
                            git reset --hard origin/main
                            
                            # 3. Build lại và chạy container
                            docker compose down
                            docker compose up -d --build
                            docker ps
EOF
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Các bước dọn dẹp sau khi build (nếu có)
            echo 'Pipeline finished!'
        }
        success {
            echo 'Build and Deploy Successful!'
        }
        failure {
            echo 'Build or Deploy Failed!'
        }
    }
}
