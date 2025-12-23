
export function InputComponent(props:React.InputHTMLAttributes<HTMLInputElement>){
    return (
        <input {...props} className="w-full py-2 px-3 border border-accent rounded-2xl outline-0 opacity-70 transition-all duraiton-300 ease-in-out focus:scale-101 focus:opacity-100"/>
    )
}