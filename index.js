require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-db';

// 환경변수 확인 로그
console.log('📋 환경변수 확인:');
console.log('MONGO_URI 존재 여부:', MONGO_URI ? '있음' : '없음');
if (MONGO_URI) {
  // 민감한 정보는 마스킹
  const maskedURI = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log('MONGO_URI (마스킹):', maskedURI);
}

// Middleware
app.use(cors({
  origin: [
    'https://vibe-todo-frontend-8c1ms786r-heathers-projects-81cf1aab.vercel.app',
    'https://vibe-todo-frontend-delta.vercel.app',
    'https://vibe-todo-frontend-kg2m6egxv-heathers-projects-81cf1aab.vercel.app', // 현재 URL 추가
    'http://localhost:5173'
  ],
  credentials: true // 필요시 추가
}));
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
  serverSelectionTimeoutMS: 30000, // 30초 타임아웃 (증가)
  socketTimeoutMS: 45000, // 소켓 타임아웃
  connectTimeoutMS: 30000, // 연결 타임아웃 추가
  maxPoolSize: 10, // 연결 풀 크기
  bufferMaxEntries: 0, // 버퍼링 비활성화 (연결 실패 시 즉시 에러)
  bufferCommands: false, // 버퍼링 비활성화
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
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI가 설정되지 않았습니다!');
    console.error('Heroku Config Vars에 MONGO_URI를 설정해주세요.');
    process.exit(1);
  }

  console.log('🔄 MongoDB 연결 시도 중...');
  console.log('연결 문자열 길이:', MONGO_URI ? MONGO_URI.length : 0);
  console.log('연결 문자열 시작:', MONGO_URI ? MONGO_URI.substring(0, 30) : '없음');
  
  try {
    console.log('mongoose.connect() 호출 시작...');
    await mongoose.connect(MONGO_URI, mongooseOptions);
    console.log('mongoose.connect() 완료');
    console.log('✅ MongoDB 연결 성공');
    console.log('📊 연결된 데이터베이스:', mongoose.connection.db.databaseName);
    console.log('📊 연결 상태:', mongoose.connection.readyState === 1 ? '연결됨' : '연결 안됨');
    
    // MongoDB 연결 성공 후 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (err) {
    console.error('❌ MongoDB 연결 실패:');
    console.error('에러 메시지:', err.message);
    console.error('에러 이름:', err.name);
    if (err.reason) {
      console.error('에러 이유:', err.reason);
    }
    console.error('전체 에러 스택:', err.stack);
    console.error('⚠️ 서버는 계속 실행되지만 MongoDB 연결 없이 동작합니다.');
    
    // 연결 실패해도 서버는 시작 (Heroku 요구사항)
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다. (MongoDB 연결 없음)`);
    });
  }
}

// 서버 시작
startServer();

