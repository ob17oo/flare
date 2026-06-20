'use client'
import { InputComponent, ErrorMessage } from "@/shared/components"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { LoginFormData, loginSchema } from "../lib/schemas/login.schema"

export function LoginForm(){
    const [showPassword, setShowPassword] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: {isValid, errors, isSubmitting},
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: LoginFormData) => {
        try{
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false
            })
            
            if(result?.error){
                setServerError('Неправильно введены данные')
            } else {
                router.push('/')
                router.refresh()
            }

        } catch(error: unknown){
            if(error instanceof Error){
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
                        <span className="text-[16px] font-bold text-[var(--text-primary)]">Авторизация</span>
                        <button type="button" onClick={() => router.push('/')} className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">На главную</button>
                    </div>
                    
                    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="email" className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email *</label>
                            <InputComponent sizeVariant="medium" {...register('email')} type="text" placeholder="Введите email"/>
                            { errors.email && (
                                <p className="text-xs text-[var(--error)] font-medium mt-0.5">{errors.email.message}</p>
                            )}
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="password" className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Пароль *</label>
                            <div className="relative flex items-center">
                                <InputComponent sizeVariant="medium" {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Введите пароль"/>
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
                                {isSubmitting ? 'Вход...' : 'Войти'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => router.push('/register')} 
                                className="w-full h-12 flex items-center justify-center rounded-xl bg-transparent border border-[var(--border-muted)] hover:bg-[var(--bg-layer-3)] text-[var(--text-primary)] font-semibold text-[14px] cursor-pointer transition-colors duration-300"
                            >
                                Создать новый аккаунт
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