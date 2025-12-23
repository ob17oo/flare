'use client'
import { registerAction } from "@/shared/actions/auth/register";
import { InputComponent } from "@/shared/components";
import { RegisterFormData, registerSchema } from "@/shared/schemas/register-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";


export function RegisterPage(){
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

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
                setServerError(error.message)
            }
        }
     }


    return (
        <section className="w-[40%] mx-auto my-4 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center">
                <h2 className="text-4xl text-accent font-bold">FLARE</h2>
                <p className="text-lg">Сервис по продаже цифровых товаров и услуг.</p>
            </div>
            <section className="flex flex-col gap-2 w-full bg-secondary rounded-2xl p-4">
                <h2 className="text-lg">Регистрация</h2>
                <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm">Email *</label>
                        <InputComponent type="email" {...register('email')} placeholder="Введите email"/>
                        {errors.email && (
                            <p className="text-sm text-error" role="alert">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm">Логин *</label>
                        <InputComponent type="text" {...register('login')} placeholder="Введтие логин"/>
                        { errors.login && (
                            <p className="text-sm text-error">{errors.login.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm">Пароль *</label>
                        <div className="flex items-center gap-1">
                            <InputComponent type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Введите пароль"/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)}>Показать</button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-error">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm">Повторите пароль *</label>
                        <div className="flex items-center gap-1">
                            <InputComponent type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} placeholder="Подтвердите пароль"/>
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>Показать</button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-error">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <button disabled={isSubmitting || !isValid} type="submit" className={`px-3 py-2 text-lg bg-accent rounded-2xl ${isSubmitting ? 'opacity-50 cursor-not-allowed' : '' }`}>
                        {isSubmitting ? 'Регистрация' : 'Зарегистрироваться'}
                    </button>
                    <div>
                        { serverError && (
                            <p className="text-error text-lg">{serverError}</p>
                        )}
                    </div>
                </form>
            </section>
        </section>
    )
}