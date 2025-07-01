const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '사용자명은 필수입니다.'],
        unique: true,
        trim: true,
        minlength: [2, '사용자명은 최소 2자 이상이어야 합니다.'],
        maxlength: [20, '사용자명은 최대 20자까지 가능합니다.']
    },
    email: {
        type: String,
        required: [true, '이메일은 필수입니다.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '유효한 이메일 주소를 입력해주세요.']
    },
    password: {
        type: String,
        required: [true, '비밀번호는 필수입니다.'],
        minlength: [8, '비밀번호는 최소 8자 이상이어야 합니다.'],
        select: false // 기본적으로 조회 시 제외
    },
    name: {
        type: String,
        required: [true, '이름은 필수입니다.'],
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[0-9-+()\s]+$/, '유효한 전화번호를 입력해주세요.']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    profile: {
        avatar: String,
        bio: String,
        birthDate: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        }
    },
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 가상 필드: 계정 잠금 여부
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// 비밀번호 해싱 미들웨어
userSchema.pre('save', async function(next) {
    // 비밀번호가 수정되지 않았다면 다음으로
    if (!this.isModified('password')) return next();
    
    try {
        // 비밀번호 해싱
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// 로그인 시도 증가
userSchema.methods.incLoginAttempts = function() {
    // 잠금이 만료되었다면 초기화
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // 5번 실패 시 2시간 잠금
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }
    
    return this.updateOne(updates);
};

// 로그인 성공 시 초기화
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// 이메일 인증 토큰 생성
userSchema.methods.createEmailVerificationToken = function() {
    const token = require('crypto').randomBytes(32).toString('hex');
    this.emailVerificationToken = token;
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24시간
    return token;
};

// 비밀번호 재설정 토큰 생성
userSchema.methods.createPasswordResetToken = function() {
    const token = require('crypto').randomBytes(32).toString('hex');
    this.passwordResetToken = token;
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1시간
    return token;
};

// 인덱스 설정
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

module.exports = mongoose.model('User', userSchema); 