require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-db';

// 환경변수 확인 로그
console.log('📋 환경변수 확인:');
console.log('MONGO_URI:', MONGO_URI ? `${MONGO_URI.substring(0, 20)}...` : '없음');

// Middleware
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo Backend API 서버가 실행 중입니다.',
    endpoints: {
      'GET /todos': '할일 목록 조회',
      'POST /todos': '할일 생성',
      'PUT /todos/:id': '할일 수정',
      'DELETE /todos/:id': '할일 삭제'
    }
  });
});

// 라우터
const todoRouter = require('./routers/todo');
app.use('/api/todos', todoRouter);
app.use('/todos', todoRouter);

// MongoDB 연결 옵션
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5초 타임아웃
  socketTimeoutMS: 45000, // 소켓 타임아웃
};

// MongoDB 연결 상태 이벤트 리스너
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB 연결이 끊어졌습니다.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB 연결 에러:', err);
});

// MongoDB 연결 후 서버 시작
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, mongooseOptions);
    console.log('✅ MongoDB 연결 성공');
    console.log('📊 연결된 데이터베이스:', mongoose.connection.db.databaseName);
    
    // MongoDB 연결 성공 후 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (err) {
    console.error('❌ MongoDB 연결 실패:', err.message);
    console.error('⚠️ 서버는 계속 실행되지만 MongoDB 연결 없이 동작합니다.');
    
    // 연결 실패해도 서버는 시작 (Heroku 요구사항)
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다. (MongoDB 연결 없음)`);
    });
  }
}

// 서버 시작
startServer();

