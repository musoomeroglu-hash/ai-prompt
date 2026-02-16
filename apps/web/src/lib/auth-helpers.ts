export const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

export const validatePassword = (password: string) => {
    // Min 8 chars
    return password.length >= 8
}

export const getAuthErrorMessage = (error: string) => {
    if (!error) return ''

    const msg = error.toLowerCase()

    if (msg.includes('invalid login credentials')) return 'Email veya şifre hatalı.'
    if (msg.includes('user already registered')) return 'Bu email adresi zaten kayıtlı.'
    if (msg.includes('rate limit exceeded')) return 'Çok fazla deneme yaptınız, lütfen bekleyin.'
    if (msg.includes('email not confirmed')) return 'Lütfen email adresinizi doğrulayın.'
    if (msg.includes('weak password')) return 'Şifre çok zayıf (en az 8 karakter olmalı).'

    return error
}
