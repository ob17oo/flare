'use client'

import { useEffect } from "react"
import { LockScroll } from "./types"

export const useLockScroll = ({isOpen}:LockScroll) => {
    useEffect(() => {
        if(isOpen){
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    },[isOpen])
}