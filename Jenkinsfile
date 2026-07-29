pipeline {
    agent any

    // Kích hoạt NodeJS đã cài trong Jenkins (cần plugin NodeJS và cài đặt Tool tên là 'node20')
    tools {
        nodejs 'node20'
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

        stage('Verify & Build') {
            steps {
                // Yêu cầu Jenkins Agent đã cài đặt sẵn Node.js (phiên bản 20)
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Deploy') {
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
