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
        required: [true, '내용은 필수입니다.']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    category: {
        type: String,
        enum: ['notice', 'general'],
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

postSchema.virtual('summary').get(function() {
    const content = typeof this.content === 'string' ? this.content : '';
    return content.length > 200
        ? content.substring(0, 200) + '...'
        : content;
});

postSchema.virtual('readingTime').get(function() {
    const wordsPerMinute = 200;
    const content = typeof this.content === 'string' ? this.content : '';
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
});

postSchema.methods.incrementViewCount = function(userId) {
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

postSchema.methods.toggleLike = function(userId) {
    const likeIndex = this.likes.indexOf(userId);
    if (likeIndex === -1) {
        this.likes.push(userId);
        this.likeCount += 1;
    } else {
        this.likes.splice(likeIndex, 1);
        this.likeCount -= 1;
    }
    return this.save();
};

postSchema.methods.addComment = function(authorId, content) {
    const comment = { author: authorId, content: content };
    this.comments.push(comment);
    this.commentCount += 1;
    return this.save();
};

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

postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ isPinned: -1, createdAt: -1 });
postSchema.index({ status: 1, category: 1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
