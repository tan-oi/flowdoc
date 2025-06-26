"use client"

import { useParams, useRouter } from "next/navigation";
import { Button } from "./ui/button"
import { useState } from "react";

export function Check() {
    const [num,setNum] = useState(1);
    const router = useRouter();
    const params = useParams()
    
    const addToTheBar = () => {
        const id = crypto.randomUUID();
        // router.replace(`/dashboard/${id}`)   
        router.replace(`/editor/${id}`)

        // window.history.pushState(null, '', `/dashboard/${id}`)

    }
    const increaseNum = () => {
        setNum(p => p+1);
    }

    const id = Array.isArray(params.id) ? params.id[0] : undefined;
    console.log(id);
    if(id === '18e5b412-b84c-418a-9702-ccf532d3efd6') return (
        <>
        done baby
        </>
    )
    return(
        <>
        <Button onClick={addToTheBar}>Add to the bar {num}</Button>
        <Button onClick={increaseNum}>Increase num {num}</Button>
        </>
    )
}