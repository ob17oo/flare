'use client'
import { InputComponent, ErrorMessage } from "@/shared/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RegisterFormData, registerSchema } from "../lib/schemas/register.schema";
import { registerAction } from "../actions/register.action";


export function RegisterForm(){
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlRefCode = searchParams.get('ref')
    const [showRefInput, setShowRefInput] = useState(!!urlRefCode)
    const [manualRefCode, setManualRefCode] = useState(urlRefCode || '')

    const { 
        register,
        handleSubmit,
        
        formState: { isValid, errors, isSubmitting },
        reset,
     } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            login: '',
            password: '',
            confirmPassword: ''
        }
     })

     const onSubmit = async (data: RegisterFormData) => {
        try{
            setServerError(null)
            await registerAction({ ...data, refCode: manualRefCode || urlRefCode })
            reset()
        } catch(error: unknown){
            if(error instanceof Error){
                if(error.message.includes('NEXT_REDIRECT')){
                    router.push('/login')
                    return
                }
                setServerError(error.message)
            }
        }
     }


    return (
        <section className="w-full min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                    <h1 className="text-[36px] font-extrabold tracking-tight text-[var(--accent)]">FLARE</h1>
                    <p className="text-[14px] text-[var(--text-secondary)] mt-1">Премиальный цифровой сервис для ежедневных покупок</p>
                </div>
                
                <section className="bg-[var(--secondary)] border border-[var(--border-muted)] rounded-2xl p-8 shadow-[var(--modal-shadow)] flex flex-col gap-6">
                    <div className="border-b border-[var(--border-muted)] pb-3 flex justify-between items-center">
                        <span className="text-[16px] font-bold text-[var(--text-primary)]">Регистрация</span>
                        <button type="button" onClick={() => router.push('/login')} className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">Войти</button>
                    </div>
                    
                    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email *</label>
                            <InputComponent sizeVariant='medium' type="email" {...register('email')} placeholder="Введите email"/>
                            {errors.email && (
                                <p className="text-xs text-[var(--error)] font-medium mt-0.5" role="alert">{errors.email.message}</p>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Логин *</label>
                            <InputComponent sizeVariant="medium" id="login" type="text" {...register('login')} placeholder="Введите логин"/>
                            { errors.login && (
                                <p className="text-xs text-[var(--error)] font-medium mt-0.5">{errors.login.message}</p>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Пароль *</label>
                            <div className="relative flex items-center">
                                <InputComponent sizeVariant="medium" id="password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Введите пароль"/>
                                <button 
                                    className="absolute right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    { showPassword ? <Eye size={18} /> : <EyeOff size={18}/>}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-[var(--error)] font-medium mt-0.5">{errors.password.message}</p>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Повторите пароль *</label>
                            <div className="relative flex items-center">
                                <InputComponent sizeVariant="medium" id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} placeholder="Подтвердите пароль"/>
                                <button 
                                    className="absolute right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" 
                                    type="button" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    { showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18}/>}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-[var(--error)] font-medium mt-0.5">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Referral Section */}
                        {!showRefInput ? (
                            <button 
                                type="button" 
                                onClick={() => setShowRefInput(true)} 
                                className="text-[13px] font-semibold text-[var(--accent)] hover:underline hover:text-[var(--accent-hover)] transition-colors cursor-pointer self-start mt-1"
                            >
                                Есть реферальный код?
                            </button>
                        ) : (
                            <div className="flex flex-col gap-1.5 mt-1 animate-in fade-in duration-200">
                                <div className="flex justify-between items-center">
                                    <label className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Реферальный код или ссылка</label>
                                    {!urlRefCode && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowRefInput(false); setManualRefCode(''); }} 
                                            className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                                        >
                                            Скрыть
                                        </button>
                                    )}
                                </div>
                                <InputComponent 
                                    sizeVariant="medium" 
                                    type="text" 
                                    value={manualRefCode} 
                                    onChange={(e) => setManualRefCode(e.target.value)} 
                                    placeholder="Вставьте код или ссылку"
                                />
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-2.5 mt-2">
                            <button 
                                disabled={isSubmitting || !isValid} 
                                type="submit" 
                                className={`w-full h-12 flex items-center justify-center rounded-xl font-bold text-[14px] shadow-sm transition-all duration-300 active:scale-[0.98] ${
                                    isSubmitting || !isValid
                                        ? 'bg-[var(--bg-layer-3)] border border-[var(--border-muted)] text-[var(--text-secondary)] cursor-not-allowed opacity-60' 
                                        : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer'
                                }`}
                            >
                                {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                            </button>
                        </div>
                    </form>
                    
                    {serverError && (
                        <ErrorMessage message={serverError} className="mt-1 justify-center text-center" />
                    )}
                </section>
            </div>
        </section>
    )
}