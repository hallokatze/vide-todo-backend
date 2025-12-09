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

// 라우터
const todoRouter = require('./routers/todo');
app.use('/api/todos', todoRouter);
app.use('/todos', todoRouter);

// MongoDB 연결 옵션
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// MongoDB 연결
mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
    console.log('📊 연결된 데이터베이스:', mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error('❌ MongoDB 연결 실패:', err.message);
    process.exit(1); // 연결 실패 시 서버 종료
  });

// MongoDB 연결 상태 이벤트 리스너
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB 연결이 끊어졌습니다.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB 연결 에러:', err);
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

