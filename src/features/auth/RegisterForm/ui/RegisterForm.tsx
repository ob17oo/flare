'use client'
import { InputComponent } from "@/shared/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RegisterFormData, registerSchema } from "../lib/schemas/register.schema";
import { registerAction } from "../actions/register.action";


export function RegisterForm(){
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()

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
            await registerAction(data)
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
        <section className="w-full h-screen flex flex-col items-center">
            <div className="w-[35%] my-15 flex flex-col gap-6">
                <div className="flex flex-col items-center">
                    <h1 className="text-4xl text-accent font-bold">FLARE</h1>
                    <p className="text-lg">Сервис по продаже цифровых товаров и услуг.</p>
                </div>
                <section className="flex flex-col gap-5 w-full bg-secondary rounded-2xl p-4">
                    <button onClick={() => router.push('/')} type="button" className="text-xl border-b border-primary pb-2 opacity-50">Регистрация</button>
                    <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-1">
                            <label className={`text-sm opacity-50`}>Email *</label>
                            <InputComponent sizeVariant='medium' type="email" {...register('email')} placeholder="Введите email"/>
                            {errors.email && (
                                <p className="text-sm text-error" role="alert">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={`text-sm opacity-50`}>Логин *</label>
                            <InputComponent sizeVariant="medium" id="login" type="text" {...register('login')} placeholder="Введтие логин"/>
                            { errors.login && (
                                <p className="text-sm text-error">{errors.login.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={`text-sm opacity-50`}>Пароль *</label>
                            <div className="relative">
                                <div className="flex items-center gap-1">
                                    <InputComponent sizeVariant="medium" id="password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Введите пароль"/>
                                    <button className={`absolute top-4 right-4 ${showPassword ? 'opacity-100' : 'opacity-50'}`} type="button" onClick={() => setShowPassword(!showPassword)}>{ showPassword ? <Eye color="white" size={18} /> : <EyeOff color="white" size={18}/>}</button>
                                </div>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-error">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={`text-sm opacity-50`}>Повторите пароль *</label>
                            <div className="relative">
                                <div className="flex items-center gap-1">
                                    <InputComponent sizeVariant="medium" id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} placeholder="Подтвердите пароль"/>
                                    <button className={`absolute top-4 right-4 ${showConfirmPassword ? 'opacity-100' : 'opacity-50'}`} type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{ showConfirmPassword ? <Eye color="white" size={18} /> : <EyeOff color="white" size={18}/>}</button>
                                </div>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-error">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                        <button disabled={isSubmitting || !isValid} type="submit" className={`px-4 py-3 text-lg bg-accent rounded-2xl ${isSubmitting ? 'opacity-50 cursor-not-allowed' : '' }`}>
                            {isSubmitting ? 'Регистрация' : 'Зарегистрироваться'}
                        </button>
                        <div>
                            { serverError && (
                                <p className="text-error text-lg">{serverError}</p>
                            )}
                        </div>
                    </form>
                </section>
            </div>
        </section>
    )
}