const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Todo = require('../models/Todo');

// 할일 목록 조회
router.get('/', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: '데이터베이스 연결 실패', 
        message: 'MongoDB에 연결할 수 없습니다. 서버 관리자에게 문의하세요.' 
      });
    }
    
    const todos = await Todo.find().sort({ createdAt: -1 });
    console.log(`📋 할일 목록 조회: ${todos.length}개`);
    res.status(200).json(todos);
  } catch (error) {
    console.error('할일 조회 에러:', error);
    
    // MongoDB 연결 상태 재확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: '데이터베이스 연결 실패', 
        message: 'MongoDB에 연결할 수 없습니다. 서버 관리자에게 문의하세요.' 
      });
    }
    
    res.status(500).json({ 
      error: '할일 조회 실패', 
      message: error.message 
    });
  }
});

// 할일 생성
router.post('/', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: '데이터베이스 연결 실패', 
        message: 'MongoDB에 연결할 수 없습니다. 서버 관리자에게 문의하세요.' 
      });
    }
    
    const { title, deadline } = req.body;  // deadline 추가

    if (!title) {
      return res.status(400).json({ error: '제목은 필수입니다.' });
    }

    const todoData = { title };
    if (deadline) {
      todoData.deadline = deadline;
    }

    console.log('➕ 할일 생성 요청:', todoData);
    const todo = new Todo(todoData);
    await todo.save();
    console.log('✅ 할일 생성 완료:', todo._id, todo.title);

    res.status(201).json(todo);
  } catch (error) {
    console.error('❌ 할일 생성 에러:', error);
    res.status(500).json({ error: '할일 생성 실패', message: error.message });
  }
});

// 할일 수정
router.put('/:id', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: '데이터베이스 연결 실패', 
        message: 'MongoDB에 연결할 수 없습니다. 서버 관리자에게 문의하세요.' 
      });
    }
    
    const { id } = req.params;
    const { title, deadline, completed } = req.body;  // deadline, completed 추가

    if (!title) {
      return res.status(400).json({ error: '제목은 필수입니다.' });
    }

    const updateData = { title };
    
    // deadline이 제공되면 업데이트 (null도 허용)
    if (deadline !== undefined) {
      updateData.deadline = deadline || null;
    }
    
    // completed가 제공되면 업데이트
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const todo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ error: '할일을 찾을 수 없습니다.' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: '할일 수정 실패', message: error.message });
  }
});

// 할일 삭제
router.delete('/:id', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: '데이터베이스 연결 실패', 
        message: 'MongoDB에 연결할 수 없습니다. 서버 관리자에게 문의하세요.' 
      });
    }
    
    const { id } = req.params;

    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({ error: '할일을 찾을 수 없습니다.' });
    }

    res.json({ message: '할일이 삭제되었습니다.', todo });
  } catch (error) {
    res.status(500).json({ error: '할일 삭제 실패', message: error.message });
  }
});

module.exports = router;