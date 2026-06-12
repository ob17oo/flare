import { RegisterForm } from "@/features/auth/RegisterForm/ui/RegisterForm";
import { Suspense } from "react";

export function RegisterPage(){
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <RegisterForm />
        </Suspense>
    )
}