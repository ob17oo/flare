'use client'
import { InputComponent } from "@/shared/components"
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
        reset
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
        <section className="w-full h-screen flex flex-col items-center">
            <div className="w-[35%] my-15 flex flex-col gap-6">
                <div className="flex flex-col items-center">
                    <h1 className="text-4xl text-accent font-bold">FLARE</h1>
                    <p className="text-lg">Сервис по продаже цифровых товаров и услуг.</p>
                </div>
                <section className="flex flex-col gap-5 w-full bg-secondary rounded-2xl p-4">
                    <button className="text-xl border-b border-primary pb-2 opacity-50" type="button" onClick={() => router.push('/')}>Авторизация</button>
                    <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="email" className="text-sm opacity-50">Email *</label>
                            <InputComponent sizeVariant="medium" {...register('email')} type="text" placeholder="Введите email"/>
                            { errors.email && (
                                <p className="text-sm text-error">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="password" className="text-sm opacity-50">Пароль *</label>
                            <div className="relative">
                                <InputComponent sizeVariant="medium" {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Введите пароль"/>
                                <button className={`absolute top-4 right-4 ${showPassword ? 'opacity-100' : 'opacity-50'}`} type="button" onClick={() => setShowPassword(!showPassword)}>{ showPassword ? <Eye color="white" size={18} /> : <EyeOff color="white" size={18}/>}</button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-error">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button disabled={isSubmitting || !isValid} type="submit" className={`w-full py-3 text-lg bg-accent rounded-2xl ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSubmitting ? 'Вход' : 'Войти'}</button>
                            <button type="button" onClick={() => router.push('/register')} className=" w-full border border-accent rounded-2xl py-3 text-lg">Создать аккаунт</button>
                        </div>
                    </form>
                </section>
            </div>
        </section>
    )
}