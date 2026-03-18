const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_PATH || './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(originalName));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mov|avi|wmv/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('지원하지 않는 파일 형식입니다.'));
        }
    }
});

// ✅ 관리자 비밀번호 검증 미들웨어
const verifyAdminPassword = (req, res, next) => {
    const { adminPassword } = req.body;

    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({
            success: false,
            message: '❌ 관리자 비밀번호가 올바르지 않습니다.'
        });
    }

    next();
};

// =================== 게시글 조회 (공개) ===================

// 게시글 목록 조회 (공개)
router.get('/posts', [
    query('page').optional().isInt({ min: 1 }).withMessage('페이지는 1 이상이어야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('한 페이지당 게시글 수는 1-50개여야 합니다.'),
    query('category').optional().isIn(['notice', 'general']).withMessage('유효하지 않은 카테고리입니다.'),
    query('search').optional().isString().withMessage('검색어는 문자열이어야 합니다.')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '잘못된 요청입니다.',
                errors: errors.array()
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const search = req.query.search;
        const skip = (page - 1) * limit;

        // 검색 조건 구성
        const searchCondition = {
            isDeleted: false,
            status: 'published'
        };

        if (category) {
            searchCondition.category = category;
        }

        if (search) {
            searchCondition.$text = { $search: search };
        }

        // 게시글 조회 (고정글 먼저, 그 다음 최신순)
        const posts = await Post.find(searchCondition)
            .populate('author', 'username name')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-content'); // 내용은 제외

        // 전체 게시글 수 조회
        const totalPosts = await Post.countDocuments(searchCondition);
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPosts,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('게시글 목록 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 게시글 상세 조회 (공개)
router.get('/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findOne({
            _id: postId,
            isDeleted: false,
            status: 'published'
        })
            .populate('author', 'username name')
            .populate('comments.author', 'username name');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        // 조회수 증가 (익명 사용자도 가능)
        post.viewCount += 1;
        await post.save();

        res.json({
            success: true,
            data: { post }
        });

    } catch (error) {
        console.error('게시글 상세 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});


// =================== 관리자 전용 기능 ===================

// ✅ 관리자 전용 - 게시글 작성
router.post('/posts', upload.array('attachments', 5), [
    body('title')
        .isLength({ min: 1, max: 200 })
        .withMessage('제목은 1-200자 사이여야 합니다.')
        .trim(),
    body('content')
        .isLength({ min: 1 })
        .withMessage('내용을 입력해주세요.')
        .trim(),
    body('category')
        .isIn(['notice', 'general'])
        .withMessage('유효하지 않은 카테고리입니다.'),
    body('adminPassword')
        .notEmpty()
        .withMessage('관리자 비밀번호가 필요합니다.')
], verifyAdminPassword, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 정보를 확인해주세요.',
                errors: errors.array()
            });
        }

        const { title, content, category, tags, caseInfo } = req.body;

        // 첨부파일 정보 처리
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimeType: file.mimetype
        })) : [];

        const post = new Post({
            title,
            content,
            category,
            tags: tags ? JSON.parse(tags) : [],
            attachments,
            caseInfo: caseInfo ? JSON.parse(caseInfo) : {},
            author: null, // 관리자 글은 author를 null로 설정
            status: 'published',
            isDeleted: false
        });

        await post.save();

        res.status(201).json({
            success: true,
            message: '✅ 게시글이 등록되었습니다.',
            data: { post }
        });

    } catch (error) {
        console.error('게시글 작성 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// ✅ 관리자 전용 - 게시글 수정
router.put('/posts/:postId', upload.array('attachments', 5), [
    body('title')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('제목은 1-200자 사이여야 합니다.')
        .trim(),
    body('content')
        .optional()
        .isLength({ min: 1 })
        .withMessage('내용을 입력해주세요.')
        .trim(),
    body('category')
        .optional()
        .isIn(['notice', 'general'])
        .withMessage('유효하지 않은 카테고리입니다.'),
    body('adminPassword')
        .notEmpty()
        .withMessage('관리자 비밀번호가 필요합니다.')
], verifyAdminPassword, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 정보를 확인해주세요.',
                errors: errors.array()
            });
        }

        const { postId } = req.params;
        const { title, content, category, tags, caseInfo } = req.body;

        const post = await Post.findById(postId);
        if (!post || post.isDeleted) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        // 게시글 정보 업데이트
        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (category !== undefined) post.category = category;
        if (tags !== undefined) post.tags = JSON.parse(tags);
        if (caseInfo !== undefined) post.caseInfo = JSON.parse(caseInfo);

        // 첨부파일 처리
        const { keepAttachments } = req.body;

        let keptFiles = [];
        if (keepAttachments) {
            const keepList = JSON.parse(keepAttachments);
            // keepList 순서대로 정렬 (프론트 드래그 순서 반영)
            keepList.forEach(function (fname) {
                var found = (post.attachments || []).find(att => att.filename === fname);
                if (found) keptFiles.push(found);
            });
        } else {
            keptFiles = post.attachments || [];
        }

        const newAttachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimeType: file.mimetype
        })) : [];

        post.attachments = [...keptFiles, ...newAttachments];

        post.updatedAt = new Date();
        await post.save();

        res.json({
            success: true,
            message: '✅ 게시글이 수정되었습니다.',
            data: { post }
        });

    } catch (error) {
        console.error('게시글 수정 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// ✅ 관리자 전용 - 게시글 삭제
router.delete('/posts/:postId', [
    body('adminPassword')
        .notEmpty()
        .withMessage('관리자 비밀번호가 필요합니다.')
], verifyAdminPassword, async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post || post.isDeleted) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        // 소프트 삭제
        post.isDeleted = true;
        post.deletedAt = new Date();
        await post.save();

        res.json({
            success: true,
            message: '🗑 게시글이 삭제되었습니다.'
        });

    } catch (error) {
        console.error('게시글 삭제 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// =================== 댓글 기능 (필요시 추가) ===================
// 현재는 관리자 전용이므로 댓글 기능은 제외했습니다.
// 필요하면 나중에 추가할 수 있습니다.

module.exports = router;
