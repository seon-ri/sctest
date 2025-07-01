const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, '댓글 내용은 필수입니다.'],
        trim: true,
        maxlength: [1000, '댓글은 최대 1000자까지 가능합니다.']
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, '제목은 필수입니다.'],
        trim: true,
        maxlength: [200, '제목은 최대 200자까지 가능합니다.']
    },
    content: {
        type: String,
        required: [true, '내용은 필수입니다.'],
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    category: {
        type: String,
        enum: ['notice', 'case-cipher', 'general'],
        required: true,
        default: 'general'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [{
        type: String,
        trim: true
    }],
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        mimeType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    comments: [commentSchema],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Case Cipher 전용 필드
    caseInfo: {
        caseNumber: String,
        caseType: String,
        court: String,
        judge: String,
        verdict: String,
        sentence: String,
        caseDate: Date
    },
    // 메타데이터
    meta: {
        description: String,
        keywords: [String],
        ogImage: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 가상 필드: 요약 내용
postSchema.virtual('summary').get(function() {
    const content = typeof this.content === 'string' ? this.content : '';
    return content.length > 200 
        ? content.substring(0, 200) + '...' 
        : content;
});

// 가상 필드: 읽기 시간 (분)
postSchema.virtual('readingTime').get(function() {
    const wordsPerMinute = 200;
    const content = typeof this.content === 'string' ? this.content : '';
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
});

// 조회수 증가 메서드
postSchema.methods.incrementViewCount = function(userId) {
    // 이미 조회한 사용자인지 확인
    const existingView = this.views.find(view => 
        view.user.toString() === userId.toString()
    );
    
    if (!existingView) {
        this.views.push({ user: userId });
        this.viewCount += 1;
        return this.save();
    }
    
    return Promise.resolve(this);
};

// 좋아요 토글 메서드
postSchema.methods.toggleLike = function(userId) {
    const likeIndex = this.likes.indexOf(userId);
    
    if (likeIndex === -1) {
        // 좋아요 추가
        this.likes.push(userId);
        this.likeCount += 1;
    } else {
        // 좋아요 제거
        this.likes.splice(likeIndex, 1);
        this.likeCount -= 1;
    }
    
    return this.save();
};

// 댓글 추가 메서드
postSchema.methods.addComment = function(authorId, content) {
    const comment = {
        author: authorId,
        content: content
    };
    
    this.comments.push(comment);
    this.commentCount += 1;
    
    return this.save();
};

// 댓글 삭제 메서드
postSchema.methods.deleteComment = function(commentId, deletedBy) {
    const comment = this.comments.id(commentId);
    
    if (comment) {
        comment.isDeleted = true;
        comment.deletedAt = new Date();
        comment.deletedBy = deletedBy;
        this.commentCount -= 1;
        
        return this.save();
    }
    
    return Promise.reject(new Error('댓글을 찾을 수 없습니다.'));
};

// 인덱스 설정
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ isPinned: -1, createdAt: -1 });
postSchema.index({ status: 1, category: 1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema); 