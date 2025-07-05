const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '사용자명은 필수입니다.'],
        unique: true,
        trim: true,
        minlength: [3, '사용자명은 최소 3자 이상이어야 합니다.'],
        maxlength: [30, '사용자명은 최대 30자까지 가능합니다.']
    },
    name: {
        type: String,
        required: [true, '이름은 필수입니다.'],
        trim: true,
        maxlength: [50, '이름은 최대 50자까지 가능합니다.']
    },
    email: {
        type: String,
        required: [true, '이메일은 필수입니다.'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, '비밀번호는 필수입니다.'],
        minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다.']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profile: {
        bio: String,
        avatar: String,
        phone: String,
        organization: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);